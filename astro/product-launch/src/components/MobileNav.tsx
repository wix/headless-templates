// Phone/tablet navigation: a left drawer with the page links and the one buy action. Nothing
// runs off-screen, nothing needs hover. Same overlay contract as the shipped CartDrawer:
// portalled to <body> (the header's backdrop-blur makes it the containing block of any fixed
// child, which would clip the drawer to the header's 64px), scrim, background scroll locked, focus moved in and trapped, Escape
// closes, focus returns to the menu button.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Link = { label: string; href: string };

export default function MobileNav({ links, buyHref, buyLabel }: { links: Link[]; buyHref: string; buyLabel: string }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      trigger.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open}
        className="icon-btn -ml-2.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex bg-foreground/40 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <nav ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}
            className="flex h-full w-[min(22rem,86vw)] flex-col bg-background px-(--gutter) pb-8 outline-none">
            <div className="flex h-(--header-h) items-center justify-between">
              <span className="kicker text-muted-foreground">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu"
                className="icon-btn -mr-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <ul className="mt-6 flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-nav onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center font-display text-h3 font-semibold text-foreground no-underline transition-opacity hover:opacity-70">{l.label}</a>
                </li>
              ))}
            </ul>
            <a href={buyHref} className="btn btn-primary mt-auto w-full">{buyLabel}</a>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
