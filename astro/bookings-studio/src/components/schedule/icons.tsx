// The few icons the booking surfaces use: 1.75px strokes, currentColor, decorative (aria-hidden); the label beside each carries the meaning.
const base = { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", "aria-hidden": true as const };
const stroke = { stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const ArrowRight = () => <svg {...base}><path d="M2 7h10M8 3l4 4-4 4" {...stroke} /></svg>;
export const ChevronLeft = () => <svg {...base}><path d="M9 2L4 7l5 5" {...stroke} /></svg>;
export const ChevronRight = () => <svg {...base}><path d="M5 2l5 5-5 5" {...stroke} /></svg>;
export const ChevronDown = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" {...stroke} /></svg>;
export const CalendarIcon = () => <svg {...base}><rect x="1.75" y="2.5" width="10.5" height="9.75" rx="1.5" {...stroke} /><path d="M1.75 5.5h10.5M4.5 1.5v2M9.5 1.5v2" {...stroke} /></svg>;
export const PersonIcon = () => <svg {...base}><circle cx="7" cy="4.5" r="2.25" {...stroke} /><path d="M2.5 12c.4-2.2 2.1-3.4 4.5-3.4s4.1 1.2 4.5 3.4" {...stroke} /></svg>;
export const PinIcon = () => <svg {...base}><path d="M7 12.5S2.75 8.9 2.75 5.6a4.25 4.25 0 018.5 0C11.25 8.9 7 12.5 7 12.5z" {...stroke} /><circle cx="7" cy="5.6" r="1.4" {...stroke} /></svg>;
export const PeopleIcon = () => <svg {...base}><circle cx="5" cy="4.75" r="2" {...stroke} /><path d="M1.5 11.75c.3-2 1.7-3 3.5-3s3.2 1 3.5 3M9.5 3a2 2 0 010 3.9M10.5 9c1.3.3 2.2 1.2 2.5 2.75" {...stroke} /></svg>;
export const FlameIcon = () => <svg {...base}><path d="M7 1.5c.4 2 2.9 3.2 2.9 6A2.9 2.9 0 017 10.4a2.9 2.9 0 01-2.9-2.9c0-1 .5-1.8 1-2.3.1.8.5 1.2 1 1.3C6 5.2 6.2 3 7 1.5z" {...stroke} /><path d="M7 12.5c-1.9 0-3.4-1.2-3.4-2.6M7 12.5c1.9 0 3.4-1.2 3.4-2.6" {...stroke} /></svg>;
export const ClockIcon = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="8.75" stroke="currentColor" strokeWidth="1.5" /><path d="M11 6v5.25l3.25 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const FilterIcon = () => <svg {...base}><path d="M1.75 3.5h10.5M3.75 7h6.5M5.75 10.5h2.5" {...stroke} /></svg>;
export { CloseIcon } from "./Overlay";
