/* watch-lab.js — DisaWatch Exploded Horology stage.
   Custom element <watch-lab>. Requires global THREE (r128).
   API (window.WatchLab): setConfig({bezel,strap,movement,crown}), setMuted(bool),
   setSelected(id|null), setOptions({accent, autoRotate, volume}).
   Emits window CustomEvent 'watchlab:part' {detail:{id, nx}} on part click (null id = deselect). */
(function () {
  const TAU = Math.PI * 2;
  // Parts whose whole GROUP must not rotate on click. case/strap stay completely still;
  // the crown group stays put too — only its knurled grip winds (see _crownInner below).
  const STATIC_ON_SELECT = { case: 1, crown: 1, strap: 1 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);

  function whenThree(cb) {
    if (window.THREE) return cb();
    const iv = setInterval(() => { if (window.THREE) { clearInterval(iv); cb(); } }, 30);
  }

  class WatchLab extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      this.style.display = 'block';
      this.style.width = '100%';
      this.style.height = '100%';
      this.style.minHeight = '100vh';
      this.style.background = 'radial-gradient(120% 90% at 50% 40%, #12121a 0%, #08080c 55%, #030304 100%)';
      whenThree(() => this._start());
    }
    disconnectedCallback() { this._dead = true; cancelAnimationFrame(this._raf); this._removeShield(); }

    /* ---------------- public API ---------------- */
    setConfig(cfg) {
      this._cfg = Object.assign({}, this._cfg, cfg);
      if (this._ready) this._applyConfig();
    }
    setMuted(m) {
      this._muted = !!m;
      if (!m) this._ensureAudio();
    }
    setSelected(id) { this._select(id, false); }
    setViewMode(mode) {
      this._viewMode = mode || 'scroll';
      if (!this._ready) return;
      const on = this._viewMode !== 'scroll';
      if (on && !this._orbit) this._orbit = { th: 0.55, ph: 1.05, d: 9 };
      if (this._viewMode === 'hand') {
        this._buildArm();
        this._arm.visible = true;
        this._orbit.d = Math.max(this._orbit.d, 13);
        this._orbit.th = 0.9; this._orbit.ph = 1.0;
      } else if (this._arm) this._arm.visible = false;
      if (on) this._addShield(); else this._removeShield();
    }
    setOptions(o) {
      o = o || {};
      if (o.accent) { this._accent = new THREE.Color(o.accent); this._applyAccent && this._applyAccent(); }
      if (o.autoRotate !== undefined) this._autoRotate = !!o.autoRotate;
      if (o.volume !== undefined) this._volume = clamp(o.volume, 0, 1);
    }

    /* ---------------- boot ---------------- */
    _start() {
      const T = THREE;
      this._cfg = this._cfg || { bezel: 'steel', strap: 'leather', movement: 'dw01', crown: 'classic', dial: 'anthracite' };
      this._muted = this._muted !== undefined ? this._muted : true;
      this._volume = this._volume !== undefined ? this._volume : 0.7;
      this._autoRotate = this._autoRotate !== undefined ? this._autoRotate : true;
      this._accent = this._accent || new T.Color('#c8a24b');
      this._explode = 0;
      this._selected = null;
      this._hover = null;
      this._spin = 0; // selected-part spin momentum
      this._mouse = { x: 0, y: 0 };

      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      this.style.position = this.style.position || 'relative';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new T.Scene();
      this._scene = scene;
      const camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
      this._camera = camera;

      /* lights */
      scene.add(new T.AmbientLight(0x404652, 0.7));
      const key = new T.DirectionalLight(0xfff2dd, 1.15); key.position.set(4, 6, 5); scene.add(key);
      const rim = new T.DirectionalLight(0x8fb0ff, 0.55); rim.position.set(-5, 3, -4); scene.add(rim);
      const under = new T.PointLight(0xd8b26a, 0.3, 12); under.position.set(0, -3.5, 2); scene.add(under);
      const front = new T.PointLight(0xaab6cc, 0.35, 20); front.position.set(0, 1.5, 6); scene.add(front);

      /* materials */
      const std = (o) => new T.MeshStandardMaterial(o);
      this._mats = {
        steel: std({ color: 0xc9cdd4, metalness: 1, roughness: 0.3 }),
        steelDark: std({ color: 0x878c96, metalness: 1, roughness: 0.42 }),
        gold: std({ color: 0xd8ab5e, metalness: 1, roughness: 0.26 }),
        dlc: std({ color: 0x2a2d33, metalness: 0.9, roughness: 0.5 }),
        brass: std({ color: 0xcaa24f, metalness: 1, roughness: 0.34 }),
        rhodium: std({ color: 0xb9c1cc, metalness: 1, roughness: 0.24 }),
        dark: std({ color: 0x15161a, metalness: 0.6, roughness: 0.6 }),
        leather: std({ color: 0x462813, metalness: 0.02, roughness: 0.72 }),
        rubber: std({ color: 0x1e2126, metalness: 0.05, roughness: 0.95 }),
        ruby: std({ color: 0xa81233, metalness: 0.2, roughness: 0.2, emissive: 0x33030d }),
        glass: new T.MeshPhysicalMaterial({ color: 0x9fb6c8, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0, clearcoat: 1, side: T.DoubleSide })
      };

      this._buildWatch();
      this._buildDust();

      /* input */
      const ray = new T.Raycaster();
      const ndc = new T.Vector2();
      const pick = (ev) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(this._watch.children, true);
        for (const h of hits) {
          let o = h.object;
          while (o && !(o.userData && o.userData.partId)) o = o.parent;
          if (o) return o.userData.partId;
        }
        return null;
      };
      this._pick = pick;
      renderer.domElement.addEventListener('pointerdown', (ev) => {
        const id = pick(ev);
        this._select(id, true);
      });
      renderer.domElement.addEventListener('pointermove', (ev) => {
        this._mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = (ev.clientY / window.innerHeight) * 2 - 1;
        if (ev.pointerType === 'mouse') {
          const id = pick(ev);
          if (id !== this._hover) { this._hover = id; renderer.domElement.style.cursor = id ? 'pointer' : 'default'; }
        }
      });

      const resize = () => {
        const w = this.clientWidth || window.innerWidth, h = this.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);
      if (window.ResizeObserver) new ResizeObserver(resize).observe(this);

      this._clock = new T.Clock();
      this._ready = true;
      this._applyConfig();
      window.WatchLab = this;
      window.dispatchEvent(new Event('watchlab:ready'));
      this._loop();
    }

    /* ---------------- watch geometry ---------------- */
    _buildWatch() {
      const T = THREE, M = this._mats;
      const watch = new T.Group();
      watch.rotation.z = -0.12;
      this._scene.add(watch);
      this._watch = watch;
      this._parts = [];

      // register a part: id, group, assembled y, exploded y, radial spread, spin behaviour
      const reg = (id, g, ay, ey, opts) => {
        opts = opts || {};
        g.userData.partId = id;
        g.userData.pd = {
          ay, ey,
          ax: g.position.x, az: g.position.z,
          radial: opts.radial || 1,
          delay: opts.delay || 0,
          spin: opts.spin || 0 // idle spin speed
        };
        g.position.y = ay;
        watch.add(g);
        this._parts.push(g);
        return g;
      };
      const mesh = (geo, mat, g) => { const m = new T.Mesh(geo, mat.clone ? mat.clone() : mat); if (g) g.add(m); return m; };

      /* case middle (stays put) */
      {
        const g = new T.Group();
        const wall = mesh(new T.CylinderGeometry(1.5, 1.44, 0.42, 96, 1, true), M.steel, g);
        wall.material.side = T.DoubleSide;
        const topRing = mesh(new T.RingGeometry(1.27, 1.5, 96), M.steel, g);
        topRing.rotation.x = -Math.PI / 2; topRing.position.y = 0.21;
        const botCap = mesh(new T.CircleGeometry(1.44, 96), M.steelDark, g);
        botCap.rotation.x = Math.PI / 2; botCap.position.y = -0.21;
        const inner = mesh(new T.CylinderGeometry(1.28, 1.28, 0.32, 64), M.dark, g);
        inner.position.y = -0.06;
        // chamfer ring
        const cham = mesh(new T.TorusGeometry(1.47, 0.035, 12, 96), M.rhodium, g);
        cham.rotation.x = Math.PI / 2; cham.position.y = 0.19;
        // lugs — 4, tapered, tilted down
        const lugMat = new T.MeshStandardMaterial({ color: 0x9aa0aa, metalness: 0.9, roughness: 0.34 });
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
          const lug = new T.Group();
          const lb = mesh(new T.BoxGeometry(0.2, 0.12, 0.5), lugMat, lug);
          lb.scale.set(1, 1, 1);
          const ltip = mesh(new T.BoxGeometry(0.2, 0.09, 0.16), lugMat, lug);
          ltip.position.set(0, -0.045, sz * 0.3);
          ltip.rotation.x = sz * 0.3;
          lug.position.set(sx * 0.58, -0.04, sz * 1.38);
          lug.rotation.x = sz * 0.16;
          g.add(lug);
        }
        reg('case', g, 0, 0, { delay: 0 });
      }

      /* crown (customizable) */
      {
        const g = new T.Group();
        const inner = new T.Group();
        inner.rotation.z = Math.PI / 2; // axis along x
        g.add(inner);
        this._crownInner = inner;
        this._crownVariants = {};
        this._crownMeshes = [];
        const cm = (geo, parent) => { const m = mesh(geo, M.steel, parent); this._crownMeshes.push(m); return m; };
        // classic: fluted cylinder + cap
        {
          const v = new T.Group();
          const lp = [[0.0, -0.095], [0.12, -0.095], [0.15, -0.06], [0.155, 0.0], [0.15, 0.05], [0.125, 0.08], [0.105, 0.082], [0.105, 0.1], [0.055, 0.108], [0.0, 0.11]];
          cm(new T.LatheGeometry(lp.map(p => new T.Vector2(p[0], p[1])), 48), v);
          for (let i = 0; i < 18; i++) {
            const rib = cm(new T.BoxGeometry(0.024, 0.13, 0.026), v);
            const a = (i / 18) * TAU;
            rib.position.set(Math.cos(a) * 0.152, -0.01, Math.sin(a) * 0.152);
            rib.rotation.y = -a;
          }
          const logo = mesh(new T.CylinderGeometry(0.052, 0.052, 0.02, 24), M.gold, v);
          logo.position.y = 0.106;
          logo.userData.fixedMat = true;
          inner.add(v);
          this._crownVariants.classic = v;
        }
        // onion: bulbous vintage
        {
          const v = new T.Group();
          const bulbPts = [[0.0, -0.17], [0.055, -0.165], [0.07, -0.1], [0.075, -0.06], [0.13, -0.045], [0.168, 0.005], [0.172, 0.045], [0.14, 0.095], [0.085, 0.13], [0.0, 0.145]];
          cm(new T.LatheGeometry(bulbPts.map(p => new T.Vector2(p[0], p[1])), 48), v);
          for (let i = 0; i < 22; i++) {
            const rib = cm(new T.BoxGeometry(0.014, 0.12, 0.016), v);
            const a = (i / 22) * TAU;
            rib.position.set(Math.cos(a) * 0.163, 0.02, Math.sin(a) * 0.163);
            rib.rotation.y = -a;
          }
          inner.add(v);
          this._crownVariants.onion = v;
        }
        // guarded: compact screw-down between two guards
        {
          const v = new T.Group();
          const bodyPts = [[0.0, -0.08], [0.11, -0.08], [0.132, -0.045], [0.135, 0.0], [0.128, 0.045], [0.1, 0.072], [0.0, 0.078]];
          cm(new T.LatheGeometry(bodyPts.map(p => new T.Vector2(p[0], p[1])), 40), v);
          for (let i = 0; i < 12; i++) {
            const rib = cm(new T.BoxGeometry(0.03, 0.11, 0.032), v);
            const a = (i / 12) * TAU;
            rib.position.set(Math.cos(a) * 0.132, -0.005, Math.sin(a) * 0.132);
            rib.rotation.y = -a;
          }
          // guards flank along z (world), i.e. local x of inner… add to g not inner
          const gd1 = cm(new T.SphereGeometry(0.16, 20, 14), g);
          gd1.scale.set(1.5, 0.72, 0.68); gd1.position.set(-0.1, 0, 0.25); gd1.rotation.y = 0.45;
          const gd2 = cm(new T.SphereGeometry(0.16, 20, 14), g);
          gd2.scale.set(1.5, 0.72, 0.68); gd2.position.set(-0.1, 0, -0.25); gd2.rotation.y = -0.45;
          this._crownGuards = [gd1, gd2];
          inner.add(v);
          this._crownVariants.guarded = v;
        }
        // stem
        const stem = mesh(new T.CylinderGeometry(0.045, 0.045, 0.3, 12), M.rhodium, g);
        stem.rotation.z = Math.PI / 2;
        stem.position.x = -0.18;
        g.position.set(1.66, 0, 0);
        this._crownGroup = g;
        reg('crown', g, 0, 1.0, { delay: 0.05, radial: 1.55 });
      }

      /* sapphire crystal — domed */
      {
        const g = new T.Group();
        const c = mesh(new T.CylinderGeometry(1.3, 1.34, 0.07, 64), M.glass, g);
        const dome = mesh(new T.SphereGeometry(2.6, 48, 24, 0, TAU, 0, 0.53), M.glass, g);
        dome.scale.set(1, 0.28, 1);
        dome.position.y = -0.62;
        reg('crystal', g, 0.34, 3.35, { delay: 0.0, spin: 0.15 });
      }

      /* bezel (customizable) — stepped with coin edge */
      {
        const g = new T.Group();
        this._bezelMeshes = [];
        const top = mesh(new T.TorusGeometry(1.38, 0.09, 24, 96), M.steel, g);
        top.rotation.x = Math.PI / 2;
        this._bezelMeshes.push(top);
        const ring = mesh(new T.CylinderGeometry(1.47, 1.5, 0.12, 96, 1, true), M.steel, g);
        ring.material.side = T.DoubleSide;
        ring.position.y = -0.06;
        this._bezelMeshes.push(ring);
        const under = mesh(new T.RingGeometry(1.3, 1.49, 96), M.steel, g);
        under.rotation.x = Math.PI / 2; under.position.y = -0.12;
        this._bezelMeshes.push(under);
        // coin edge
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU;
          const tooth = mesh(new T.BoxGeometry(0.025, 0.1, 0.045), M.steel, g);
          tooth.position.set(Math.cos(a) * 1.495, -0.06, Math.sin(a) * 1.495);
          tooth.rotation.y = -a;
          this._bezelMeshes.push(tooth);
        }
        reg('bezel', g, 0.3, 2.7, { delay: 0.03, spin: 0.2 });
      }

      /* hands — faceted dauphine */
      {
        const g = new T.Group();
        const hour = new T.Group(), minute = new T.Group(), second = new T.Group();
        const dauphine = (len, w, parent, mat) => {
          const s = new T.Shape();
          s.moveTo(0, -0.1); s.lineTo(w / 2, 0.06); s.lineTo(0.008, len); s.lineTo(-0.008, len); s.lineTo(-w / 2, 0.06); s.closePath();
          const geo = new T.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false });
          geo.rotateX(-Math.PI / 2);
          return mesh(geo, mat, parent);
        };
        dauphine(0.62, 0.11, hour, M.rhodium);
        dauphine(0.98, 0.08, minute, M.rhodium);
        minute.position.y = 0.035;
        const sMat = new T.MeshStandardMaterial({ color: 0xc8a24b, metalness: 0.8, roughness: 0.3 });
        const sb = mesh(new T.BoxGeometry(0.02, 0.014, 1.12), sMat, second); sb.position.z = 0.38;
        const cw = mesh(new T.CylinderGeometry(0.065, 0.065, 0.018, 20), sMat, second); cw.position.z = -0.26;
        second.position.y = 0.065;
        this._secondMat = sMat;
        mesh(new T.CylinderGeometry(0.075, 0.085, 0.11, 24), M.rhodium, g);
        const capJewel = mesh(new T.CylinderGeometry(0.03, 0.03, 0.125, 16), M.ruby, g);
        g.add(hour, minute, second);
        this._hands = { hour, minute, second };
        reg('hands', g, 0.26, 2.05, { delay: 0.06 });
      }

      /* dial */
      {
        const g = new T.Group();
        const tex = this._dialTexture((this._cfg || {}).dial);
        const d = mesh(new T.CylinderGeometry(1.26, 1.26, 0.03, 64), new T.MeshStandardMaterial({ map: tex, metalness: 0.35, roughness: 0.55 }), g);
        d.rotation.y = Math.PI / 2;
        this._dialMat = d.material;
        // rehaut ring
        const rh = mesh(new T.TorusGeometry(1.22, 0.022, 8, 96), M.steelDark, g);
        rh.rotation.x = Math.PI / 2; rh.position.y = 0.02;
        for (let i = 0; i < 12; i++) {
          const wide = i % 3 === 0;
          const idx = mesh(new T.BoxGeometry(wide ? 0.08 : 0.045, 0.035, wide ? 0.22 : 0.17), M.gold, g);
          const a = (i / 12) * TAU;
          idx.position.set(Math.sin(a) * 1.03, 0.025, Math.cos(a) * 1.03);
          idx.rotation.y = -a;
        }
        reg('dial', g, 0.17, 1.45, { delay: 0.09 });
      }

      /* gear train — meshed chain from barrel */
      {
        const g = new T.Group();
        this._gearMeshes = [];
        // positions computed so pitch circles are tangent: barrel(r.5) → G0 → G1 → escape; G0 → G2 → G3
        const wBase = 0.055; // barrel angular speed, rad/s — slow
        const chain = [
          { teeth: 34, r: 0.40, x: 0.26, z: -0.24, h: 0.0,  w: -wBase * 0.5 / 0.40 },
          { teeth: 18, r: 0.26, x: 0.66, z: 0.29,  h: -0.045, w: wBase * 0.5 / 0.26 },
          { teeth: 40, r: 0.50, x: -0.46, z: 0.30, h: -0.02, w: wBase * 0.5 / 0.50 },
          { teeth: 14, r: 0.20, x: -0.25, z: 0.96, h: 0.035, w: -wBase * 0.5 / 0.20 }
        ];
        for (const c of chain) {
          const gm = mesh(this._gearGeo(c.teeth, c.r), M.brass, g);
          gm.position.set(c.x, c.h, c.z);
          gm.userData.w = c.w;
          this._gearMeshes.push(gm);
          const j = mesh(new T.CylinderGeometry(0.045, 0.045, 0.05, 16), M.ruby, g);
          j.position.set(c.x, c.h + 0.06, c.z);
          const pinion = mesh(new T.CylinderGeometry(0.055, 0.055, 0.12, 12), M.rhodium, g);
          pinion.position.set(c.x, c.h, c.z);
        }
        reg('gears', g, 0.02, 0.8, { delay: 0.13 });
      }

      /* balance wheel + hairspring + escapement */
      {
        const g = new T.Group();
        const wheel = new T.Group();
        const rimT = mesh(new T.TorusGeometry(0.34, 0.045, 16, 48), M.gold, wheel);
        rimT.rotation.x = Math.PI / 2;
        // timing screws on rim
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * TAU + 0.4;
          const sc = mesh(new T.CylinderGeometry(0.028, 0.028, 0.06, 10), M.gold, wheel);
          sc.rotation.z = Math.PI / 2;
          sc.position.set(Math.cos(a) * 0.39, 0, Math.sin(a) * 0.39);
          sc.rotation.y = -a;
        }
        for (let i = 0; i < 3; i++) {
          const spoke = mesh(new T.BoxGeometry(0.62, 0.03, 0.05), M.gold, wheel);
          spoke.rotation.y = (i / 3) * Math.PI;
        }
        const staff = mesh(new T.CylinderGeometry(0.02, 0.02, 0.22, 12), M.rhodium, wheel);
        // hairspring
        const pts = [];
        for (let i = 0; i <= 120; i++) {
          const a = i / 120 * TAU * 3.2, r = 0.03 + (i / 120) * 0.24;
          pts.push(new T.Vector3(Math.cos(a) * r, 0.09, Math.sin(a) * r));
        }
        const spring = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 140, 0.006, 6), M.rhodium, g);
        const j = mesh(new T.CylinderGeometry(0.05, 0.05, 0.04, 16), M.ruby, g); j.position.y = 0.13;
        // balance cock bridge
        const cock = mesh(new T.BoxGeometry(0.14, 0.03, 0.52), M.rhodium, g);
        cock.position.set(0, 0.145, -0.26);
        // escape wheel + pallet fork
        const esc = mesh(this._gearGeo(15, 0.17, 0.035), M.brass, g);
        esc.position.set(-0.52, -0.02, -0.18);
        this._escape = esc;
        const fork = new T.Group();
        const stemF = mesh(new T.BoxGeometry(0.04, 0.025, 0.3), M.rhodium, fork);
        stemF.position.z = 0.15;
        const horns = mesh(new T.BoxGeometry(0.16, 0.025, 0.05), M.rhodium, fork);
        horns.position.z = 0.3;
        const pj1 = mesh(new T.BoxGeometry(0.03, 0.03, 0.05), M.ruby, fork); pj1.position.set(-0.06, 0, 0.02);
        const pj2 = mesh(new T.BoxGeometry(0.03, 0.03, 0.05), M.ruby, fork); pj2.position.set(0.06, 0, 0.02);
        fork.position.set(-0.3, -0.02, -0.02);
        fork.rotation.y = 0.6;
        g.add(fork);
        this._pallet = fork;
        g.add(wheel);
        this._balance = wheel;
        g.position.set(0.72, 0, 0.55);
        reg('balance', g, -0.02, 0.42, { delay: 0.16, radial: 1.7 });
      }

      /* mainspring barrel */
      {
        const g = new T.Group();
        const b = mesh(new T.CylinderGeometry(0.48, 0.48, 0.18, 48), M.rhodium, g);
        const lid = mesh(this._gearGeo(36, 0.52, 0.03), M.brass, g);
        lid.position.y = 0.1;
        // coiled spring hint on top
        const pts = [];
        for (let i = 0; i <= 100; i++) {
          const a = i / 100 * TAU * 4, r = 0.06 + (i / 100) * 0.34;
          pts.push(new T.Vector3(Math.cos(a) * r, 0.13, Math.sin(a) * r));
        }
        mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 120, 0.012, 6), new T.MeshStandardMaterial({ color: 0x4a5560, metalness: 0.9, roughness: 0.4 }), g);
        this._barrel = g;
        g.position.set(-0.62, 0, -0.42);
        reg('barrel', g, -0.06, -0.5, { delay: 0.16, radial: 1.7, spin: 0.25 });
      }

      /* main plate */
      {
        const g = new T.Group();
        const p = mesh(new T.CylinderGeometry(1.18, 1.18, 0.07, 64), M.steelDark, g);
        // côtes de Genève stripes
        for (let i = -4; i <= 4; i++) {
          const s = mesh(new T.BoxGeometry(0.11, 0.012, 2.1), M.rhodium, g);
          s.position.set(i * 0.24, 0.04, 0);
          s.scale.z = Math.sqrt(Math.max(0.05, 1 - Math.pow(Math.abs(i * 0.24) / 1.15, 2)));
        }
        reg('plate', g, -0.14, -1.05, { delay: 0.2 });
      }

      /* rotor */
      {
        const g = new T.Group();
        const rot = new T.Group();
        const half = mesh(new T.CylinderGeometry(1.0, 1.0, 0.05, 48, 1, false, 0, Math.PI), M.gold, rot);
        const weight = mesh(new T.TorusGeometry(0.92, 0.07, 12, 48, Math.PI), M.gold, rot);
        weight.rotation.x = Math.PI / 2;
        const hub = mesh(new T.CylinderGeometry(0.14, 0.14, 0.08, 24), M.rhodium, rot);
        g.add(rot);
        this._rotor = rot;
        this._rotorGroup = g;
        reg('rotor', g, -0.24, -1.65, { delay: 0.24, spin: 1.4 });
      }

      /* caseback */
      {
        const g = new T.Group();
        const cb = mesh(new T.CylinderGeometry(1.36, 1.3, 0.1, 64), M.steel, g);
        const win = mesh(new T.CylinderGeometry(1.0, 1.0, 0.11, 48), M.glass, g);
        reg('caseback', g, -0.32, -2.3, { delay: 0.28, spin: 0.15 });
      }

      /* straps — smooth curved band (extruded along wrist arc) + oyster bracelet */
      {
        const Rw = 2.3, C = 1.80; // wrist radius, vertical offset
        const roundedRect = (w, h, r) => {
          const s = new T.Shape();
          const x = -w / 2, y = -h / 2;
          s.moveTo(x + r, y);
          s.lineTo(x + w - r, y);
          s.quadraticCurveTo(x + w, y, x + w, y + r);
          s.lineTo(x + w, y + h - r);
          s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          s.lineTo(x + r, y + h);
          s.quadraticCurveTo(x, y + h, x, y + h - r);
          s.lineTo(x, y + r);
          s.quadraticCurveTo(x, y, x + r, y);
          return s;
        };
        this._bandMeshes = [];
        this._stitchMeshes = [];
        this._linkMeshes = [];
        const mkSide = (sign) => {
          const g = new T.Group();
          const anchorZ = sign * 1.55;
          const bandG = new T.Group(), linkG = new T.Group();
          g.add(bandG, linkG);
          const arc = (rad, xOff, th0, th1, n) => {
            const pts = [];
            for (let i = 0; i <= n; i++) {
              const th = th0 + (th1 - th0) * (i / n);
              pts.push(new T.Vector3(xOff, rad * Math.cos(th) - C, sign * rad * Math.sin(th) - anchorZ));
            }
            return new T.CatmullRomCurve3(pts);
          };
          // leather / rubber band — padded cushion profile, one smooth extrusion
          const paddedProfile = () => {
            const s = new T.Shape();
            const w = 0.5, t = 0.052;
            s.moveTo(-w / 2, 0);
            s.quadraticCurveTo(-w / 2 + 0.07, t, 0, t * 1.35);
            s.quadraticCurveTo(w / 2 - 0.07, t, w / 2, 0);
            s.quadraticCurveTo(w / 2 - 0.07, -t, 0, -t * 1.35);
            s.quadraticCurveTo(-w / 2 + 0.07, -t, -w / 2, 0);
            s.closePath();
            return s;
          };
          const bandCurve = arc(Rw, 0, 0.70, 1.52, 24);
          const band = mesh(new T.ExtrudeGeometry(paddedProfile(), { steps: 64, bevelEnabled: false, extrudePath: bandCurve }), M.leather, bandG);
          this._bandMeshes.push(band);
          // stitching rails just proud of the outer surface
          for (const sx of [-1, 1]) {
            const st = mesh(new T.TubeGeometry(arc(Rw + 0.058, sx * 0.19, 0.74, 1.48, 24), 48, 0.008, 6), new T.MeshStandardMaterial({ color: 0xd8c49a, roughness: 0.9 }), bandG);
            this._stitchMeshes.push(st);
          }
          // tail holes on the 12 o'clock side
          if (sign > 0) {
            for (let i = 0; i < 5; i++) {
              const th = 1.24 + i * 0.055;
              const hole = mesh(new T.CylinderGeometry(0.019, 0.019, 0.032, 10), M.dark, bandG);
              hole.position.set(0, (Rw + 0.068) * Math.cos(th) - C, sign * (Rw + 0.068) * Math.sin(th) - anchorZ);
              hole.rotation.x = -sign * th;
            }
          }
          // keeper loop + buckle on the 6 o'clock side
          if (sign < 0) {
            const th1 = 1.28;
            const keeper = mesh(new T.BoxGeometry(0.58, 0.19, 0.12), M.leather, bandG);
            keeper.position.set(0, Rw * Math.cos(th1) - C, sign * Rw * Math.sin(th1) - anchorZ);
            keeper.rotation.x = -sign * th1;
            this._bandMeshes.push(keeper);
            const thB = 1.56;
            const bk = new T.Group();
            const frame = mesh(new T.TorusGeometry(0.23, 0.032, 10, 28), M.steel, bk);
            frame.scale.set(1.2, 1, 0.75);
            const prong = mesh(new T.CylinderGeometry(0.016, 0.016, 0.4, 8), M.steel, bk);
            prong.rotation.x = Math.PI / 2;
            bk.position.set(0, Rw * Math.cos(thB) - C, sign * Rw * Math.sin(thB) - anchorZ);
            bk.rotation.x = -sign * thB;
            bandG.add(bk);
            this._buckle = bk;
          }
          // oyster bracelet — tight three-link rows
          const rows = 14;
          for (let i = 0; i < rows; i++) {
            const th = 0.72 + (i / (rows - 1)) * 0.83;
            const row = new T.Group();
            const lc = mesh(new T.BoxGeometry(0.24, 0.082, 0.15), M.steel, row);
            const lo1 = mesh(new T.BoxGeometry(0.145, 0.066, 0.15), M.steelDark, row); lo1.position.x = 0.2;
            const lo2 = mesh(new T.BoxGeometry(0.145, 0.066, 0.15), M.steelDark, row); lo2.position.x = -0.2;
            row.position.set(0, Rw * Math.cos(th) - C, sign * Rw * Math.sin(th) - anchorZ);
            row.rotation.x = -sign * th;
            linkG.add(row);
            this._linkMeshes.push(lc, lo1, lo2);
          }
          // spring bar between lugs
          const bar = mesh(new T.CylinderGeometry(0.03, 0.03, 1.1, 10), M.rhodium, g);
          bar.rotation.z = Math.PI / 2;
          bar.position.set(0, -0.05, sign * 1.5 - anchorZ);
          g.position.set(0, 0, anchorZ);
          g.userData.bandG = bandG; g.userData.linkG = linkG;
          return g;
        };
        const top = mkSide(1), bot = mkSide(-1);
        this._strapGroups = [top, bot];
        reg('strap', top, 0, -0.15, { delay: 0.1, radial: 2.4 });
        bot.userData.partId = 'strap';
        bot.userData.pd = { ay: 0, ey: -0.15, ax: 0, az: bot.position.z, radial: 2.4, delay: 0.1, spin: 0 };
        bot.position.y = 0;
        this._watch.add(bot);
        this._parts.push(bot);
      }
    }

    _gearGeo(teeth, r, depth) {
      const T = THREE;
      const s = new T.Shape();
      const N = teeth * 4;
      const rIn = r * 0.82;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * TAU;
        const ph = i % 4;
        const rr = (ph === 1 || ph === 2) ? r : rIn;
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
      }
      s.closePath();
      const hole = new T.Path();
      hole.absarc(0, 0, r * 0.18, 0, TAU, true);
      s.holes.push(hole);
      const g = new T.ExtrudeGeometry(s, { depth: depth || 0.06, bevelEnabled: false });
      g.rotateX(-Math.PI / 2);
      g.translate(0, (depth || 0.06) / 2, 0);
      return g;
    }

    _dialTexture(style) {
      const T = THREE;
      const palettes = {
        anthracite: { c0: '#20232b', c1: '#0d0f14', ray: '#aab4c4', text: '#cfd6e2', sub: '#8a93a3', burst: true },
        salmon: { c0: '#e2a583', c1: '#b26a48', ray: '#f8d8c0', text: '#4a2c1e', sub: '#6e4632', burst: true },
        midnight: { c0: '#1d3160', c1: '#0a1226', ray: '#7f9bd4', text: '#d5def1', sub: '#8fa1c6', burst: true },
        porcelain: { c0: '#f4eddd', c1: '#ded2b8', ray: '#ffffff', text: '#3a3428', sub: '#6f6753', burst: false }
      };
      const P = palettes[style] || palettes.anthracite;
      const c = this._dialCanvas || (this._dialCanvas = document.createElement('canvas'));
      c.width = c.height = 512;
      const x = c.getContext('2d');
      const grad = x.createRadialGradient(256, 256, 40, 256, 256, 280);
      grad.addColorStop(0, P.c0);
      grad.addColorStop(1, P.c1);
      x.fillStyle = grad;
      x.fillRect(0, 0, 512, 512);
      if (P.burst) {
        x.globalAlpha = 0.08;
        x.strokeStyle = P.ray;
        for (let i = 0; i < 180; i++) {
          const a = (i / 180) * TAU;
          x.beginPath();
          x.moveTo(256 + Math.cos(a) * 50, 256 + Math.sin(a) * 50);
          x.lineTo(256 + Math.cos(a) * 250, 256 + Math.sin(a) * 250);
          x.stroke();
        }
      } else {
        x.globalAlpha = 0.05;
        x.strokeStyle = '#8a8172';
        for (let r = 60; r < 250; r += 14) {
          x.beginPath();
          x.arc(256, 256, r, 0, TAU);
          x.stroke();
        }
      }
      x.globalAlpha = 1;
      x.fillStyle = P.text;
      x.font = '600 26px Georgia, serif';
      x.textAlign = 'center';
      x.fillText('D I S A W A T C H', 256, 160);
      x.font = '400 15px Georgia, serif';
      x.fillStyle = P.sub;
      x.fillText('CALIBRE DW-01', 256, 366);
      if (!this._dialTex) {
        this._dialTex = new T.CanvasTexture(c);
        this._dialTex.anisotropy = 4;
      } else {
        this._dialTex.needsUpdate = true;
      }
      return this._dialTex;
    }

    _buildDust() {
      const T = THREE;
      const n = 260, pos = new Float32Array(n * 3);
      for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 14;
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3));
      const m = new T.PointsMaterial({ color: 0x8fa0bb, size: 0.025, transparent: true, opacity: 0.35, depthWrite: false });
      this._dust = new T.Points(g, m);
      this._scene.add(this._dust);
    }

    /* ---------------- config / selection ---------------- */
    _applyConfig() {
      const M = this._mats, c = this._cfg;
      const bezelMat = c.bezel === 'gold' ? M.gold : c.bezel === 'dlc' ? M.dlc : M.steel;
      this._bezelMeshes.forEach(m => { m.material = bezelMat.clone(); });
      // crown follows bezel material; variant per config
      if (this._crownMeshes) this._crownMeshes.forEach(m => {
        if (!m.userData.fixedMat) m.material = bezelMat.clone();
      });
      if (this._crownVariants) {
        const style = c.crown || 'classic';
        Object.keys(this._crownVariants).forEach(k => { this._crownVariants[k].visible = k === style; });
        if (this._crownGuards) this._crownGuards.forEach(m => { m.visible = style === 'guarded'; });
      }
      // strap: band (leather/rubber) vs bracelet links
      const isBracelet = c.strap === 'bracelet';
      const strapMat = c.strap === 'rubber' ? M.rubber : M.leather;
      if (this._strapGroups) this._strapGroups.forEach(g => {
        g.userData.bandG.visible = !isBracelet;
        g.userData.linkG.visible = isBracelet;
      });
      if (this._bandMeshes) this._bandMeshes.forEach(m => { m.material = strapMat.clone(); });
      if (this._stitchMeshes) this._stitchMeshes.forEach(m => { m.visible = c.strap === 'leather'; });
      if (this._buckle) this._buckle.visible = !isBracelet;
      // dial face
      const face = c.dial || 'anthracite';
      if (this._dialMat && face !== this._appliedDial) {
        this._appliedDial = face;
        this._dialMat.map = this._dialTexture(face);
        this._dialMat.metalness = face === 'porcelain' ? 0.08 : 0.35;
        this._dialMat.roughness = face === 'porcelain' ? 0.35 : 0.55;
        this._dialMat.needsUpdate = true;
      }
      const mv = c.movement;
      this._rotorGroup.visible = mv !== 'dw01';
      const trainMat = mv === 'dw03' ? M.gold : mv === 'dw02' ? M.rhodium : M.brass;
      this._gearMeshes.forEach(m => { m.material = trainMat.clone(); });
      this._tickHz = mv === 'dw03' ? 6 : mv === 'dw02' ? 5 : 4; // ticks per second
    }

    _select(id, emit) {
      if (id === this._selected) { if (!id) return; }
      this._selected = id;
      this._selImpulse = id ? 2.4 : 0; // brief inspect impulse for free-spin parts
      // reset emissives
      this._parts.forEach(p => p.traverse(o => {
        if (o.isMesh && o.material && o.material.emissive) o.material.emissiveIntensity = 0;
      }));
      if (emit) {
        let nx = 0;
        if (id) {
          const g = this._parts.find(p => p.userData.partId === id);
          if (g) {
            const v = new THREE.Vector3();
            g.getWorldPosition(v);
            v.project(this._camera);
            nx = clamp(v.x, -1, 1);
          }
        }
        window.dispatchEvent(new CustomEvent('watchlab:part', { detail: { id: id, nx } }));
      }
    }

    /* ---------------- 3D view mode ---------------- */
    _addShield() {
      if (this._shield) return;
      const s = document.createElement('div');
      s.style.cssText = 'position:fixed;inset:0;z-index:30;cursor:grab;touch-action:none;';
      document.body.appendChild(s);
      this._prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      let drag = null;
      s.addEventListener('pointerdown', (e) => {
        drag = { x: e.clientX, y: e.clientY, moved: 0 };
        s.setPointerCapture(e.pointerId);
        s.style.cursor = 'grabbing';
      });
      s.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag.x = e.clientX; drag.y = e.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        this._orbit.th -= dx * 0.006;
        this._orbit.ph = clamp(this._orbit.ph - dy * 0.006, 0.2, 2.9);
      });
      s.addEventListener('pointerup', (e) => {
        s.style.cursor = 'grab';
        if (drag && drag.moved < 6 && this._pick) this._select(this._pick(e), true);
        drag = null;
      });
      s.addEventListener('wheel', (e) => {
        e.preventDefault();
        this._orbit.d = clamp(this._orbit.d + e.deltaY * 0.012, 3.5, 20);
      }, { passive: false });
      this._shield = s;
    }
    _removeShield() {
      if (!this._shield) return;
      this._shield.remove();
      this._shield = null;
      document.body.style.overflow = this._prevOverflow || '';
    }
    _buildArm() {
      if (this._arm) return;
      const T = THREE;
      const g = new T.Group();
      const skin = new T.MeshStandardMaterial({ color: 0xa87954, roughness: 0.8 });
      const suit = new T.MeshStandardMaterial({ color: 0x232a3a, roughness: 0.92 });
      const shirt = new T.MeshStandardMaterial({ color: 0xe9e6de, roughness: 0.9 });
      const add = (geo, mat, x) => {
        const m = new T.Mesh(geo, mat);
        m.rotation.z = Math.PI / 2;
        m.position.x = x;
        g.add(m);
        return m;
      };
      // forearm + wrist (under the straps)
      add(new T.CylinderGeometry(2.16, 2.16, 4.4, 48), skin, 0.6);
      add(new T.CylinderGeometry(1.85, 2.16, 1.5, 48), skin, 3.5);
      // hand
      const hand = new T.Mesh(new T.SphereGeometry(2.0, 32, 24), skin);
      hand.scale.set(1.3, 0.52, 0.92);
      hand.position.set(5.3, 0.15, 0);
      g.add(hand);
      const thumb = new T.Mesh(new T.CylinderGeometry(0.42, 0.56, 2.2, 16), skin);
      thumb.position.set(4.7, -0.05, 1.8);
      thumb.rotation.set(0, 0.5, 1.15);
      g.add(thumb);
      for (let i = 0; i < 4; i++) {
        const f = new T.Mesh(new T.CylinderGeometry(0.4, 0.46, 2.2, 14), skin);
        f.rotation.z = Math.PI / 2;
        f.position.set(7.5, 0.35 - i * 0.12, -1.2 + i * 0.82);
        g.add(f);
      }
      // shirt cuff + suit sleeve
      add(new T.CylinderGeometry(2.34, 2.34, 0.9, 48), shirt, -2.3);
      add(new T.CylinderGeometry(2.48, 2.8, 6.5, 48), suit, -6.1);
      const btn = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.1, 16), new T.MeshStandardMaterial({ color: 0x2e2620, roughness: 0.5 }));
      btn.position.set(-2.3, 0, 2.48);
      btn.rotation.x = Math.PI / 2;
      g.add(btn);
      g.position.set(0, -1.8, 0);
      g.visible = false;
      this._arm = g;
      this._watch.add(g);
    }

    /* ---------------- audio ---------------- */
    _ensureAudio() {
      if (this._actx) { this._actx.resume && this._actx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this._actx = ctx;
      this._master = ctx.createGain();
      this._master.gain.value = 0.9;
      this._pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (this._pan) { this._pan.connect(this._master); } 
      this._master.connect(ctx.destination);
      this._nextTick = ctx.currentTime + 0.1;
      this._hiTick = false;
    }
    _tick(t, hi) {
      const ctx = this._actx;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = hi ? 4300 : 3400;
      const g = ctx.createGain();
      const v = 0.16 * this._volume;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, v), t + 0.0015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(g).connect(this._pan || this._master);
      osc.start(t); osc.stop(t + 0.06);
      // low mechanical thump
      const o2 = ctx.createOscillator();
      o2.type = 'sine'; o2.frequency.value = hi ? 210 : 170;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(Math.max(0.001, v * 0.5), t + 0.002);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o2.connect(g2).connect(this._pan || this._master);
      o2.start(t); o2.stop(t + 0.07);
    }
    _audioFrame() {
      if (this._muted || !this._actx) return;
      const ctx = this._actx;
      const hz = this._tickHz || 4;
      while (this._nextTick < ctx.currentTime + 0.15) {
        this._tick(this._nextTick, this._hiTick);
        this._hiTick = !this._hiTick;
        this._nextTick += 1 / hz;
      }
      // pan follows balance wheel on screen
      if (this._pan && this._balance) {
        const v = new THREE.Vector3();
        this._balance.getWorldPosition(v);
        v.project(this._camera);
        this._pan.pan.value = clamp(v.x * 1.4, -1, 1);
      }
    }

    /* ---------------- frame loop ---------------- */
    _loop() {
      if (this._dead || !this._ready) return;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => this._loop());
      const t = this._clock.getElapsedTime();

      /* scroll → explode */
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const start = window.innerHeight * 0.45;
      const end = Math.max(start + 1, max - window.innerHeight * 1.15);
      const inView = this._viewMode && this._viewMode !== 'scroll';
      const target = inView ? 0 : (window.__labExplodeOverride != null ? window.__labExplodeOverride : clamp((window.scrollY - start) / (end - start), 0, 1));
      this._explode += (target - this._explode) * 0.07;
      const p = this._explode;

      /* per-part positions */
      for (const g of this._parts) {
        const d = g.userData.pd;
        const local = smooth(clamp((p - d.delay) / 0.72, 0, 1));
        g.position.y = d.ay + (d.ey - d.ay) * local;
        const rf = 1 + (d.radial - 1) * local;
        g.position.x = d.ax * rf;
        g.position.z = d.az * rf;
        // idle free-spin + brief inspect impulse — but NOT for static-on-select parts
        // (case/strap don't move; the crown group stays put while only its grip winds).
        const sel = this._selected === g.userData.partId;
        if (!STATIC_ON_SELECT[g.userData.partId] && (d.spin || sel)) {
          const speed = (sel ? this._selImpulse : 0) + d.spin * (0.15 + local * 0.5);
          g.rotation.y += speed * 0.016;
        }
        if (sel) {
          g.traverse(o => {
            if (o.isMesh && o.material && o.material.emissive) {
              o.material.emissive.copy(this._accent);
              o.material.emissiveIntensity = 0.18 + Math.sin(t * 5) * 0.08;
            }
          });
        }
      }

      /* movement animation */
      this._selImpulse = (this._selImpulse || 0) * 0.976;
      const hz = this._tickHz || 4;
      if (this._balance) this._balance.rotation.y = Math.sin(t * hz * Math.PI) * (this._selected === 'balance' ? 0.95 : 0.55);
      if (this._escape) this._escape.rotation.y = -Math.floor(t * hz) * (TAU / 15) * 0.5;
      if (this._pallet) this._pallet.rotation.y = 0.6 + (Math.sin(t * hz * Math.PI) > 0 ? 0.14 : -0.14);
      if (this._crownInner) {
        // only the knurled crown head winds — back and forth — while the crown is selected;
        // eases back to rest when deselected. The crown group itself never rotates.
        this._crownInner.rotation.y = this._selected === 'crown'
          ? Math.sin(t * 5) * 0.7
          : this._crownInner.rotation.y * 0.85;
      }
      if (this._gearMeshes) this._gearMeshes.forEach((gm) => {
        gm.rotation.y += gm.userData.w * 0.016 * (this._selected === 'gears' ? 1 + this._selImpulse * 2.5 : 1);
      });
      if (this._rotor && this._rotorGroup.visible) {
        this._rotor.rotation.y = this._selected === 'rotor' ? this._rotor.rotation.y + 0.08 : Math.sin(t * 0.7) * 0.9;
      }
      /* hands — dead-beat seconds */
      if (this._hands) {
        const now = new Date();
        const s = now.getSeconds() + Math.floor(now.getMilliseconds() / 1000 * hz) / hz;
        const m = now.getMinutes() + s / 60;
        const h = (now.getHours() % 12) + m / 60;
        this._hands.second.rotation.y = -(s / 60) * TAU;
        this._hands.minute.rotation.y = -(m / 60) * TAU;
        this._hands.hour.rotation.y = -(h / 12) * TAU;
      }

      /* watch rotation + camera */
      const cam = this._camera;
      if (inView) {
        this._watch.rotation.y += (0 - this._watch.rotation.y) * 0.08;
        const o = this._orbit;
        cam.position.set(o.d * Math.sin(o.ph) * Math.sin(o.th), o.d * Math.cos(o.ph), o.d * Math.sin(o.ph) * Math.cos(o.th));
        cam.lookAt(0, this._viewMode === 'hand' ? -1.1 : 0, 0);
      } else {
        const rotT = (this._autoRotate ? t * 0.06 : 0) + this._mouse.x * 0.22;
        this._watch.rotation.y += (rotT - this._watch.rotation.y) * 0.05;
        const R = 7.1 + p * 4.5;
        const el = 0.95 - p * 0.45 + this._mouse.y * -0.08;
        cam.position.set(Math.sin(0.35) * R * Math.cos(el * 0.5), Math.sin(el) * R * 0.62, Math.cos(0.35) * R * Math.cos(el * 0.5));
        cam.lookAt(-1.15 + p * 2.15, p * 0.55, 0);
      }

      if (this._dust) this._dust.rotation.y = t * 0.012;

      this._audioFrame();
      this._renderer.render(this._scene, this._camera);
    }
  }

  customElements.define('watch-lab', WatchLab);
})();
