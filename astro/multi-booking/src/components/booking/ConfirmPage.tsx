// Confirm: client details form, Booking summary of every appointment (Edit · Remove), "+ Add another
// service", the total ("N appointments"), View policy, and the one primary action.
// Nothing exists in Bookings until the primary action. The label names the outcome: "Book now" books (free or pay in
// person, placeOrder), "Continue to payment" hands off to Wix-hosted checkout.
import { useEffect, useMemo, useState } from "react";
import { useAppointments, remove, clear, totalOf, overlapsAnyOther, type Appointment } from "../../lib/cart";
import { loadFormFields, submitAppointments, BookingError, FALLBACK_FIELDS, type FormField, type BookingFailure } from "../../lib/booking";
import { loadDetails, saveDetails, clearDetails, savePlaced } from "../../lib/drafts";
import { formatDuration, formatMoney, formatPrice } from "../../lib/services";
import { whenLabel } from "../../lib/dates";

type Policy = { name: string; lines: string[] };

export default function ConfirmPage({ policies, nested = false }: { policies: Policy[]; nested?: boolean }) {
  // in the drawer the title "Confirm" is the H2, so the two section titles step down to H3
  const H = nested ? "h3" : "h2";
  const appts = useAppointments();
  const [fields, setFields] = useState<FormField[]>(FALLBACK_FIELDS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<BookingFailure | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const formId = appts[0]?.formId;

  useEffect(() => { setValues(loadDetails()); }, []);
  useEffect(() => { let live = true; loadFormFields(formId).then((f) => live && setFields(f)); return () => { live = false; }; }, [formId]);

  const total = totalOf(appts);
  // Decided BEFORE rendering the primary action: money due means hosted checkout.
  const goesToCheckout = appts.some((a) => a.price && (a.payment.online || !a.payment.inPerson));
  const label = goesToCheckout ? "Continue to payment" : "Book now";
  const last = appts[appts.length - 1];

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
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy || !appts.length) return;
    setFailure(null);
    if (!validate()) { document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return; }
    setBusy(true);
    try {
      const clean = Object.fromEntries(Object.entries(values).filter(([k, v]) => v.trim() && fields.some((f) => f.target === k)).map(([k, v]) => [k, v.trim()]));
      const res = await submitAppointments(appts, clean);
      if (res.kind === "checkout") { window.location.assign(res.url); return; } // the list stays until the visitor says otherwise
      savePlaced({ appointments: appts, email: clean.email, at: Date.now() });
      clear(); clearDetails();
      window.location.assign("/book/done?from=order");
    } catch (e: any) {
      setFailure(e instanceof BookingError ? e.failure : { code: "other", message: String(e?.message ?? e) });
      setBusy(false);
      requestAnimationFrame(() => document.getElementById("booking-error")?.focus());
    }
  }

  if (appts.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-lg">No appointments selected.</p>
        <a href="/book" className="btn btn-primary mt-6">Select Service</a>
      </div>
    );
  }

  const failedAppt = failure && "appointmentId" in failure ? appts.find((a) => a.id === failure.appointmentId) : undefined;
  return (
    <form onSubmit={submit} noValidate>
      {/* One centred column: the compact booking summary first, the client details under it — both on one screen. */}
      <H className="book-h2 confirm-h2 confirm-h2--first">Booking summary</H>
      <div className="confirm-after-h2 book-card">
        <ul>
          {appts.map((a) => <SummaryRow key={a.id} a={a} flagged={failedAppt?.id === a.id} overlap={overlapsAnyOther(appts, a)} />)}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-x-4 px-4 text-sm">
          <span className="flex items-center gap-3">
            <a href="/book" className="link-btn no-underline hover:underline">+ Add another service</a>
            <button type="button" className="link-btn" aria-expanded={showPolicy} onClick={() => setShowPolicy((v) => !v)}>View policy</button>
          </span>
          <span><span className="text-muted-foreground">{appts.length} {appts.length === 1 ? "appointment" : "appointments"} · </span><span className="font-medium">Total {total.hasPaid ? formatMoney(total.amount, total.currency) : "Free"}</span></span>
        </div>
      </div>
      {showPolicy && (
        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
          {policies.filter((p) => appts.some((a) => a.serviceName === p.name)).map((p) => p.lines.length > 0 && (
            <div key={p.name}><p className="font-medium text-foreground">{p.name}</p>{p.lines.map((l, i) => <p key={i}>{l}</p>)}</div>
          ))}
          {!policies.some((p) => p.lines.length) && <p>No booking policy is set for these services.</p>}
        </div>
      )}

      <H className="book-h2 confirm-h2 confirm-h2--next">Client details</H>
      <div className="confirm-after-h2 grid gap-x-4 gap-y-5 sm:grid-cols-2">
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
                  type={f.type === "EMAIL" ? "email" : f.type === "PHONE" ? "tel" : f.type === "NUMBER" ? "text" : f.type === "URL" ? "url" : "text"}
                  inputMode={f.type === "NUMBER" ? "numeric" : undefined}
                  autoComplete={({ first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" } as Record<string, string>)[f.target]}
                  aria-invalid={errors[f.target] ? true : undefined} aria-describedby={errors[f.target] ? `e-${f.target}` : undefined} aria-required={f.required || undefined} />
              )}
              {errors[f.target] && <p id={`e-${f.target}`} className="field-error">{errors[f.target]}</p>}
            </div>
          );
        })}
      </div>

      {failure && (
        <div id="booking-error" tabIndex={-1} role="alert" className="mt-6 rounded-[12px] border-l-4 border-destructive bg-secondary p-4 text-sm">
          {failure.code === "slot-gone" && <p><strong>{failedAppt ? `${failedAppt.serviceName}, ${whenLabel(failedAppt.startDate)}` : "One of your times"} is no longer available.</strong> Your details are kept.{failedAppt && <> <a className="underline" href={`/book/time?edit=${failedAppt.id}`}>Choose another time</a></>}</p>}
          {failure.code === "conflict" && <p><strong>Two of your appointments overlap for the same staff member</strong>, so they cannot be booked together. Change one of the times.{failedAppt && <> <a className="underline" href={`/book/time?edit=${failedAppt.id}`}>Change {failedAppt.serviceName}</a></>}</p>}
          {failure.code === "no-payments" && <p><strong>Bookings cannot be completed on this site yet.</strong> The site owner has not connected payments, so no booking can be placed. Your appointments are still in your list.</p>}
          {failure.code === "other" && <p><strong>Something went wrong.</strong> Your booking was not placed. Try again.</p>}
        </div>
      )}

      {/* The total and the one primary action, at the end of the form. */}
      <div className="confirm-submit">
        <p className="text-muted-foreground">Total <span className="font-medium text-foreground">{total.hasPaid ? formatMoney(total.amount, total.currency) : "Free"}</span></p>
        <button type="submit" className="btn btn-primary px-8" disabled={busy} aria-busy={busy}>{busy ? (goesToCheckout ? "Preparing payment…" : "Booking…") : label}</button>
      </div>
    </form>
  );
}

function SummaryRow({ a, flagged, overlap }: { a: Appointment; flagged: boolean; overlap: boolean }) {
  return (
    <li className={`summary-row relative flex items-center justify-between gap-4 border-b border-border px-4 py-2 ${flagged ? "outline outline-2 -outline-offset-2 outline-destructive" : ""}`}>
      <div className="min-w-0">
        <p className="font-medium leading-snug"><a className="summary-row__link" href={`/book/time?edit=${a.id}`}>{a.serviceName}</a> <span className="font-normal">· {formatPrice(a.price)}</span></p>
        <p className="text-sm text-muted-foreground">{whenLabel(a.startDate)} <span aria-hidden="true">·</span> {formatDuration(a.minutes)} <span aria-hidden="true">·</span> {a.locationLabel} <span aria-hidden="true">·</span> {a.staff.name}</p>
        {overlap && <p className="text-xs text-muted-foreground">Overlaps another appointment in your list.</p>}
      </div>
      <p className="summary-row__actions shrink-0 text-sm">
        <a className="link-btn" href={`/book/time?edit=${a.id}`} aria-label={`Edit ${a.serviceName}`}>Edit</a>
        <span aria-hidden="true" className="px-1 text-muted-foreground">·</span>
        <button type="button" className="link-btn" onClick={() => remove(a.id)} aria-label={`Remove ${a.serviceName}`}>Remove</button>
      </p>
    </li>
  );
}
