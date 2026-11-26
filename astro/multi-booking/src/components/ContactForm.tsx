// The contact form: Wix Forms, schema-driven (forms.listForms -> fields[], bound by `target`), submitted as the visitor
// (submissions.createSubmission, no elevation, no captcha). The submit's resolved promise is the only success signal a visitor
// gets: submissions cannot be read back, so the page says "sent", never "received by <person>".
import { useEffect, useState } from "react";
import { forms, submissions } from "@wix/forms";

type Field = { target: string; label: string; required: boolean; format?: string; textarea: boolean; min?: number; max?: number };
const FALLBACK: Field[] = [
  { target: "first_name", label: "First name", required: true, textarea: false },
  { target: "last_name", label: "Last name", required: true, textarea: false },
  { target: "email", label: "Email", required: true, format: "EMAIL", textarea: false },
];
const AUTOCOMPLETE: Record<string, string> = { first_name: "given-name", last_name: "family-name", email: "email", phone: "tel" };

function fieldError(f: Field, raw: string): string {
  const v = raw.trim();
  if (f.required && !v) return "Required";
  if (!v) return "";
  if (f.min && v.length < f.min) return `At least ${f.min} characters`;
  if (f.max && v.length > f.max) return `At most ${f.max} characters`;
  if (f.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email";
  if (f.format === "PHONE" && !/^[+()\-\s\d]{7,}$/.test(v)) return "Enter a valid phone number";
  return "";
}

export default function ContactForm() {
  const [formId, setFormId] = useState<string | null | undefined>(undefined); // undefined = loading, null = no form
  const [fields, setFields] = useState<Field[]>(FALLBACK);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        // queryForms is a POST: unlike listForms (a cacheable GET) it cannot be answered from a browser cache entry made on another origin.
        const res: any = await forms.queryForms().eq("namespace" as any, "wix.form_app.form").find();
        const list: any[] = res.items ?? [];
        const form: any = list.find((f: any) => f.name === "Contact") ?? list[0];
        if (!form) { live && setFormId(null); return; }
        const fs: Field[] = ((form as any).fields ?? []).filter((f: any) => f.target && !f.hidden).map((f: any) => ({
          target: f.target, label: f.view?.label ?? f.target, required: !!f.validation?.required, format: f.validation?.string?.format,
          textarea: f.view?.fieldType === "TEXT_AREA" || f.target === "message", min: f.validation?.string?.minLength, max: f.validation?.string?.maxLength,
        }));
        if (live) { setFields(fs.length ? fs : FALLBACK); setFormId(form._id ?? form.id); }
      } catch (e) { console.error("contact form read failed", e); live && setFormId(null); }
    })();
    return () => { live = false; };
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
      const map: Record<string, string> = {};
      for (const v of err?.details?.validationError?.fieldViolations ?? []) for (const fe of v?.data?.errors ?? []) if (fe.errorPath && !map[fe.errorPath]) map[fe.errorPath] = fe.errorMessage ?? "Invalid value";
      if (Object.keys(map).length) { setErrors(map); setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 50); }
      else { setFailed(true); setTimeout(() => document.getElementById("contact-error")?.focus(), 50); }
      setBusy(false);
    }
  }

  if (formId === undefined) return <div className="grid gap-4" aria-busy="true" aria-label="Loading form">{[0, 1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse bg-secondary" aria-hidden="true" />)}</div>;
  if (formId === null) return <p className="note" role="status">The form could not be loaded. Use the details on this page to get in touch.</p>;
  if (done) return <div role="status" className="note"><strong>Your message was sent.</strong></div>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.target} className={f.textarea || f.target === "email" ? "sm:col-span-2" : ""}>
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
