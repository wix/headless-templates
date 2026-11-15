// Quick add: the remaining choices for one card. A bottom sheet on phones,
// a side panel on wider screens — both the same overlay contract. Its first
// view is identity, price, the first required choice, and the action.
import Overlay from "./Overlay";
import OptionPicker from "./OptionPicker";
import { usePurchase } from "./usePurchase";
import { imgSrc, listPrice, variantPrice } from "../lib/store";

function Body({ product, initial, onDone }: { product: any; initial: Record<string, string>; onDone: () => void }) {
  const p = usePurchase(product, initial);
  const price = p.variant ? variantPrice(p.variant) : listPrice(product);
  const img = product.media?.main;
  return (
    <div className="qa">
      <div className="qa__id">
        <div className="media media--product qa__img">{imgSrc(img) ? <img src={imgSrc(img, 160, 200)} alt="" width={80} height={100} /> : null}</div>
        <div className="qa__meta">
          <p className="qa__name">{product.name}</p>
          <p className="price">{price.text}{price.was ? <> <span className="sr-only">was</span><s className="price__was">{price.was}</s></> : null}</p>
          <a className="link small" href={`/products/${product.slug}`}>View full details</a>
        </div>
      </div>
      <OptionPicker product={product} idx={p.idx} selected={p.selected} onSelect={p.select} mods={p.mods} onMod={p.setMod} showErrors={p.tried} compact />
      <div className="qa__action">
        <button type="button" className="btn btn--primary btn--block" onClick={async () => { if (await p.add()) onDone(); }}
          disabled={p.state !== "ok" || p.modsMissing.length > 0 || p.busy} aria-busy={p.busy || undefined} aria-describedby="qa-reason">
          {p.busy ? <span className="spinner" aria-hidden="true" /> : null}{p.label}
        </button>
        <p id="qa-reason" className="field__error" aria-live="polite" hidden={!(p.tried && p.state !== "ok")}>{p.state !== "ok" ? p.reason : ""}</p>
        {p.error ? <p className="field__error" role="alert">{p.error}</p> : null}
      </div>
    </div>
  );
}

export default function QuickAdd({ product, initial, open, onClose, side }: { product: any; initial: Record<string, string>; open: boolean; onClose: () => void; side: "bottom" | "right" }) {
  return (
    <Overlay open={open} onClose={onClose} side={side} title="Add to cart">
      {product ? <Body key={product._id} product={product} initial={initial} onDone={onClose} /> : <div className="skeleton" style={{ height: 240 }} />}
    </Overlay>
  );
}
