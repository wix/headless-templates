// The one close control for every pop-up (menu, search, cart, filters, product details, card options): the same
// 44px round hit area, the same × icon, the same hover ring. `className` only positions it.
import { CloseIcon } from "./Icons";

export default function CloseButton({ label, onClick, className = "" }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`hbtn inline-flex h-11 w-11 shrink-0 items-center justify-center text-foreground ${className}`}>
      <CloseIcon size={20} />
    </button>
  );
}
