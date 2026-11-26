// Home page motion kit. Everything is progressive: without this script (or with reduced motion) every element is simply visible.
//   [data-split]     heading: words wrapped so they can rise in one after another when the heading enters the viewport.
//   [data-reveal]    element fades/rises in on enter (optional style --d: delay).
//   [data-inview]    only gets .is-in on enter (the block's own CSS decides what that does).
//   [data-scrub]     gets --s (0 → 1) scrubbed by scroll as it comes up the screen (data-scrub-span: share of the screen, default 0.4).
//   [data-progress]  element gets --p (0 → 1) while it travels through the viewport; drives parallax and scrubbed effects.
//   [data-tilt]      tilts a few degrees toward the pointer on hover.
//   [data-stack]     sticky card stack: each card shrinks a touch as the next one slides over it.
//   [data-accordion] <details> open/close with a smooth height animation.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

if (!reduce) {
  document.documentElement.classList.add("has-motion");

  // ── split headings into words ──
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    const text = (el.textContent ?? "").trim();
    if (!text) return;
    el.setAttribute("aria-label", text);
    el.innerHTML = text
      .split(/\s+/)
      .map((w, i) => `<span class="w" aria-hidden="true"><span class="wi" style="--i:${i}">${w.replace(/</g, "&lt;")}</span></span>`)
      .join(" ");
  });

  // ── [data-words]: text that reveals word by word, scrubbed by scroll (the About Us statement's effect): each word rises
  // 0.62em, scales from 0.985 and fades in, one after another, as the text travels up the screen ──
  const wordEls = [...document.querySelectorAll<HTMLElement>("[data-words]")].map((el) => {
    const text = (el.textContent ?? "").trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="sw" aria-hidden="true">${w.replace(/</g, "&lt;")}</span>`).join(" ");
    return { el, words: [...el.querySelectorAll<HTMLElement>(".sw")] };
  });
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const wordsFrame = (vh: number) => {
    wordEls.forEach(({ el, words }) => {
      // 0 when the text's top enters at the bottom of the screen, 1 when it reaches 45% from the top
      const t = clamp((vh - el.getBoundingClientRect().top) / (vh * 0.55));
      const n = Math.max(words.length, 1);
      words.forEach((w, i) => {
        const a = (i / n) * 0.7;
        const k = easeOut(clamp((t - a) / 0.3));
        w.style.opacity = k.toFixed(3);
        w.style.transform = `translate3d(0, ${(0.62 * (1 - k)).toFixed(3)}em, 0) scale(${(0.985 + 0.015 * k).toFixed(4)})`;
      });
    });
  };

  // ── reveal on enter (once) ──
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
  );
  document.querySelectorAll("[data-split], [data-reveal], [data-inview]").forEach((el) => io.observe(el));

  // ── scroll progress (only for elements near the viewport) ──
  const tracked = [...document.querySelectorAll<HTMLElement>("[data-progress]")];
  const near = new Set<HTMLElement>();
  const nio = new IntersectionObserver((entries) => entries.forEach((e) => {
    e.isIntersecting ? near.add(e.target as HTMLElement) : near.delete(e.target as HTMLElement);
  }), { rootMargin: "25% 0px 25% 0px" });
  tracked.forEach((el) => nio.observe(el));

  const stacks = [...document.querySelectorAll<HTMLElement>("[data-stack]")];
  // [data-scrub]: --s 0 → 1 (eased) while the element's top travels from the bottom of the screen to 60% up it.
  const scrubs = [...document.querySelectorAll<HTMLElement>("[data-scrub]")];
  // Odometer reels: each digit rolls from 0 to its value as its tile travels up the screen (scrubbed both ways). The reel shows
  // the digit at the current position and the neighbours in proportion to how far between two digits it is.
  const reelLast = new Map<HTMLElement, number>();
  // after scrolling stops, settle the neighbours away
  let settle = 0;
  addEventListener("scroll", () => { clearTimeout(settle); settle = window.setTimeout(() => requestAnimationFrame(frame), 140); }, { passive: true });
  const odos = [...document.querySelectorAll<HTMLElement>("[data-odometer]")].map((tile) => ({
    tile,
    reels: [...tile.querySelectorAll<HTMLElement>(".reel")].map((r) => ({
      col: r.querySelector<HTMLElement>(".reel__col")!, items: [...r.querySelectorAll<HTMLElement>(".reel__col > span")],
      target: Number(r.dataset.digit) + 10 * Number(r.dataset.spins || 1),
    })),
  }));
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    near.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(4));
    });
    wordsFrame(vh);
    scrubs.forEach((el) => {
      const span = Number(el.dataset.scrubSpan) || 0.4; // the share of the screen height the reveal takes
      const t = clamp((vh - el.getBoundingClientRect().top) / (vh * span));
      el.style.setProperty("--s", (t * t * (3 - 2 * t)).toFixed(4));
    });
    odos.forEach(({ tile, reels }) => {
      const r = tile.getBoundingClientRect();
      // 0 when the tile's top enters at the bottom of the screen, 1 when it reaches 35% from the top
      const t = clamp((vh - r.top) / (vh * 0.65));
      const e = 1 - Math.pow(1 - t, 3);
      reels.forEach(({ col, items, target }) => {
        const pos = target * e;
        col.style.setProperty("--pos", pos.toFixed(3));
        // at rest only the digit on the line shows; while rolling, the digits above and below show too (more, the faster it rolls)
        const speed = Math.min(1, Math.abs(pos - (reelLast.get(col) ?? pos)) * 2.5);
        reelLast.set(col, pos);
        items.forEach((it, k) => {
          const d = Math.abs(pos - k);
          const o = Math.max(0, 1 - d) + (d <= 1.5 ? speed * (1 - d / 1.5) : 0);
          it.style.opacity = Math.min(1, o).toFixed(3);
        });
      });
    });
    stacks.forEach((stack) => {
      const cards = ([...stack.children] as HTMLElement[]).filter((c) => !c.classList.contains("stack__rest"));
      // --depth: how many later cards lie over this one (0 → n-1, fractional while they slide in). Deeper = smaller and lighter.
      const rects = cards.map((c) => ({ top: c.offsetTop, h: c.offsetHeight, live: c.getBoundingClientRect().top }));
      cards.forEach((card, i) => {
        let depth = 0;
        for (let j = i + 1; j < cards.length; j++) depth += clamp(1 - (rects[j].live - rects[i].live) / Math.max(1, rects[i].h));
        card.style.setProperty("--depth", depth.toFixed(4));
      });
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();

  // ── pointer effects ──
  if (fine) {
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }
}

// ── accordion with a smooth height (also without the motion class: plain <details> still works) ──
document.querySelectorAll<HTMLDetailsElement>("[data-accordion] details").forEach((d) => {
  const summary = d.querySelector("summary")!;
  const body = d.querySelector<HTMLElement>(".acc-body")!;
  summary.addEventListener("click", (e) => {
    if (reduce || !body) return;
    e.preventDefault();
    if (d.open) {
      const h = body.offsetHeight;
      d.classList.add("is-closing");
      body.animate([{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 380, easing: "cubic-bezier(.77,0,.175,1)" })
        .onfinish = () => { d.open = false; d.classList.remove("is-closing"); };
    } else {
      d.open = true;
      const h = body.offsetHeight;
      body.animate([{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 460, easing: "cubic-bezier(.23,1,.32,1)" });
    }
  });
});

// ── carousel ([data-carousel] list + [data-carousel-prev/next] buttons in the same section): the card nearest the centre is
// .is-active; the buttons scroll one card; the middle card starts centred. Works with swipe / trackpad / keyboard scrolling too.
document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((track) => {
  const section = track.closest("section") ?? document;
  const cards = [...track.children] as HTMLElement[];
  const prev = section.querySelector<HTMLButtonElement>("[data-carousel-prev]");
  const next = section.querySelector<HTMLButtonElement>("[data-carousel-next]");
  let active = 0;
  const center = (i: number) => {
    const c = cards[i]; if (!c) return;
    track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2 });
  };
  const update = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, d = Infinity;
    cards.forEach((c, i) => { const dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = i; } });
    active = best;
    cards.forEach((c, i) => c.classList.toggle("is-active", i === best));
    if (prev) prev.disabled = best === 0;
    if (next) next.disabled = best === cards.length - 1;
  };
  prev?.addEventListener("click", () => center(Math.max(0, active - 1)));
  next?.addEventListener("click", () => center(Math.min(cards.length - 1, active + 1)));
  let raf = 0;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", () => center(active));
  // start on the middle card so a neighbour peeks at each side (instant, before the smooth scrolling kicks in)
  const start = cards.length > 2 ? Math.floor((cards.length - 1) / 2) : 0;
  track.style.scrollBehavior = "auto"; center(start); track.style.scrollBehavior = "";
  update();
});
