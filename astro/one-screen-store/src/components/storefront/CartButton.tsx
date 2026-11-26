// Header cart icon with a live count badge beside it (right of the icon, vertically centred; site edit) — mount once in your header.
// Opens the CartDrawer (mount that once too, anywhere in the page).
import { useCart } from "../../hooks/storefront/useCart";

export default function CartButton() {
  const { itemCount, openCart } = useCart();
  return (
    <button
      type="button"
      aria-label={`Cart, ${itemCount} items`}
      onClick={openCart}
      className="hdr-btn group relative inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full px-2"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {itemCount > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground transition-colors duration-150 group-hover:bg-background group-hover:text-foreground">
          {itemCount}
        </span>
      )}
    </button>
  );
}
