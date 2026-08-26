import * as React from "react";

import { CartProvider } from "@/lib/cart";
import Link from "@/components/compat/link";
import { CircleCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

const noopSubscribe = () => () => {};

function ThankYouPage() {
  // Wix-hosted checkout appends the order id to the thank-you callback URL.
  // The page is prerendered without a request, so read it client-side only.
  const orderId = React.useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("orderId"),
    () => null
  );

  return (
    <>
      <SiteHeader alwaysSolid />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center px-5 pb-32 pt-40 text-center">
        <CircleCheck className="size-14 text-turq" strokeWidth={1.5} />
        <h1 className="display-heading mt-6 text-4xl lg:text-5xl">
          Order <span className="text-black/40">Confirmed</span>
        </h1>
        <p className="mt-5 max-w-md leading-relaxed text-black/60">
          Thanks for riding with Wix Cycles. We&apos;ve received your order and
          sent a confirmation email with the details.
        </p>
        {orderId && (
          <p className="tracked-tagline mt-4 text-xs text-black/50">
            Order Ref: {orderId}
          </p>
        )}
        <Button asChild variant="dark" className="mt-10">
          <Link href="/">Back to WX140</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}

export default function ThankYouApp() {
  return (
    <CartProvider>
      <ThankYouPage />
    </CartProvider>
  );
}
