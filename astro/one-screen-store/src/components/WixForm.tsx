// A Wix Form rendered from its LIVE schema: the owner renames, reorders, adds or requires fields in
// the dashboard (Forms & Submissions) and this follows with no code change — no field is named here.
// Handles the controls a newsletter / contact form uses (text-ish, textarea, checkbox); anything else
// falls back to a plain text input. One component serves both footer newsletter and Contact page.
import { useWixForm, FORM_ERROR } from "../hooks/forms/useWixForm";
import type { FormFieldDto } from "../wix/forms/types";

// The field's purpose for the browser's autofill: email, phone, and the two name fields by their target.
const auto = (f: FormFieldDto) =>
  f.control === "email" ? "email" : f.control === "phone" ? "tel"
  : /first/i.test(f.target) ? "given-name" : /last/i.test(f.target) ? "family-name" : undefined;
const input = "min-h-12 w-full rounded-md border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-destructive";

export default function WixForm({ formId, idPrefix, thanks, again }: { formId: string; idPrefix: string; thanks: string; again?: string }) {
  const f = useWixForm(formId);
  const { form, values, setValues, bind, submit, errors, loading, closed, outcome, reset } = f;

  if (outcome) {
    return (
      <div className="flex min-h-[9rem] flex-col items-start justify-center gap-4" role="status">
        <p className="text-lg">{outcome.message || thanks}</p>
        {again && <button type="button" onClick={reset} className="btn btn-secondary">{again}</button>}
      </div>
    );
  }
  if (!form) {
    if (errors[FORM_ERROR]) return <p className="text-sm text-destructive">{errors[FORM_ERROR]}</p>;
    return <div className="h-[9rem] animate-pulse bg-muted/60" aria-hidden="true" />;
  }
  if (closed) return <p className="text-sm text-muted-foreground">{form.disabledMessage || "This form is closed for now."}</p>;

  const mark = (field: FormFieldDto) => (!field.required || form.requiredIndicator === "NONE" ? "" : form.requiredIndicator === "TEXT" ? " (required)" : " *");

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {form.fields.map((field) => {
        const err = errors[field.target];
        const describedBy = err ? `err-${idPrefix}-${field.target}` : undefined;
        if (field.control === "checkbox") {
          return (
            <div key={field.target} className="flex flex-col gap-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={values[field.target] === true} disabled={field.readOnly}
                  onChange={(e) => setValues((v) => ({ ...v, [field.target]: e.target.checked }))}
                  aria-describedby={describedBy} aria-invalid={!!err} className="h-5 w-5 shrink-0 accent-foreground" />
                <span>{field.label}{mark(field)}</span>
              </label>
              {err && <p id={describedBy} className="text-xs text-destructive">{err}</p>}
            </div>
          );
        }
        const id = `${idPrefix}-${field.target}`;
        return (
          <div key={field.target} className="flex flex-col gap-2">
            <label htmlFor={id} className={field.showLabel ? "text-sm font-medium" : "sr-only"}>{field.label}{mark(field)}</label>
            {field.control === "textarea" ? (
              <textarea id={id} {...bind(field.target)} aria-required={field.required || undefined} rows={5} placeholder={field.placeholder} readOnly={field.readOnly} aria-describedby={describedBy} aria-invalid={!!err} className={`${input} py-3`} />
            ) : (
              <input id={id} {...bind(field.target)} type={field.control === "email" ? "email" : field.control === "phone" ? "tel" : "text"}
                placeholder={field.placeholder} readOnly={field.readOnly} aria-describedby={describedBy} aria-invalid={!!err}
                autoComplete={auto(field)} aria-required={field.required || undefined} className={input} />
            )}
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            {err && <p id={describedBy} className="text-xs text-destructive">{err}</p>}
          </div>
        );
      })}
      {errors[FORM_ERROR] && <p className="text-sm text-destructive">{errors[FORM_ERROR]}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary self-start">
        {loading ? "Sending…" : form.submitText || "Submit"}
      </button>
    </form>
  );
}
