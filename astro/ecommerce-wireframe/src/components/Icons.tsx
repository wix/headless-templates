// Stroke icons, 24px grid, 1.5 stroke. currentColor so they follow the text.
const P = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
export const IconBag = () => <svg {...P}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
export const IconClose = () => <svg {...P}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconMenu = () => <svg {...P}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconSearch = () => <svg {...P}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
export const IconChevronDown = () => <svg {...P} width={16} height={16}><path d="m6 9 6 6 6-6" /></svg>;
export const IconChevronLeft = () => <svg {...P}><path d="m15 6-6 6 6 6" /></svg>;
export const IconChevronRight = () => <svg {...P}><path d="m9 6 6 6-6 6" /></svg>;
export const IconFilter = () => <svg {...P} width={18} height={18}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
export const IconMinus = () => <svg {...P} width={16} height={16}><path d="M6 12h12" /></svg>;
export const IconPlus = () => <svg {...P} width={16} height={16}><path d="M12 6v12M6 12h12" /></svg>;
export const IconCheck = () => <svg {...P} width={16} height={16}><path d="m5 12 4.5 4.5L19 7" /></svg>;
export const IconTruck = () => <svg {...P}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></svg>;
export const IconReturn = () => <svg {...P}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>;
export const IconChat = () => <svg {...P}><path d="M4 5h16v11H9l-5 4V5Z" /></svg>;
