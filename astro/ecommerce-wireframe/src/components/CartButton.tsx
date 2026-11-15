// Header bag control with a live count. client:only — the count only exists in the browser.
import { useEffect } from "react";
import { useCart, openCart, loadCart, itemCount } from "../lib/cart-client";
import { IconBag } from "./Icons";

export default function CartButton() {
  const s = useCart();
  useEffect(() => { loadCart(); }, []);
  const n = itemCount(s.cart);
  return (
    <button type="button" className="icon-btn" onClick={openCart} aria-label={n ? `Bag, ${n} item${n === 1 ? "" : "s"}` : "Bag, empty"} aria-haspopup="dialog">
      <IconBag />
      {n ? <span className="badge" aria-hidden="true">{n > 99 ? "99+" : n}</span> : null}
    </button>
  );
}
