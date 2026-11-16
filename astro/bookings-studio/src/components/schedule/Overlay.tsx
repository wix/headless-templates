// One overlay primitive: a bottom sheet on phones, a centred modal from 768px up. Used by the service
// details and the staff picker. Escape closes, focus moves in and returns to the opener, Tab is trapped,
// the page behind does not scroll.
import { useEffect, useRef, type ReactNode } from "react";

export default function Overlay({ label, onClose, children, modal = true }: { label: string; onClose: () => void; children: ReactNode; modal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // The latest onClose without re-running the effect (a new closure each parent render must not re-steal focus).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = ref.current!;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null);
    (root.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? root).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; opener?.focus?.(); };
  }, []);
  return (
    <>
      <div className="scrim" onClick={() => closeRef.current()} aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`sheet ${modal ? "sheet-modal" : ""}`}>
        {children}
      </div>
    </>
  );
}

export const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
);
