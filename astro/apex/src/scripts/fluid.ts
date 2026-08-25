// fluid.ts — the shared GPU fluid-smoke engine (Navier–Stokes: velocity +
// dye half-float fields, vorticity confinement, jacobi pressure), extracted
// from the hero so any surface can run the same smoke. Callers own the canvas
// and the splat triggers (pointer wiring, ambient stirs); the engine owns the
// WebGL state, sizing, visibility pause (IntersectionObserver), and an idle
// gate — a few seconds after the last splat the dye has dissolved to black
// and the loop stops stepping until the next splat. Returns null when WebGL2
// or float render targets are unavailable; the canvas then stays black
// (invisible under mix-blend-mode: screen).

export type Fluid = {
  splat: (x: number, y: number, dx: number, dy: number, color: [number, number, number]) => void;
  brandColor: () => [number, number, number];
};

const SIM_RES = 128;
const DYE_RES = 512;
const DENSITY_DISSIPATION = 0.972;
const VELOCITY_DISSIPATION = 0.99;
const PRESSURE_DECAY = 0.8;
const PRESSURE_ITERATIONS = 18;
const CURL_STRENGTH = 32;
const SPLAT_RADIUS = 0.0016;
const IDLE_MS = 6000;

const VERT = `
  precision highp float;
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;
const FRAG: Record<string, string> = {
  splat: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uTarget; uniform float uAspect; uniform vec3 uColor;
    uniform vec2 uPoint; uniform float uRadius;
    void main() {
      vec2 p = vUv - uPoint; p.x *= uAspect;
      vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }`,
  advection: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uVelocity; uniform sampler2D uSource;
    uniform vec2 uTexel; uniform float uDt; uniform float uDissipation;
    void main() {
      vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
      gl_FragColor = uDissipation * texture2D(uSource, coord);
      gl_FragColor.a = 1.0;
    }`,
  divergence: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uVelocity; uniform vec2 uTexel;
    void main() {
      float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
      float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
      float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
      float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  curl: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uVelocity; uniform vec2 uTexel;
    void main() {
      float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
      float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
      float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
      float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
      gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
    }`,
  vorticity: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uVelocity; uniform sampler2D uCurl;
    uniform float uStrength; uniform float uDt; uniform vec2 uTexel;
    void main() {
      float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
      float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
      float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
      float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= uStrength * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy + force * uDt;
      gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  pressure: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexel;
    void main() {
      float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
      float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
      float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
      float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
      float div = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexel;
    void main() {
      float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
      float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
      float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
      float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
      vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }`,
  clear: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uTexture; uniform float uValue;
    void main() { gl_FragColor = uValue * texture2D(uTexture, vUv); }`,
  display: `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() { gl_FragColor = vec4(texture2D(uTexture, vUv).rgb, 1.0); }`,
};

// Brand palette — signal red carries the smoke, bone appears rarely.
function brandColor(): [number, number, number] {
  const r = Math.random();
  const k = 0.12 + Math.random() * 0.12;
  if (r < 0.12) return [0.9 * k, 0.88 * k, 0.84 * k];
  if (r < 0.3) return [1.4 * k, 0.32 * k, 0.1 * k];
  return [1.5 * k, 0.07 * k, 0.1 * k];
}

export function createFluid(canvas: HTMLCanvasElement): Fluid | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  }) as WebGL2RenderingContext | null;
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const vert = compile(gl.VERTEX_SHADER, VERT);
  type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
  const programs: Record<string, Prog> = {};
  for (const [name, src] of Object.entries(FRAG)) {
    const p = gl.createProgram()!;
    gl.attachShader(p, vert);
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.linkProgram(p);
    const u: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(p, i)!;
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    programs[name] = { p, u };
  }

  // Fullscreen triangle.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  type FBO = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number; texel: [number, number] };
  const createFBO = (w: number, h: number, internal: number, format: number, filter: number): FBO => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { fb, tex, w, h, texel: [1 / w, 1 / h] };
  };
  type DoubleFBO = { read: FBO; write: FBO; swap: () => void };
  const createDouble = (w: number, h: number, internal: number, format: number, filter: number): DoubleFBO => {
    const a = createFBO(w, h, internal, format, filter);
    const b = createFBO(w, h, internal, format, filter);
    const d = { read: a, write: b, swap() { const t = d.read; d.read = d.write; d.write = t; } };
    return d;
  };

  const res = (base: number) => {
    const a = canvas.width / Math.max(1, canvas.height);
    return a > 1
      ? { w: Math.round(base * a), h: base }
      : { w: base, h: Math.max(1, Math.round(base / a)) };
  };

  let velocity: DoubleFBO, dye: DoubleFBO, pressure: DoubleFBO, curlFBO: FBO, divFBO: FBO;
  const initSim = () => {
    const s = res(SIM_RES);
    const d = res(DYE_RES);
    velocity = createDouble(s.w, s.h, gl.RG16F, gl.RG, gl.LINEAR);
    dye = createDouble(d.w, d.h, gl.RGBA16F, gl.RGBA, gl.LINEAR);
    pressure = createDouble(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
    curlFBO = createFBO(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
    divFBO = createFBO(s.w, s.h, gl.R16F, gl.RED, gl.NEAREST);
  };
  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * dpr));
  };
  sizeCanvas();
  initSim();
  new ResizeObserver(() => {
    sizeCanvas();
    initSim();
  }).observe(canvas);

  const blit = (target: FBO | null) => {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const bindTex = (loc: WebGLUniformLocation | null, tex: WebGLTexture, unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  };

  let lastActivity = performance.now();
  function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    lastActivity = performance.now();
    const { p, u } = programs.splat;
    gl!.useProgram(p);
    gl!.uniform1f(u.uAspect, canvas.width / Math.max(1, canvas.height));
    gl!.uniform2f(u.uPoint, x, y);
    gl!.uniform1f(u.uRadius, SPLAT_RADIUS);
    bindTex(u.uTarget, velocity.read.tex, 0);
    gl!.uniform3f(u.uColor, dx, dy, 0);
    blit(velocity.write);
    velocity.swap();
    bindTex(u.uTarget, dye.read.tex, 0);
    gl!.uniform3f(u.uColor, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function step(dt: number) {
    let pr: Prog;
    pr = programs.curl;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    bindTex(pr.u.uVelocity, velocity.read.tex, 0);
    blit(curlFBO);

    pr = programs.vorticity;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    gl!.uniform1f(pr.u.uStrength, CURL_STRENGTH);
    gl!.uniform1f(pr.u.uDt, dt);
    bindTex(pr.u.uVelocity, velocity.read.tex, 0);
    bindTex(pr.u.uCurl, curlFBO.tex, 1);
    blit(velocity.write);
    velocity.swap();

    pr = programs.divergence;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    bindTex(pr.u.uVelocity, velocity.read.tex, 0);
    blit(divFBO);

    pr = programs.clear;
    gl!.useProgram(pr.p);
    gl!.uniform1f(pr.u.uValue, PRESSURE_DECAY);
    bindTex(pr.u.uTexture, pressure.read.tex, 0);
    blit(pressure.write);
    pressure.swap();

    pr = programs.pressure;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    bindTex(pr.u.uDivergence, divFBO.tex, 1);
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      bindTex(pr.u.uPressure, pressure.read.tex, 0);
      blit(pressure.write);
      pressure.swap();
    }

    pr = programs.gradient;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    bindTex(pr.u.uPressure, pressure.read.tex, 0);
    bindTex(pr.u.uVelocity, velocity.read.tex, 1);
    blit(velocity.write);
    velocity.swap();

    pr = programs.advection;
    gl!.useProgram(pr.p);
    gl!.uniform2f(pr.u.uTexel, velocity.read.texel[0], velocity.read.texel[1]);
    gl!.uniform1f(pr.u.uDt, dt);
    gl!.uniform1f(pr.u.uDissipation, VELOCITY_DISSIPATION);
    bindTex(pr.u.uVelocity, velocity.read.tex, 0);
    bindTex(pr.u.uSource, velocity.read.tex, 0);
    blit(velocity.write);
    velocity.swap();
    gl!.uniform1f(pr.u.uDissipation, DENSITY_DISSIPATION);
    bindTex(pr.u.uVelocity, velocity.read.tex, 0);
    bindTex(pr.u.uSource, dye.read.tex, 1);
    blit(dye.write);
    dye.swap();
  }

  // Run only while the canvas is on screen AND recently poked — IDLE_MS
  // after the last splat the dye has dissolved to black, so stop stepping.
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  }).observe(canvas);

  let last = performance.now();
  function frame(now: number) {
    if (!canvas.isConnected) return;
    if (visible && now - lastActivity < IDLE_MS) {
      const dt = Math.min((now - last) / 1000, 0.0166);
      step(dt);
      const { p, u } = programs.display;
      gl!.useProgram(p);
      bindTex(u.uTexture, dye.read.tex, 0);
      blit(null);
    }
    last = now;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { splat, brandColor };
}
