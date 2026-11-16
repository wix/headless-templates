// Phone / tablet navigation: a left drawer (not full width) with an accordion — each department opens its subcategories in two columns.
// Same overlay contract as the shipped CartDrawer: portalled to <body> (the header's backdrop-blur
// would clip a fixed child), scrim, background scroll locked, focus moved in and trapped, Escape
// closes, focus returns to the menu button.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MenuIcon } from "./Icons";
import CloseButton from "./CloseButton";

type Sub = { name: string; slug: string };
export type NavDept = Sub & { children: Sub[] };
type Link = { label: string; href: string };

const line = "border-t border-foreground";
const row = "mobile-row flex min-h-14 w-full items-center justify-between text-left font-display text-h3 font-semibold text-foreground no-underline transition-opacity hover:opacity-60";

export default function MobileNav({ departments, collections, pages, current = "" }: { departments: NavDept[]; collections: Link[]; pages: Link[]; current?: string }) {
  // current page marker (grey fill); a tap darkens it (active:) so "current" and "clicked" read differently
  const cur = (href: string) => (current === href ? { "aria-current": "page" as const } : {});
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState<string | null>(null);
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const close = () => { setOpen(false); setDept(null); };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")].filter((el) => el.offsetParent !== null && !el.closest("[inert]"));
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; trigger.current?.focus(); };
  }, [open, dept]);

  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open}
        className="-ml-2.5 inline-flex h-11 w-11 items-center justify-center text-foreground transition-opacity hover:opacity-60">
        <MenuIcon />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex bg-foreground/40" onClick={close}>
          <nav ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-[min(24rem,88vw)] flex-col bg-background outline-none">
            <div className="flex h-16 shrink-0 items-center justify-between px-6">
              <span className="kicker text-muted-foreground">Menu</span>
              <CloseButton label="Close menu" onClick={close} className="-mr-2.5" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10">
              {/* Accordion: a hairline above every row, the departments large (the blue banner's title size), the subcategories
                  opening in two columns beneath their department, everything else in paragraph size. */}
              <ul className="border-b border-foreground">
                <li className={line}><a href="/shop" onClick={close} className={row} {...cur("/shop")}>All products</a></li>
                {departments.map((d) => {
                  const on = dept === d.slug;
                  return (
                    <li key={d.slug} className={line}>
                      {d.children.length ? (
                        <>
                          <button type="button" onClick={() => setDept(on ? null : d.slug)} className={row} aria-expanded={on} aria-controls={`sub-${d.slug}`}>
                            <span>{d.name}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" className="shrink-0 text-muted-foreground">
                              <path d="M4 12h16" />{!on && <path d="M12 4v16" />}
                            </svg>
                          </button>
                          <div id={`sub-${d.slug}`} className={`grid transition-[grid-template-rows] duration-[260ms] ease-(--ease-site) ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} {...(!on ? { inert: "" } as Record<string, string> : {})}>
                            <ul className="grid min-h-0 grid-cols-2 gap-x-6 overflow-hidden">
                              {[{ name: `Shop all ${d.name}`, slug: d.slug }, ...d.children].map((c) => (
                                <li key={c.slug}><a href={`/category/${c.slug}`} onClick={close} className="flex min-h-9 items-center text-base text-muted-foreground no-underline transition-opacity hover:opacity-60">{c.name}</a></li>
                              ))}
                              <li className="col-span-2 h-4" aria-hidden="true" />
                            </ul>
                          </div>
                        </>
                      ) : (
                        <a href={`/category/${d.slug}`} onClick={close} className={row} {...cur(`/category/${d.slug}`)}>{d.name}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-4 flex flex-col">
                {collections.map((l) => <li key={l.href}><a href={l.href} {...cur(l.href)} onClick={close} className="mobile-link flex min-h-11 items-center text-base text-foreground no-underline transition-opacity hover:opacity-60">{l.label}</a></li>)}
                {pages.map((l) => <li key={l.href}><a href={l.href} {...cur(l.href)} onClick={close} className="mobile-link flex min-h-11 items-center text-base text-muted-foreground no-underline transition-opacity hover:opacity-60">{l.label}</a></li>)}
              </ul>
            </div>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
