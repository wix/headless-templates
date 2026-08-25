/**
 * Vertical section counter pinned to the right edge of feature sections,
 * e.g. "FEATURES 03" — as on the reference site.
 */
export function SectionTag({ label, dark = true }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute right-4 top-1/2 z-10 hidden origin-center -translate-y-1/2 rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.4em] lg:block ${
        dark ? "text-white/35" : "text-black/30"
      }`}
    >
      {label}
    </span>
  );
}
