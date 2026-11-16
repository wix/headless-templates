// Confirm (Figma 3:382, with a single appointment): client details form, Booking summary of the one appointment, View policy,
// and the one primary action. Nothing exists in Bookings until the primary action. The label names the outcome: "Book now" books
// (free: placeOrder), "Continue to payment" hands off to Wix-hosted checkout. It is decided before the button renders.
import { useEffect, useState } from "react";
import { useSelection, clearSelection, changeTimeHref } from "../../lib/selection";
import { loadFormFields, submitAppointment, BookingError, FALLBACK_FIELDS, type FormField, type BookingFailure } from "../../lib/booking";
import { loadDetails, saveDetails, clearDetails, savePlaced } from "../../lib/drafts";
import { formatDuration, formatMoney, formatPrice } from "../../lib/services";
import { whenLabel } from "../../lib/dates";
import { BOOK_NOW } from "../../lib/site";

export default function ConfirmPage({ policies }: { policies: { name: string; lines: string[] }[] }) {
  const appt = useSelection();
  const [fields, setFields] = useState<FormField[]>(FALLBACK_FIELDS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<BookingFailure | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const formId = appt?.formId;

  useEffect(() => { setValues(loadDetails()); }, []);
  useEffect(() => { let live = true; loadFormFields(formId).then((f) => live && setFields(f)); return () => { live = false; }; }, [formId]);

  const setField = (target: string, v: string) => {
    const next = { ...values, [target]: v };
    setValues(next); saveDetails(next);
    if (errors[target]) setErrors((e) => ({ ...e, [target]: "" }));
  };

  function validate() {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.target] ?? "").trim();
      if (f.required && !v) e[f.target] = "Required";
      else if (f.type === "EMAIL" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e[f.target] = "Enter a valid email";
    }
    setErrors(e);
    const first = Object.keys(e)[0];
    // Focus the first invalid field once React has rendered it (the error attributes are not in the DOM yet).
    if (first) setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
    return !first;
  }

  const back = (
    <a href={appt ? changeTimeHref(appt) : "/"} className="link-btn text-muted-foreground no-underline hover:underline">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>Back
    </a>
  );
  if (!appt) {
    return (
      <div>
        {back}
        <h1 className="mt-4 text-h2">Confirm</h1>
        <p className="mt-10 text-lg">No time selected.</p>
        <div className="mt-6 flex flex-wrap gap-4"><a href="/intro" className="btn btn-primary">Book intro call</a><a href="/service#book" className="btn btn-secondary">{BOOK_NOW}</a></div>
      </div>
    );
  }

  // Decided BEFORE rendering the primary action: money due means hosted checkout.
  const goesToCheckout = !!appt.price && (appt.payment.online || !appt.payment.inPerson);
  const label = goesToCheckout ? "Continue to payment" : BOOK_NOW;
  const totalText = appt.price ? formatMoney(Number(appt.price.value), appt.price.currency) : "Free";

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy || !appt) return;
    setFailure(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const clean = Object.fromEntries(Object.entries(values).filter(([k, v]) => v.trim() && fields.some((f) => f.target === k)).map(([k, v]) => [k, v.trim()]));
      const res = await submitAppointment(appt, clean);
      if (res.kind === "checkout") { window.location.assign(res.url); return; } // the selection stays until the visitor says otherwise
      savePlaced({ appointment: appt, email: clean.email, at: Date.now() });
      clearSelection(); clearDetails();
      window.location.assign("/book/done?from=order");
    } catch (e: any) {
      console.error("booking failed", e);
      setFailure(e instanceof BookingError ? e.failure : { code: "other", message: String(e?.message ?? e) });
      setBusy(false);
      setTimeout(() => document.getElementById("booking-error")?.focus(), 0);
    }
  }

  const policy = policies.find((p) => p.name === appt.serviceName);
  return (
    <form onSubmit={submit} noValidate>
      {back}
      <h1 className="mt-4 text-h2">Confirm</h1>
      <section className="cf-card mt-8">
      <h2 className="text-h3">Client details</h2>
      <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map((f) => {
          const wide = f.target === "add_your_message" || f.options;
          return (
            <div key={f.target} className={wide ? "sm:col-span-2" : ""}>
              <label htmlFor={`f-${f.target}`} className="field-label">{f.label}{f.required && <span className="sr-only"> (required)</span>}</label>
              {f.options ? (
                <select id={`f-${f.target}`} className="field" value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)}>
                  <option value="">Select</option>{f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.target === "add_your_message" ? (
                <textarea id={`f-${f.target}`} className="field" value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)} />
              ) : (
                <input id={`f-${f.target}`} className="field" name={f.target} value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)}
                  type={f.type === "EMAIL" ? "email" : f.type === "PHONE" ? "tel" : f.type === "URL" ? "url" : "text"}
                  inputMode={f.type === "NUMBER" ? "numeric" : undefined}
                  autoComplete={({ first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" } as Record<string, string>)[f.target]}
                  aria-invalid={errors[f.target] ? true : undefined} aria-describedby={errors[f.target] ? `e-${f.target}` : undefined} aria-required={f.required || undefined} />
              )}
              {errors[f.target] && <p id={`e-${f.target}`} className="field-error">{errors[f.target]}</p>}
            </div>
          );
        })}
      </div>

      </section>

      <section className="cf-card mt-4">
      <h2 className="text-h3">Booking summary</h2>
      <div className="mt-6 flex flex-col gap-2">
        <div className={`cf-row flex items-start justify-between gap-4 ${failure?.code === "slot-gone" ? "outline outline-2 -outline-offset-2 outline-destructive" : ""}`}>
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{appt.serviceName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{whenLabel(appt.startDate)} <span aria-hidden="true">·</span> {formatDuration(appt.minutes)}</p>
            <p className="text-sm text-muted-foreground">{appt.locationLabel}{appt.intro && <> <span aria-hidden="true">·</span> video link sent after booking</>} <span aria-hidden="true">·</span> {appt.staff.name}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold">{formatPrice(appt.price)}</p>
            <p className="mt-1 text-sm"><a className="link-btn" href={changeTimeHref(appt)} aria-label={`Change the time of ${appt.serviceName}`}>Edit</a></p>
          </div>
        </div>
        <div className="cf-total flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">1 appointment</span>
          <span className="font-semibold">Total {totalText}</span>
        </div>
      </div>
      {appt.intro && <p className="mt-4 text-sm text-muted-foreground">The video link is sent by email after booking. This site does not generate or show it.</p>}

      <div className="mt-4">
        <button type="button" className="link-btn" aria-expanded={showPolicy} onClick={() => setShowPolicy((v) => !v)}>View policy</button>
        {showPolicy && (
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            {policy?.lines.length ? policy.lines.map((l, i) => <p key={i}>{l}</p>) : <p>No booking policy is set for this service.</p>}
          </div>
        )}
      </div>

      </section>

      {failure && (
        <div id="booking-error" tabIndex={-1} role="alert" className="mt-4 rounded-sheet bg-background p-5 text-sm outline outline-1 -outline-offset-1 outline-destructive">
          {failure.code === "slot-gone" && <p><strong>{appt.serviceName}, {whenLabel(appt.startDate)} is no longer available.</strong> Your details are kept. <a className="underline" href={changeTimeHref(appt)}>Choose another time</a></p>}
          {failure.code === "no-payments" && <p><strong>Bookings cannot be completed on this site yet.</strong> The site owner has not connected payments, so no booking can be placed. Your time is still selected.</p>}
          {failure.code === "other" && <p><strong>Something went wrong.</strong> Your booking was not placed. Check your details and try again.</p>}
        </div>
      )}

      {/* The fixed action bar: total, and the one primary action. */}
      <div className="action-bar">
        <div className="flow flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Total <span className="font-semibold text-foreground">{totalText}</span></p>
          <button type="submit" className="btn btn-primary px-8" disabled={busy} aria-busy={busy}>{busy ? (goesToCheckout ? "Preparing payment…" : "Booking…") : label}</button>
        </div>
      </div>
    </form>
  );
}
