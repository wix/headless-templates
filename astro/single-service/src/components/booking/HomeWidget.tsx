// Home, the booking card in the hero: centred service heading, the location, a month header with week arrows, a 7-day strip and
// ALL of the selected day's times together (no morning/afternoon groups). A time goes straight to Confirm; "View more availability"
// opens the service page calendar. Client-only: availability is session- and time-zone-specific. A slot is re-checked on Confirm.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDuration, formatPrice, type ServiceDTO } from "../../lib/services";
import { goToConfirm } from "./calendar-kit";
import { BookingPanel, useWeekAvailability } from "./BookingPanel";

export default function HomeWidget({ service, eyebrow }: { service: ServiceDTO; eyebrow?: string }) {
  const av = useWeekAvailability(service);
  const { tz, picked } = av;
  const host = useMemo(() => document.getElementById("main"), []); // the shell lives in <main>, in page coordinates
  const slot = useRef<HTMLDivElement>(null);  // reserves the card's place in the hero
  const shell = useRef<HTMLDivElement>(null); // the frame that travels: card -> bar
  const full = useRef<HTMLDivElement>(null);  // the card's content
  const barLayer = useRef<HTMLDivElement>(null); // the bar's content
  const [pinned, setPinned] = useState(false); // the bar is the visible state: it takes clicks and screen readers

  useEffect(() => {
    // One frame (the shell) travels between three places as the page scrolls, all driven by scroll position so it reverses cleanly:
    //   A  the card in the hero         p: card -> pill, as the hero scrolls up under the header (0 at its top reaching the header, 1 at 60% under)
    //   P  the pill, docked dead centre in the header
    //   B  the card in the "Ready to get started?" block   q: pill -> card, as that block's slot scrolls into view (the reverse move)
    // The slots (#A, #B) only reserve space and give the live target rectangles. The card's content fades out over the first part of
    // A->P and fades back in over the last part of P->B; the pill's content does the opposite. Phones and tablets (and any header without
    // a free centre) get no pill: the card stays in the hero and block B stays empty.
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PILL_H = 40, PILL_MAX = 280, PILL_MIN = 220;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf = 0, shown = false, on = false;
    const update = () => {
      raf = 0;
      const slotA = slot.current, sh = shell.current, f = full.current, bl = barLayer.current, main = host;
      if (!slotA || !sh || !f || !bl || !main) return;
      const slotB = document.getElementById("hw-slot-b");
      const h = f.offsetHeight;
      if (h) { slotA.style.height = `${h}px`; }
      const vw = document.documentElement.clientWidth, vh = innerHeight;
      const A = slotA.getBoundingClientRect();
      f.style.width = `${A.width}px`;

      // Is there room in the middle of the header, between its logo and its links, for the pill to sit dead centre?
      const header = document.querySelector("header");
      const hh = header?.getBoundingClientRect().height ?? 0;
      const logo = header?.querySelector(".wrap > a")?.getBoundingClientRect();
      const links = header?.querySelector(".wrap > div")?.getBoundingClientRect();
      const room = logo && links ? Math.min(vw / 2 - (logo.right + 16), links.left - 16 - vw / 2) * 2 : 0;
      const pillW = Math.min(PILL_MAX, room);
      const dock = vw >= 1024 && hh > 0 && pillW >= PILL_MIN;
      // On a wide screen block B sits well below the heading, so the card only sets off once the heading has faded away.
      if (slotB) { slotB.style.height = dock && h ? `${h}px` : "0px"; slotB.style.marginTop = dock ? "62svh" : ""; }
      const B = slotB?.getBoundingClientRect();

      const pill = { left: vw / 2 - pillW / 2, top: (hh - PILL_H) / 2, width: pillW, height: PILL_H };
      const cardA = { left: A.left, top: A.top, width: A.width, height: h || A.height };
      const cardB = B ? { left: B.left, top: B.top, width: B.width, height: h || B.height } : cardA;

      let p = 0, q = 0;
      if (dock) {
        p = clamp((hh - A.top) / (hh + Math.max(h, 1) * 0.6));
        if (B) {
          // From the block's slot entering the lower part of the screen until the whole card sits in view (or, for a tall card, just under the header).
          // The card sets off when the closing heading is half faded: that heading fades over the 240px of scroll after its centre passes
          // the middle of the screen (see the page script), so half-way is 120px past it.
          const hd = document.getElementById("cta-title")?.getBoundingClientRect();
          const from = hd ? vh / 2 - 120 + (B.top - (hd.top + hd.height / 2)) : vh * 0.9;
          const to = Math.min(from - 120, Math.max(hh + 40, vh - Math.max(h, 1) - 60));
          q = clamp((from - B.top) / (from - to));
        }
        if (reduce) { p = A.bottom < hh ? 1 : 0; q = B && B.top < vh * 0.5 ? 1 : 0; }
        if (p < 1) q = 0; // B only starts once the card has become the pill
      }
      const m = main.getBoundingClientRect();
      const put = (r: { left: number; top: number; width: number; height: number }, radius: number) =>
        Object.assign(sh.style, { position: "absolute", left: `${r.left - m.left}px`, top: `${r.top - m.top}px`, bottom: "auto", width: `${r.width}px`, height: `${r.height}px`, borderRadius: `${radius}px` });
      let docked = false;
      if (q >= 1) put(cardB, 20);
      else if (q > 0) put({ left: lerp(pill.left, cardB.left, q), top: lerp(pill.top, cardB.top, q), width: lerp(pill.width, cardB.width, q), height: lerp(pill.height, cardB.height, q) }, lerp(PILL_H / 2, 20, q));
      else if (p >= 1) { docked = true; Object.assign(sh.style, { position: "fixed", left: `${pill.left}px`, top: `${pill.top}px`, bottom: "auto", width: `${pill.width}px`, height: `${pill.height}px`, borderRadius: `${PILL_H / 2}px` }); }
      else put({ left: lerp(cardA.left, pill.left, p), top: lerp(cardA.top, pill.top, p), width: lerp(cardA.width, pill.width, p), height: lerp(cardA.height, pill.height, p) }, lerp(20, PILL_H / 2, p));

      // Over the header while it is the pill (or on its way); under it once it has grown into the card in block B, so it never covers the header.
      sh.style.zIndex = dock && q <= 0.5 ? "90" : "20"; // the header is z-80: only the docked pill (and the card on its way to it) is above it
      sh.dataset.dock = dock ? "header" : "";
      const pillness = q > 0 ? 1 - q : p; // 0 = card, 1 = pill
      sh.dataset.pill = dock && pillness > 0.6 ? "1" : "";
      sh.style.boxShadow = pillness <= 0 ? "none" : `inset 0 0 0 1px rgb(219 219 219 / ${pillness}), 0 4px 16px rgb(20 20 20 / ${0.06 * pillness})`;
      const cardOpacity = q > 0 ? clamp((q - 0.6) / 0.4) : clamp(1 - p / 0.4);
      const pillOpacity = q > 0 ? clamp(1 - q / 0.4) : clamp((p - 0.6) / 0.35);
      f.style.opacity = String(cardOpacity);
      f.style.pointerEvents = cardOpacity > 0.6 ? "auto" : "none";
      bl.style.opacity = String(pillOpacity);
      bl.style.pointerEvents = pillOpacity > 0.6 ? "auto" : "none";
      const barOn = pillOpacity > 0.5;
      if (barOn !== on) { on = barOn; setPinned(barOn); }
      if (!shown) { shown = true; sh.style.visibility = "visible"; }
      void docked;
    };
    const check = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    const ro = new ResizeObserver(check);
    if (full.current) ro.observe(full.current);
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    return () => { ro.disconnect(); removeEventListener("scroll", check); removeEventListener("resize", check); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
    <div className="hw-place" ref={slot} />
    {host && createPortal(
    <div className="hw-shell" ref={shell} style={{ visibility: "hidden" }}>
    <div className="hw-full" ref={full} role="group" aria-label={`Book ${service.name}`}>
      <BookingPanel av={av} service={service} eyebrow={eyebrow} />
    </div>

    <div className="hw-barlayer" ref={barLayer} aria-hidden={!pinned} {...(pinned ? {} : { inert: "" as unknown as boolean })}>
      <div className="hw-bar-in">
        <p className="hw-bar-name">{service.name}</p>
        {/* On hover the time and price drop out of view (clipped) and the Book now button rides in from above. */}
        <div className="hw-bar-swap">
          <p className="hw-bar-meta">{formatDuration(service.minutes)}<span aria-hidden="true">·</span>{formatPrice(service.price)}</p>
          <button type="button" className="btn btn-primary hw-bar-btn" onClick={() => (picked ? goToConfirm(service, picked, tz, "service") : location.assign("/service#book"))}>Book now</button>
        </div>
      </div>
    </div>
    </div>, host)}
    </>
  );
}
