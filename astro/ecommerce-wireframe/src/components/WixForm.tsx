// Schema-driven Wix Form: the fields, labels, order and required flags are
// read live from the form schema (server-side, passed in as `form`), so the
// owner edits the form in the dashboard with no code change.
import { useMemo, useState } from "react";

const camel = (e?: string) => (e ?? "").toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
const ricosText = (v: any): string => (typeof v === "string" ? v : (v?.nodes ?? []).map((n: any) => n.textData?.text ?? ricosText(n)).join(""));

function project(form: any) {
  const order = new Map<string, number>(
    (form?.steps ?? []).flatMap((s: any) => s.layout?.large?.items ?? s.layout?.medium?.items ?? s.layout?.small?.items ?? [])
      .sort((a: any, b: any) => (a.row - b.row) || (a.column - b.column)).map((it: any, i: number) => [it.fieldId, i]),
  );
  const fields = (form?.formFields ?? []).filter((f: any) => f.fieldType === "INPUT" && !f.hidden).map((f: any) => {
    const io = f.inputOptions ?? {};
    const to = io[`${camel(io.inputType)}Options`] ?? {};
    const comp = to[`${camel(to.componentType)}Options`] ?? {};
    const val = to.validation ?? {};
    return { id: f._id ?? f.id, target: io.target, inputType: io.inputType, identifier: f.identifier, componentType: to.componentType,
      label: io.inputType === "BOOLEAN" ? ricosText(comp.label) : comp.label ?? io.target, placeholder: comp.placeholder ?? "",
      required: !!io.required, format: val.format, minLength: val.minLength, maxLength: val.maxLength };
  }).filter((f: any) => ["STRING", "BOOLEAN"].includes(f.inputType))
    .sort((a: any, b: any) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
  const submit = (form?.formFields ?? []).find((f: any) => f.identifier === "SUBMIT_BUTTON")?.displayOptions?.pageNavigationOptions?.submitText;
  const thanks = ricosText(form?.submitSettings?.thankYouMessageOptions?.richContent);
  return { fields, submit, thanks };
}

function check(f: any, raw: any): string {
  if (f.inputType === "BOOLEAN") return f.required && !raw ? "Please tick this box to continue." : "";
  const v = String(raw ?? "").trim();
  if (f.required && !v) return `${f.label} is required.`;
  if (!v) return "";
  if (f.minLength && v.length < f.minLength) return `${f.label} must be at least ${f.minLength} characters.`;
  if (f.maxLength && v.length > f.maxLength) return `${f.label} must be at most ${f.maxLength} characters.`;
  if (f.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return "";
}
const SERVER_COPY: Record<string, (f: any) => string> = {
  REQUIRED_VALUE_ERROR: (f) => `${f.label} is required.`, FORMAT_ERROR: (f) => (f.format === "EMAIL" ? "Enter a valid email address." : `Please check ${f.label}.`),
  MIN_LENGTH_ERROR: (f) => `${f.label} must be at least ${f.minLength} characters.`, MAX_LENGTH_ERROR: (f) => `${f.label} must be at most ${f.maxLength} characters.`,
};

export default function WixForm({ form, formId, variant = "stack", submitFallback = "Submit" }: { form: any; formId: string; variant?: "stack" | "inline"; submitFallback?: string }) {
  const { fields, submit, thanks } = useMemo(() => project(form), [form]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  if (!form) return null;
  const uid = formId.slice(0, 6);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, any> = {};
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const raw = f.inputType === "BOOLEAN" ? fd.get(f.target) === "on" : String(fd.get(f.target) ?? "").trim();
      const m = check(f, raw); if (m) errs[f.target] = m;
      if (f.inputType === "BOOLEAN" ? raw : raw !== "") values[f.target] = raw;
    }
    setErrors(errs);
    if (Object.keys(errs).length) { (e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement)?.focus(); return; }
    setState("sending");
    try {
      const r = await fetch("/api/form", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formId, values }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) { setState("done"); return; }
      const byTarget = Object.fromEntries(fields.map((f: any) => [f.target, f]));
      const mapped: Record<string, string> = {};
      for (const [path, type] of Object.entries(d.fieldErrors ?? {})) { const f = byTarget[path.split("/")[0]]; if (f) mapped[f.target] = SERVER_COPY[type as string]?.(f) ?? `Please check ${f.label}.`; }
      setErrors(mapped); setState(Object.keys(mapped).length ? "idle" : "error");
    } catch (e) { console.error("form submit", e); setState("error"); }
  }

  if (state === "done") return <p className="form-done" role="status">{thanks || "Thanks — your message was sent."}</p>;
  return (
    <form className={`wform wform--${variant}`} noValidate onSubmit={onSubmit}>
      {fields.map((f: any) => {
        const id = `${uid}-${f.target}`, err = errors[f.target];
        const common = { id, name: f.target, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : undefined, required: f.required } as any;
        if (f.inputType === "BOOLEAN") return (
          <div key={f.target} className="wform__check">
            <label className="check"><input type="checkbox" {...common} /> <span>{f.label}{f.required ? "" : " (optional)"}</span></label>
            {err ? <span id={`${id}-err`} className="field__error">{err}</span> : null}
          </div>
        );
        return (
          <div key={f.target} className={`field wform__${f.identifier === "TEXT_AREA" ? "wide" : "field"}`}>
            <label htmlFor={id} className={variant === "inline" ? "sr-only" : "field__label"}>{f.label}{f.required ? "" : " (optional)"}</label>
            {f.identifier === "TEXT_AREA"
              ? <textarea className="textarea" rows={5} {...common} maxLength={f.maxLength} />
              : <input className="input" type={f.format === "EMAIL" ? "email" : "text"} inputMode={f.format === "EMAIL" ? "email" : undefined}
                  autoComplete={f.format === "EMAIL" ? "email" : f.identifier === "CONTACTS_FIRST_NAME" ? "given-name" : f.identifier === "CONTACTS_LAST_NAME" ? "family-name" : undefined}
                  placeholder={variant === "inline" ? f.label : f.placeholder} {...common} maxLength={f.maxLength} />}
            {err ? <span id={`${id}-err`} className="field__error">{err}</span> : null}
          </div>
        );
      })}
      <div className="wform__submit">
        <button className="btn btn--primary" disabled={state === "sending"}>{state === "sending" ? <span className="spinner" aria-hidden="true" /> : null}{submit || submitFallback}</button>
        {state === "error" ? <p className="field__error" role="alert">We couldn't send this. Please try again.</p> : null}
      </div>
    </form>
  );
}
