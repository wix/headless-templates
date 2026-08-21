/**
 * Lightweight stroke icon set (lucide-style), as inline-SVG strings so they can
 * be dropped into markup with `set:html` on both server and client. Each inherits
 * `currentColor` and a 1.75 stroke, so it sits neutrally next to text.
 */

function icon(paths: string): string {
  return `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export const icons = {
  calendar: icon('<rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" />'),
  search: icon('<circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />'),
  filter: icon('<path d="M4 6h16M7 12h10M10 18h4" />'),
  chevronLeft: icon('<path d="m15 6-6 6 6 6" />'),
  chevronRight: icon('<path d="m9 6 6 6-6 6" />'),
  chevronDown: icon('<path d="m6 9 6 6 6-6" />'),
  arrowRight: icon('<path d="M5 12h14M13 6l6 6-6 6" />'),
  arrowLeft: icon('<path d="M19 12H5M12 19l-7-7 7-7" />'),
  check: icon('<path d="m5 12.5 4.5 4.5L19 7" />'),
  checkCircle: icon('<circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />'),
  close: icon('<path d="M6 6l12 12M18 6 6 18" />'),
  mapPin: icon('<path d="M20 10c0 5.2-8 12-8 12s-8-6.8-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.75" />'),
  clock: icon('<circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />'),
  shield: icon('<path d="M12 3 5 6v5.5c0 4.3 3 7.5 7 9.5 4-2 7-5.2 7-9.5V6l-7-3Z" /><path d="m9.2 12 2 2 3.6-4" />'),
  card: icon('<rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 9.5h18M7 15h4" />'),
  user: icon('<circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" />'),
  users: icon('<circle cx="9" cy="8" r="3.25" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.25 3.25 0 0 1 0 6.1M17.5 19a5.5 5.5 0 0 0-2.4-4.5" />'),
  building: icon('<path d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M9.5 7h1M13.5 7h1M9.5 11h1M13.5 11h1M9.5 15h1M13.5 15h1M10 21v-3h4v3" />'),
  refresh: icon('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />'),
  key: icon('<circle cx="8" cy="8" r="4.5" /><path d="m11.2 11.2 7.3 7.3M16 16l2-2M18.5 13.5l1.5 1.5" />'),
} as const;

export type IconName = keyof typeof icons;
