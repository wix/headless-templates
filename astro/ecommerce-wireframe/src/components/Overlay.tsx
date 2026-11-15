// The one overlay primitive: cart drawer, quick-add sheet, mobile nav, filter
// sheet. Mounted at <body> (a fixed panel inside a transformed header gets
// clipped), full scrim, background scroll locked and inert, focus moved in
// and trapped, Escape closes, focus returns to the trigger.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "./Icons";

type Props = { open: boolean; onClose: () => void; side: "right" | "left" | "bottom"; title: string; titleHidden?: boolean; children: ReactNode; footer?: ReactNode; labelId?: string };

let openCount = 0;
// Each open panel remembers who opened it, so an overlay opened from inside
// another (quick add → bag) can hand focus back to the original trigger.
const triggers = new WeakMap<Element, HTMLElement | null>();
function lockPage(lock: boolean) {
  const page = document.getElementById("page");
  openCount = Math.max(0, openCount + (lock ? 1 : -1));
  const on = openCount > 0;
  document.documentElement.style.overflow = on ? "hidden" : "";
  if (page) { if (on) page.setAttribute("inert", ""); else page.removeAttribute("inert"); }
}

export default function Overlay({ open, onClose, side, title, titleHidden, children, footer }: Props) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useRef(`ov-${Math.random().toString(36).slice(2, 8)}`).current;
  // Whether THIS overlay currently holds a page lock — so close/unmount release exactly what was taken.
  const locked = useRef(false);
  const lock = (on: boolean) => { if (locked.current === on) return; locked.current = on; lockPage(on); };

  useEffect(() => {
    if (open) {
      const active = document.activeElement as HTMLElement | null;
      const host = active?.closest(".panel");
      returnTo.current = host ? triggers.get(host) ?? null : active;
      setMounted(true);
      lock(true);
      // Next frame so the slide-in transition runs; the timer covers frames that never come (backgrounded tab).
      let done = false;
      const show = () => { if (done) return; done = true; setShown(true); if (panel.current) { triggers.set(panel.current, returnTo.current); panel.current.focus(); } };
      const r = requestAnimationFrame(() => requestAnimationFrame(show));
      const t = setTimeout(show, 50);
      return () => { cancelAnimationFrame(r); clearTimeout(t); };
    }
    if (mounted) {
      setShown(false);
      lock(false);
      const t = setTimeout(() => setMounted(false), 280);
      const el = returnTo.current;
      if (el && document.contains(el)) el.focus();
      return () => clearTimeout(t);
    }
  }, [open]);
  useEffect(() => () => lock(false), []); // unmounted while open (e.g. its card re-rendered): never leave the page inert

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
    if (e.key !== "Tab" || !panel.current) return;
    const f = [...panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <>
      <div className="scrim" data-open={shown} onClick={onClose} aria-hidden="true" />
      <div ref={panel} className={`panel panel--${side}`} data-open={shown} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={onKeyDown}>
        <div className="panel__head">
          <h2 id={titleId} className={titleHidden ? "sr-only" : "panel__title"}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div className="panel__body">{children}</div>
        {footer ? <div className="panel__foot">{footer}</div> : null}
      </div>
    </>,
    document.body,
  );
}
