// Modal focus helpers: while a dialog is open everything else on the page is inert (not
// focusable, not read), Tab and Shift+Tab wrap inside the dialog, and closing it gives focus back to what opened it.

/** Marks every element outside `el` inert (walking up to <body>); returns a function that undoes exactly that.
 *  `data-keep-live` opts an element out (the dim layer behind a dialog, which closes it on a click). */
export function inertOutside(el: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  for (let node: HTMLElement | null = el; node && node !== document.body && node.parentElement; node = node.parentElement) {
    for (const sib of Array.from(node.parentElement.children)) {
      if (sib === node || !(sib instanceof HTMLElement) || sib.inert || sib.hasAttribute("data-keep-live") || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(sib.tagName)) continue;
      sib.inert = true;
      changed.push(sib);
    }
  }
  return () => changed.forEach((s) => { s.inert = false; });
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tab / Shift+Tab wrap inside `el` (the first and last focusable controls lead to each other). */
export function trapTab(el: HTMLElement): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const all = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.closest("[inert]") && n.getClientRects().length > 0);
    // one Tab stop per radio group: only the checked radio (or the first) of a name takes part
    const list = all.filter((n) => !(n instanceof HTMLInputElement && n.type === "radio" && !n.checked && all.some((m) => m !== n && m instanceof HTMLInputElement && m.type === "radio" && m.name === n.name && m.checked)));
    if (!list.length) { e.preventDefault(); el.focus(); return; }
    const first = list[0], last = list[list.length - 1], at = document.activeElement;
    if (e.shiftKey && (at === first || at === el || !el.contains(at))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (at === last || !el.contains(at))) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", onKey, true);
  return () => document.removeEventListener("keydown", onKey, true);
}

/** The full modal contract for `el`: inert background + Tab wrap now; on release, both undone and focus returned. */
export function holdFocus(el: HTMLElement, returnTo: Element | null = document.activeElement): () => void {
  const undoInert = inertOutside(el);
  const undoTrap = trapTab(el);
  return () => {
    undoTrap();
    undoInert();
    if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
  };
}
