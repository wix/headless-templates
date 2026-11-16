// "Add to cart" for the bottom buy pill. The launch product has options, so the button opens the
// shipped OptionPicker (the same one the PDP and quick-add mount) in a sheet — it resolves the
// variant, stock and quantity and does the add. The detail is fetched only once the sheet opens.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useProductDetail } from "../hooks/storefront/useProductDetail";
import OptionPicker from "./storefront/OptionPicker";

export default function BuyPillAdd({ slug, label = "Add to cart" }: { slug: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary shrink-0 !min-h-10 !px-4 text-sm">{label}</button>
      {open && createPortal(<Sheet slug={slug} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function Sheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const d = useProductDetail({ slug });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const needsPdp = (d.product?.modifiers ?? []).some((m) => m.type === "text") || (d.product?.subscriptions.length ?? 0) > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 md:items-center" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Add to cart" onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-lg bg-background p-5 text-foreground shadow-2xl md:w-[28rem] md:rounded-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{d.product?.name}</p>
            <p className="text-sm text-muted-foreground">{d.price}</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-xl leading-none text-muted-foreground">×</button>
        </div>
        {!d.product && !d.notFound && <p className="text-sm text-muted-foreground">Loading options…</p>}
        {d.notFound && <p className="text-sm text-muted-foreground">This product isn't available anymore.</p>}
        {d.product && needsPdp && <a href={`/products/${encodeURIComponent(slug)}`} className="btn btn-primary w-full">Customize on the product page</a>}
        {d.product && !needsPdp && <OptionPicker detail={d} onAdded={onClose} />}
      </section>
    </div>
  );
}
