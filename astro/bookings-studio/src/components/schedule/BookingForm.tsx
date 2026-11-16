// Booking form: client details, number of participants (counter, "N spots left"), Booking summary
// ("$ x N", total), Payment (Pay online / Use a membership or plan), View policy, and the one primary action.
// One class or one course per booking; the visitor chooses how many people. Nothing exists in Bookings until the primary
// action. The label names the outcome: "Book now" books (free or pay in person: placeOrder), "Continue to payment" hands off
// to Wix-hosted checkout. The plan choice is a visible design state (see PlanRow).
import { useEffect, useMemo, useState } from "react";
import { plansV3 } from "@wix/pricing-plans";
import { loadFormFields, submit, needsCheckout, BookingError, FALLBACK_FIELDS, type FormField, type BookingFailure } from "../../lib/booking";
import { findClassSession, loadCourses, type Session } from "../../lib/schedule";
import { loadDetails, saveDetails, clearDetails, savePlaced, savePending } from "../../lib/drafts";
import { formatMoney, type ServiceDTO } from "../../lib/services";
import { dayLong, dayShort, displayZone, timeLabel } from "../../lib/dates";
import { ChevronLeft } from "./icons";

export default function BookingForm({ service: svc, start }: { service: ServiceDTO; start: string }) {
  const isCourse = svc.type === "COURSE";
  const tz = useMemo(displayZone, []);
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = loading, null = gone
  const [fields, setFields] = useState<FormField[]>(FALLBACK_FIELDS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [n, setN] = useState(1);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<BookingFailure | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [planNames, setPlanNames] = useState<string[]>([]);

  const nKey = `participants.${svc.id}.${start}`;
  useEffect(() => { setValues(loadDetails()); try { const v = Number(sessionStorage.getItem(nKey)); if (v > 0) setN(v); } catch (err) { console.error(err); /* storage unavailable */ } }, []);
  useEffect(() => { try { sessionStorage.setItem(nKey, String(n)); } catch (err) { console.error(err); /* storage unavailable */ } }, [n]);
  useEffect(() => { let live = true; loadFormFields(svc.formId).then((f) => live && setFields(f)); return () => { live = false; }; }, [svc.formId]);
  useEffect(() => {
    if (!svc.payment.plan) return;
    let live = true;
    plansV3.queryPlans().eq("visibility", "PUBLIC").find().then((r: any) => live && setPlanNames((r.items ?? []).filter((p: any) => svc.payment.planIds.includes(p._id)).map((p: any) => p.name))).catch((err) => console.error(err));
    return () => { live = false; };
  }, [svc]);

  async function loadSession() {
    try {
      if (isCourse) {
        const [c] = await loadCourses([svc], tz);
        setSession(c && c.status !== "ended" ? (c.sessions[0] ? { ...c.sessions[0], state: c.closed ? "enrollment-closed" : c.left <= 0 ? "full" : "enroll", left: c.left, total: c.total } : { id: svc.id, serviceId: svc.id, kind: "course", start: c.first, end: c.last, minutes: 0, staff: null, state: c.closed ? "enrollment-closed" : "enroll", total: c.total, left: c.left, course: { first: c.first, last: c.last, sessions: 0, status: c.status === "in-progress" ? "in-progress" : "upcoming", index: 1 } }) : null);
      } else {
        setSession(await findClassSession(svc, start, tz));
      }
    } catch (err) { console.error(err); setSession(null); }
  }
  useEffect(() => { loadSession(); }, [svc.id, start]);

  const max = Math.max(1, Math.min(svc.policy.maxParticipants, session?.left ?? 1));
  const bookable = !!session && (session.state === "book" || session.state === "enroll") && session.left > 0;
  useEffect(() => { if (n > max) setN(max); }, [max]);

  const unit = svc.price ? Number(svc.price.value) : 0;
  const total = unit * n;
  const money = (v: number) => (svc.price ? formatMoney(v, svc.price.currency) : "Free");
  const goesToCheckout = needsCheckout(svc);
  const label = goesToCheckout ? "Continue to payment" : "Book now";
  const noun = isCourse ? "course" : "class";
  const staff = session?.staff?.name ?? svc.staff[0]?.name;

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

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy || !bookable) return;
    setFailure(null);
    if (!validate()) { setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); return; } // after React has drawn the errors
    setBusy(true);
    try {
      const clean = Object.fromEntries(Object.entries(values).filter(([k, v]) => v.trim() && fields.some((f) => f.target === k)).map(([k, v]) => [k, v.trim()]));
      const res = await submit({ service: svc, session, start, tz, participants: n, values: clean });
      if (res.kind === "checkout") { savePending({ href: location.pathname + location.search, serviceName: svc.name }); window.location.assign(res.url); return; }
      savePlaced({ serviceName: svc.name, kind: isCourse ? "course" : "class", when: isCourse ? `Starts ${dayShort(session!.course?.first ?? session!.start)}` : `${dayLong(session!.start)} · ${timeLabel(session!.start)}`, participants: n, total: money(total), email: clean.email, at: Date.now() });
      clearDetails();
      window.location.assign("/book/done?from=order");
    } catch (e: any) {
      const f: BookingFailure = e instanceof BookingError ? e.failure : { code: "other", message: String(e?.message ?? e) };
      setFailure(f); setBusy(false);
      if (f.code === "spots" || f.code === "gone" || f.code === "closed") loadSession(); // refresh what the visitor sees; typed details stay
      setTimeout(() => document.getElementById("booking-error")?.focus(), 50);
    }
  }

  const back = (
    <a href={`/schedule${typeof location !== "undefined" ? backQuery(start, svc.slug) : ""}`} className="link-btn text-muted-foreground no-underline hover:underline"><ChevronLeft />Back</a>
  );

  if (session === undefined) return <div><div className="mt-4">{back}</div><div className="mt-10 grid gap-4" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse bg-secondary" aria-hidden="true" />)}</div></div>;
  if (session === null) return (
    <div><div className="mt-4">{back}</div>
      <h1 className="mt-4 text-h2">Booking form</h1>
      <p className="mt-6 max-w-[52ch] text-lg text-muted-foreground">{isCourse ? "This course is no longer available." : "This session is no longer on the timetable."} Choose another from the schedule.</p>
      <a href="/#schedule" className="btn btn-primary mt-8">View schedule</a>
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mt-4">{back}</div>
      <h1 className="mt-4 text-h2">Booking form</h1>

      {!bookable && (
        <p className="note mt-6" role="status"><strong>{session.state === "enrollment-closed" ? "Enrollment is closed for this course." : session.state === "waitlist" ? "This class is full and the waitlist cannot be joined online." : `This ${noun} is full.`}</strong> <a className="underline" href="/#schedule">Choose another from the schedule</a>.</p>
      )}

      <h2 className="mt-10 text-lg font-medium">Client details</h2>
      <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map((f) => {
          const wide = f.target === "add_your_message" || f.options;
          return (
            <div key={f.target} className={wide ? "sm:col-span-2" : ""}>
              <label htmlFor={`f-${f.target}`} className="field-label">{f.label}{f.required && <span className="sr-only"> (required)</span>}</label>
              {f.options ? (
                <select id={`f-${f.target}`} className="field" value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)}><option value="">Select</option>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
              ) : f.target === "add_your_message" ? (
                <textarea id={`f-${f.target}`} className="field" value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)} />
              ) : (
                <input id={`f-${f.target}`} className="field" name={f.target} value={values[f.target] ?? ""} onChange={(e) => setField(f.target, e.target.value)}
                  type={f.type === "EMAIL" ? "email" : f.type === "PHONE" ? "tel" : f.type === "URL" ? "url" : "text"} inputMode={f.type === "NUMBER" ? "numeric" : undefined}
                  autoComplete={({ first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" } as Record<string, string>)[f.target]}
                  aria-invalid={errors[f.target] ? true : undefined} aria-describedby={errors[f.target] ? `e-${f.target}` : undefined} aria-required={f.required || undefined} />
              )}
              {errors[f.target] && <p id={`e-${f.target}`} className="field-error">{errors[f.target]}</p>}
            </div>
          );
        })}
        <div className="sm:col-span-2">
          <p id="participants-label" className="field-label">Number of participants</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="counter" role="group" aria-labelledby="participants-label">
              <button type="button" aria-label="Fewer participants" disabled={n <= 1 || !bookable} onClick={() => setN(n - 1)}>−</button>
              <output aria-live="polite" aria-label={`${n} participants`}>{n}</output>
              <button type="button" aria-label="More participants" disabled={n >= max || !bookable} onClick={() => setN(n + 1)}>+</button>
            </div>
            <p className="text-sm text-muted-foreground">{session.left} {session.left === 1 ? "spot" : "spots"} left in this {noun}{svc.policy.maxParticipants < session.left ? ` · up to ${svc.policy.maxParticipants} per booking` : ""}</p>
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-medium">Booking summary</h2>
      <div className="mt-6 bk-sum">
        <div className="flex items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="font-medium leading-snug">{svc.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{isCourse && session.course ? `Starts ${dayShort(session.course.first)} · ${session.course.sessions ? `${session.course.sessions} sessions` : "sessions weekly"}${session.minutes ? ` · ${session.minutes} min` : ""}` : `${dayLong(session.start)} · ${timeLabel(session.start)} · ${session.minutes} min`}</p>
            <p className="text-sm text-muted-foreground">{svc.locationLabel}{staff ? ` · ${staff}` : ""}</p>
          </div>
          <p className="shrink-0 text-sm font-medium">{svc.price ? `${money(unit)} × ${n}` : "Free"}</p>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border bg-secondary px-4 py-3 text-sm">
          <span className="text-muted-foreground">1 {noun} · {n} {n === 1 ? "participant" : "participants"}</span>
          <span className="font-medium">Total {svc.price ? money(total) : "Free"}</span>
        </div>
      </div>

      {/* Payment on every form: the one way to pay, and the plan choice when the service accepts a plan. */}
      <fieldset className="mt-10">
        <legend className="text-lg font-medium">Payment</legend>
        <div className="mt-6 grid gap-2">
          <label className="pay-row"><input type="radio" name="pay" checked readOnly /><span className="flex-1 text-sm">{svc.price ? (svc.payment.online || !svc.payment.inPerson ? "Pay online" : "Pay in person") : "Pay in person"}</span><span className="text-sm text-muted-foreground">{svc.price ? money(total) : "Free"}</span></label>
          {svc.payment.plan && <PlanRow names={planNames} payOnline={!!svc.price} />}
        </div>
      </fieldset>

      <div className="mt-4">
        <button type="button" className="link-btn" aria-expanded={showPolicy} onClick={() => setShowPolicy((v) => !v)}>View policy</button>
        {showPolicy && (
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            {svc.policy.lines.length ? svc.policy.lines.map((l, i) => <p key={i}>{l}</p>) : <p>No booking policy is set for this {noun}.</p>}
            {svc.policy.limitLateMinutes != null && <p>Enrollment closes {svc.policy.limitLateMinutes >= 1440 ? `${Math.round(svc.policy.limitLateMinutes / 1440)} day before` : `${svc.policy.limitLateMinutes} minutes before`} the start.</p>}
          </div>
        )}
      </div>

      {failure && (
        <div id="booking-error" tabIndex={-1} role="alert" className="mt-6 border-l-4 border-destructive bg-secondary p-4 text-sm">
          {failure.code === "gone" && <p><strong>This {noun} is no longer available.</strong> Your details are kept. <a className="underline" href="/#schedule">Choose another from the schedule</a></p>}
          {failure.code === "spots" && <p><strong>{failure.left > 0 ? `Only ${failure.left} ${failure.left === 1 ? "spot is" : "spots are"} left.` : `This ${noun} is now full.`}</strong> {failure.left > 0 ? "Lower the number of participants and try again." : "Your details are kept."}</p>}
          {failure.code === "closed" && <p><strong>Enrollment for this course has closed.</strong> Your details are kept.</p>}
          {failure.code === "policy" && <p><strong>The booking policy does not allow this number of participants.</strong> You can book up to {svc.policy.maxParticipants} at a time.</p>}
          {failure.code === "no-payments" && <p><strong>Bookings cannot be completed on this site yet.</strong> The site owner has not connected payments, so no booking can be placed.</p>}
          {failure.code === "other" && <p><strong>Something went wrong.</strong> Your booking was not placed. Try again.</p>}
        </div>
      )}

      <div className="action-bar">
        <div className="flow flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Total <span className="font-medium text-foreground">{svc.price ? money(total) : "Free"}</span></p>
          <button type="submit" className="btn btn-primary px-8" disabled={busy || !bookable} aria-busy={busy}>{busy ? (goesToCheckout ? "Preparing payment…" : "Booking…") : label}</button>
        </div>
      </div>
    </form>
  );
}

/** Where Back goes: the timetable on the week and day the visitor came from (the selection is in the URL the timetable keeps). */
function backQuery(start: string, slug: string) {
  try {
    const q = new URLSearchParams();
    const tz = new URLSearchParams(location.search).get("tz");
    if (tz) q.set("tz", tz);
    if (start) q.set("day", start.slice(0, 10));
    if (start) q.set("week", start.slice(0, 10));
    const s = q.toString();
    return s ? `?${s}` : "";
  } catch (err) { console.error(err); return ""; }
}

/**
 * "Use a membership or plan": a VISIBLE DESIGN STATE. The service accepts a plan (service.payment.options.pricingPlan), so the
 * choice is drawn, but redeeming a plan needs a signed-in member, and the "N sessions left" balance is only readable with a member
 * identity. This template has no member sign-in (visitor-side only), so the row is disabled and says why.
 */
function PlanRow({ names, payOnline }: { names: string[]; payOnline: boolean }) {
  return (
    <>
      <label className="pay-row" aria-disabled="true"><input type="radio" name="pay" disabled aria-describedby="plan-limit" /><span className="min-w-0 flex-1 py-1 text-sm">Use a membership or plan{names.length ? ` (${names.join(", ")})` : ""}<span className="block text-xs">Sessions left: shown after sign-in</span></span></label>
      <p id="plan-limit" className="note">Paying with a plan needs a signed-in plan member. This site has no sign-in, so a plan cannot be used here and the number of sessions left cannot be shown. {payOnline ? <>Pay online instead, or <a className="underline" href="/membership">see the membership plans</a>.</> : <><a className="underline" href="/membership">See the membership plans</a>.</>}</p>
    </>
  );
}
