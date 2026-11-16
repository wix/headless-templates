// Stroke icons, drawn bare on the surface (no shell behind them). One stroke weight, one size
// default, so a header cluster reads as a set. Every glyph is an SVG — never a text character,
// whose optical centre and weight drift with the typeface.
type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const MenuIcon = ({ size = 22, className }: P) => <svg {...base(size)} className={className}><path d="M3 7h18M3 12h18M3 17h18" /></svg>;
export const CloseIcon = ({ size = 20, className }: P) => <svg {...base(size)} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>;
export const SearchIcon = ({ size = 20, className }: P) => <svg {...base(size)} className={className}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
export const ChevronRight = ({ size = 18, className }: P) => <svg {...base(size)} className={className}><path d="M9 5l7 7-7 7" /></svg>;
export const ChevronLeft = ({ size = 18, className }: P) => <svg {...base(size)} className={className}><path d="M15 5l-7 7 7 7" /></svg>;
export const ChevronDown = ({ size = 16, className }: P) => <svg {...base(size)} className={className}><path d="M5 9l7 7 7-7" /></svg>;
export const ArrowRight = ({ size = 18, className }: P) => <svg {...base(size)} className={className}><path d="M4 12h16M14 6l6 6-6 6" /></svg>;
export const GridDotsIcon = ({ size = 22, className }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>{[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}</svg>;
