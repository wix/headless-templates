// Confirm as a side drawer: it slides in from the right over the page the visitor is on, which dims to 40%.
// The total and the primary action stay pinned to the bottom of the drawer. Escape, the close button or a click on the dimmed page closes it (the page underneath stays as it was).
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmPage from "./ConfirmPage";

type Policy = { name: string; lines: string[] };

export default function ConfirmDrawer({ open, onClose, policies }: { open: boolean; onClose: () => void; policies: Policy[] }) {
  const [shown, setShown] = useState(open);   // mounted
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) { setShown(true); setClosing(false); return; }
    if (!shown) return;
    setClosing(true);
    const t = window.setTimeout(() => { setShown(false); setClosing(false); }, 320);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shown) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const back = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", onKey);
    return () => { root.style.overflow = prev; removeEventListener("keydown", onKey); back?.focus?.(); };
  }, [shown]);

  if (!shown) return null;
  // portalled to <body>: an opener inside the blurred sticky header would otherwise trap the fixed drawer in it
  return createPortal(
    <div className={`drawer${closing ? " is-closing" : ""}`}>
      <div className="drawer__scrim" onClick={onClose} aria-hidden="true" />
      <aside ref={panel} className="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
        <div className="drawer__head">
          <h2 id="drawer-title" className="drawer__title">Confirm</h2>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>
        </div>
        <ConfirmPage policies={policies} nested />
      </aside>
    </div>,
    document.body,
  );
}
