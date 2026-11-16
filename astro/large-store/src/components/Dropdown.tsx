// THE dropdown of the site: a chip-shaped trigger that opens a soft white panel of rows (rounded panel, light shadow, a grey fill on
// the hovered/current row, no icons). Used by the sort control and the grid-layout control, so every dropdown looks and behaves alike.
import { useEffect, useRef, useState } from "react";
import { titleCase } from "../lib/text";

export type DropdownOption<T extends string> = { value: T; label: string };

export default function Dropdown<T extends string>({ label, options, value, onChange, ariaLabel, className = "" }: {
  /** The text on the closed trigger. */
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((o) => !o)} className="chip gap-1.5">
        {titleCase(label)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-[160ms] ${open ? "rotate-180" : ""}`}><path d="M5 9l7 7 7-7" /></svg>
      </button>
      {open && (
        <ul role="listbox" aria-label={ariaLabel} className="dropdown-panel absolute left-1/2 top-full z-30 mt-2 flex min-w-48 -translate-x-1/2 flex-col gap-0.5 p-2">
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                className={`dropdown-row flex min-h-11 w-full items-center px-4 text-left text-base ${o.value === value ? "dropdown-row--current" : ""}`}>
                {titleCase(o.label)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
