import * as React from "react";

import { CartProvider } from "@/lib/cart";
import Image from "@/components/compat/image";
import Link from "@/components/compat/link";
import { Minus, Plus, X } from "lucide-react";

import { useCart } from "@/lib/cart";
import { wixImageUrl } from "@/lib/wix";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

function CartPage() {
  const { cart, count, busy, setQuantity, removeItem, startCheckout } = useCart();
  const [checkingOut, setCheckingOut] = React.useState(false);

  const lineItems = cart?.lineItems ?? [];
  const currency = cart?.currency ?? "USD";
  const fmt = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [currency]
  );
  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.price?.amount ?? 0) * (li.quantity ?? 0),
    0
  );

  return (
    <>
      <SiteHeader alwaysSolid />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-5 pb-24 pt-28 lg:pt-36">
        <h1 className="display-heading text-4xl lg:text-5xl">
          Your <span className="text-black/40">Cart</span>
        </h1>

        {lineItems.length === 0 ? (
          <div className="mt-16 flex flex-col items-start gap-6">
            <p className="text-black/60">Your cart is empty.</p>
            <Button asChild variant="dark">
              <Link href="/#kits">Shop WX140 Builds</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
            <ul>
              {lineItems.map((li) => {
                // The line item carries the product's own image from Wix.
                const image = wixImageUrl(li.image, 240, 320);
                return (
                  <li
                    key={li._id}
                    className="flex gap-5 border-b border-black/10 py-6 first:border-t"
                  >
                    <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-black/5">
                      {image && (
                        <Image
                          src={image}
                          alt={li.productName?.original ?? ""}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="display-heading text-lg">
                          {li.productName?.original}
                        </h3>
                        <button
                          aria-label={`Remove ${li.productName?.original ?? "item"}`}
                          disabled={busy}
                          onClick={() => li._id && removeItem(li._id)}
                          className="text-black/40 transition-colors hover:text-ink disabled:opacity-40"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-black/60">
                        {li.price?.formattedConvertedAmount ?? li.price?.formattedAmount}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-black/15">
                          <button
                            aria-label="Decrease quantity"
                            disabled={busy}
                            onClick={() => li._id && setQuantity(li._id, (li.quantity ?? 1) - 1)}
                            className="flex size-9 items-center justify-center transition-colors hover:bg-black/5 disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">
                            {li.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            disabled={busy}
                            onClick={() => li._id && setQuantity(li._id, (li.quantity ?? 1) + 1)}
                            className="flex size-9 items-center justify-center transition-colors hover:bg-black/5 disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-base font-semibold text-ink">
                          {fmt.format(Number(li.price?.amount ?? 0) * (li.quantity ?? 0))}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="h-fit border border-black/10 p-7">
              <h2 className="tracked-tagline text-xs text-black/50">Order Summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-black/60">
                    Subtotal ({count} {count === 1 ? "item" : "items"})
                  </dt>
                  <dd className="font-semibold">{fmt.format(subtotal)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-black/50">
                Shipping and taxes are calculated at checkout.
              </p>
              <Button
                variant="dark"
                className="mt-6 w-full"
                disabled={busy || checkingOut}
                onClick={async () => {
                  setCheckingOut(true);
                  try {
                    await startCheckout();
                  } finally {
                    setCheckingOut(false);
                  }
                }}
              >
                {checkingOut ? "Redirecting…" : "Checkout"}
              </Button>
              <Link
                href="/#kits"
                className="link-cta mt-5 inline-block text-ink hover:text-turq"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function CartApp() {
  return (
    <CartProvider>
      <CartPage />
    </CartProvider>
  );
}
