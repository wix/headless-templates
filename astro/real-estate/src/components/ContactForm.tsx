// A Wix Forms form, rendered from the form's own fields (read on the server, see lib/forms.ts) and submitted as the visitor
// (submissions.createSubmission, no elevation, no captcha). The submit's resolved promise is the only success signal a visitor gets:
// submissions cannot be read back, so the page says "sent", never "received by <person>".
import { useEffect, useState } from "react";
import { submissions } from "@wix/forms";
import type { FormField as Field, SiteForm } from "../lib/forms";

const AUTOCOMPLETE: Record<string, string> = { first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" };

function fieldError(f: Field, raw: string): string {
  const v = raw.trim();
  if (f.required && !v) return `Enter your ${f.label.toLowerCase()}`;
  if (!v) return "";
  if (f.min && v.length < f.min) return `At least ${f.min} characters`;
  if (f.max && v.length > f.max) return `At most ${f.max} characters`;
  if (f.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email";
  if (f.format === "PHONE" && !/^[+()\-\s\d]{7,}$/.test(v)) return "Enter a valid phone number";
  return "";
}

export default function ContactForm({ form, submitLabel = "Submit", doneText = "Your message was sent." }: { form: SiteForm | null; submitLabel?: string; doneText?: string }) {
  const formId = form?.id ?? null, fields = form?.fields ?? [];
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  // A "Request a viewing" link arrives with ?property=<title>: it fills the Property field (editable).
  useEffect(() => {
    const svc = new URLSearchParams(window.location.search).get("property");
    if (svc) setValues((v) => ({ property: svc.slice(0, 120), ...v }));
  }, []);

  const set = (t: string, v: string) => { setValues((x) => ({ ...x, [t]: v })); if (errors[t]) setErrors((e) => ({ ...e, [t]: "" })); };

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy || !formId) return;
    setFailed(false);
    const e: Record<string, string> = {};
    for (const f of fields) { const m = fieldError(f, values[f.target] ?? ""); if (m) e[f.target] = m; }
    setErrors(e);
    if (Object.keys(e).length) { setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); return; }
    setBusy(true);
    try {
      const data = Object.fromEntries(fields.filter((f) => (values[f.target] ?? "").trim()).map((f) => [f.target, values[f.target].trim()]));
      await submissions.createSubmission({ formId, submissions: data } as any);
      setDone(true);
    } catch (err: any) {
      console.error("[contact form] submit failed", err);
      const map: Record<string, string> = {};
      for (const v of err?.details?.validationError?.fieldViolations ?? []) for (const fe of v?.data?.errors ?? []) if (fe.errorPath && !map[fe.errorPath]) map[fe.errorPath] = fe.errorMessage ?? "Invalid value";
      if (Object.keys(map).length) { setErrors(map); setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); }
      else { setFailed(true); setTimeout(() => document.getElementById("contact-error")?.focus(), 50); }
      setBusy(false);
    }
  }

  if (!formId || !fields.length) return <p className="note" role="status">The form could not be loaded. Use the details on this page to get in touch.</p>;
  if (done) return <div role="status" className="note"><strong>{doneText}</strong></div>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.target} className={f.textarea || f.target === "property" || f.target === "property_address" ? "sm:col-span-2" : ""}>
          <label htmlFor={`c-${f.target}`} className="field-label">{f.label}{f.required && <span className="field-req"> (required)</span>}</label>
          {f.textarea || f.target === "message" ? (
            <textarea id={`c-${f.target}`} name={f.target} className="field" value={values[f.target] ?? ""} onChange={(e) => set(f.target, e.target.value)} maxLength={f.max}
              aria-invalid={errors[f.target] ? true : undefined} aria-describedby={errors[f.target] ? `ce-${f.target}` : undefined} />
          ) : (
            <input id={`c-${f.target}`} name={f.target} className="field" value={values[f.target] ?? ""} onChange={(e) => set(f.target, e.target.value)}
              type={f.format === "EMAIL" ? "email" : f.format === "PHONE" ? "tel" : "text"} autoComplete={AUTOCOMPLETE[f.target]} aria-required={f.required || undefined}
              aria-invalid={errors[f.target] ? true : undefined} aria-describedby={errors[f.target] ? `ce-${f.target}` : undefined} />
          )}
          {errors[f.target] && <p id={`ce-${f.target}`} className="field-error">{errors[f.target]}</p>}
        </div>
      ))}
      {failed && <p id="contact-error" tabIndex={-1} role="alert" className="note border-destructive sm:col-span-2"><strong>Something went wrong.</strong> Your message was not sent. Try again.</p>}
      <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>{busy ? "Sending…" : submitLabel}</button></div>
    </form>
  );
}
