// The contact form: Wix Forms, schema-driven (the page reads the form on the server and passes its fields, bound by `target`), submitted as the visitor
// (submissions.createSubmission, no elevation, no captcha). The submit's resolved promise is the only success signal a visitor
// gets: submissions cannot be read back, so the page says "sent", never "received by <person>".
import { useState } from "react";
import { submissions } from "@wix/forms";
import type { FormField as Field } from "../lib/content";

const AUTOCOMPLETE: Record<string, string> = { first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" };

// Every message names its field and says what to enter (a list of identical "Required" errors tells a screen-reader user nothing).
function fieldError(f: Field, raw: string): string {
  const v = raw.trim(), name = f.label.toLowerCase();
  if (f.required && !v) return f.format === "EMAIL" ? "Enter your email address" : `Enter your ${name}`;
  if (!v) return "";
  if (f.min && v.length < f.min) return `${f.label} must be at least ${f.min} characters`;
  if (f.max && v.length > f.max) return `${f.label} must be at most ${f.max} characters`;
  if (f.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter an email address in the format name@example.com";
  if (f.format === "PHONE" && !/^[+()\-\s\d]{7,}$/.test(v)) return "Enter a phone number using digits, for example 123-456-7890";
  return "";
}

export default function ContactForm({ formId, fields }: { formId: string; fields: Field[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

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
      console.error("[contact] submit failed", err);
      const map: Record<string, string> = {};
      for (const v of err?.details?.validationError?.fieldViolations ?? []) for (const fe of v?.data?.errors ?? []) if (fe.errorPath && !map[fe.errorPath]) map[fe.errorPath] = fe.errorMessage ?? `Check your ${(fields.find((x) => x.target === fe.errorPath)?.label ?? "entry").toLowerCase()}`;
      if (Object.keys(map).length) { setErrors(map); setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); }
      else { setFailed(true); setTimeout(() => document.getElementById("contact-error")?.focus(), 50); }
      setBusy(false);
    }
  }

  if (done) return <div role="status" className="note"><strong>Your message was sent.</strong></div>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.target} className={f.textarea ? "sm:col-span-2" : ""}>
          <label htmlFor={`c-${f.target}`} className="field-label">{f.label}{f.required && <span className="sr-only"> (required)</span>}</label>
          {f.textarea ? (
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
      <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>{busy ? "Sending…" : "Submit"}</button></div>
    </form>
  );
}
