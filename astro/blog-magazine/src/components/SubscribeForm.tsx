// The newsletter sign-up: the Wix Form named "Newsletter" (an email field), submitted as the visitor (no elevation, no captcha).
// The resolved promise is the only success signal a visitor gets: submissions cannot be read back, so the page says "subscribed",
// never anything about delivery. The consent checkbox is a required step in the page (it is the consent text from the dashboard
// copy); the form itself stores the email.
import { useState } from "react";
import { submissions } from "@wix/forms";

interface Props { formId: string | null; consent: string; cta: string; id?: string }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeForm({ formId, consent, cta, id = "sub" }: Props) {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [checked, setChecked] = useState(false);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy) return;
    setFailed(false);
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Enter your email address"; else if (!EMAIL.test(email.trim())) e.email = "Enter an email address in the format name@example.com";
    if (!checked) e.consent = "Check the box to agree to receive the newsletter";
    setErrors(e);
    if (e.email || e.consent) { setTimeout(() => document.querySelector<HTMLElement>(`#${id} [aria-invalid="true"]`)?.focus(), 30); return; }
    if (!formId) { setFailed(true); return; }
    setBusy(true);
    try {
      await submissions.createSubmission({ formId, submissions: { email: email.trim() } } as any);
      setOk(true);
    } catch (err: any) {
      console.error("[subscribe] submit failed", err);
      const v = err?.details?.validationError?.fieldViolations?.[0]?.data?.errors?.[0];
      if (v?.errorPath === "email") setErrors({ email: v.errorMessage ?? "Enter an email address in the format name@example.com" }); else setFailed(true);
      setBusy(false);
    }
  }

  if (ok) return <div role="status" className="note"><strong>You are subscribed.</strong></div>;
  return (
    <form id={id} onSubmit={onSubmit} noValidate className="grid gap-3">
      {/* The email field runs the full width, square-cornered, with the Subscribe button set inside it at the right. */}
      <div>
        <div className="sub-field">
          <label htmlFor={`${id}-email`} className="sr-only">Email (required)</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="Email" className="field" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((x) => ({ ...x, email: undefined })); }}
            aria-required="true" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? `${id}-email-e` : undefined} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy} aria-busy={busy}>{busy ? "Subscribing…" : cta}</button>
        </div>
        {errors.email && <p id={`${id}-email-e`} className="field-error">{errors.email}</p>}
      </div>
      <div>
        <label className="check">
          <input type="checkbox" checked={checked} onChange={(e) => { setChecked(e.target.checked); if (errors.consent) setErrors((x) => ({ ...x, consent: undefined })); }}
            aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? `${id}-consent-e` : undefined} />
          <span>{consent}</span>
        </label>
        {errors.consent && <p id={`${id}-consent-e`} className="field-error">{errors.consent}</p>}
      </div>
      {failed && <p role="alert" className="note"><strong>Something went wrong.</strong> You are not subscribed. Try again.</p>}
    </form>
  );
}
