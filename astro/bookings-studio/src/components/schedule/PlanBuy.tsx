// "Buy" for one plan: hands the visitor to Wix's HOSTED Pricing Plans checkout (redirects.createRedirectSession({ paidPlansCheckout })).
// Visitor-side: no order is created here, no member sign-in, nothing elevated. Wix's page asks for a login or sign-up and the
// payment. The site has no payments connected, so the hosted flow cannot complete a purchase.
import { useState } from "react";
import { redirects } from "@wix/redirects";

export default function PlanBuy({ planId, name, label = "Buy", primary = true }: { planId: string; name: string; label?: string; primary?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function buy() {
    if (busy) return;
    setBusy(true); setFailed(false);
    try {
      // postFlowUrl / thankYouPageUrl origin comes from window.location.origin (https), as for bookings.
      const back = `${window.location.origin}/?from=checkout#membership`;
      const { redirectSession }: any = await redirects.createRedirectSession({ paidPlansCheckout: { planId }, callbacks: { postFlowUrl: back, thankYouPageUrl: back } } as any);
      window.location.assign(redirectSession.fullUrl);
    } catch (err) { console.error(err);
      setBusy(false); setFailed(true);
    }
  }
  return (
    <div>
      <button type="button" className={`btn w-full ${primary ? "btn-primary" : "btn-secondary"}`} onClick={buy} disabled={busy} aria-busy={busy} aria-label={`${label}: ${name}`}>{busy ? "Opening checkout…" : label}</button>
      {failed && <p role="alert" className="field-error mt-2">Checkout could not be opened. Try again.</p>}
    </div>
  );
}
