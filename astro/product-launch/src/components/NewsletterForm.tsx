// Footer newsletter sign-up, rendered from the live Wix Forms schema: the owner renames,
// reorders, adds or requires fields in the dashboard (Forms & Submissions) and this follows
// with no code change — no field is named in code. Handles the text-ish controls and
// checkboxes a sign-up form uses; anything else is rendered as a plain text input.
import { useWixForm, FORM_ERROR } from "../hooks/forms/useWixForm";
import type { FormFieldDto } from "../wix/forms/types";

export default function NewsletterForm({ formId }: { formId: string }) {
  const f = useWixForm(formId);
  const { form, values, setValues, bind, submit, errors, loading, closed, outcome, reset } = f;

  if (outcome) {
    return (
      <div className="form-done" role="status">
        <p>{outcome.message || "Thanks for signing up."}</p>
        <button type="button" onClick={reset} className="link mt-3 text-sm font-normal">Sign up another email</button>
      </div>
    );
  }
  if (!form) {
    if (errors[FORM_ERROR]) return <p className="field-error">{errors[FORM_ERROR]}</p>;
    return <div className="h-[9rem] animate-pulse bg-muted/60" aria-hidden="true" />;
  }
  if (closed) return <p className="field-hint">{form.disabledMessage || "Sign-ups are closed for now."}</p>;

  const mark = (field: FormFieldDto) =>
    !field.required || form.requiredIndicator === "NONE" ? "" : form.requiredIndicator === "TEXT" ? " (required)" : " *";

  const texts = form.fields.filter((f) => f.control !== "checkbox");
  const checks = form.fields.filter((f) => f.control === "checkbox");
  const inline = texts.length === 1; // one field: the input and the button share a row, as in the reference

  const submitBtn = (
    <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Signing up…" : form.submitText || "Sign up"}</button>
  );

  const checkbox = (field: FormFieldDto) => {
    const err = errors[field.target];
    const describedBy = err ? `err-${field.target}` : undefined;
    return (
      <div key={field.target} className="grid gap-1">
        <label className="check">
          <input type="checkbox" checked={values[field.target] === true} disabled={field.readOnly}
            onChange={(e) => setValues((v) => ({ ...v, [field.target]: e.target.checked }))}
            aria-describedby={describedBy} aria-invalid={!!err} />
          <span>{field.label}{mark(field)}</span>
        </label>
        {err && <p id={describedBy} className="field-error">{err}</p>}
      </div>
    );
  };
  const textField = (field: FormFieldDto, withSubmit = false) => {
    const err = errors[field.target];
    const describedBy = err ? `err-${field.target}` : undefined;
    const id = `nl-${field.target}`;
    return (
      <div key={field.target} className={inline ? "field contents" : "field grid gap-2"}>
        <label htmlFor={id} className={field.showLabel ? "field-label" : "sr-only"}>{field.label}{mark(field)}</label>
        <input id={id} {...bind(field.target)} type={field.control === "email" ? "email" : field.control === "phone" ? "tel" : "text"}
          placeholder={field.placeholder} readOnly={field.readOnly} aria-describedby={describedBy} aria-invalid={!!err}
          autoComplete={field.control === "email" ? "email" : undefined} className="input" />
        {withSubmit && <div className="form-submit">{submitBtn}</div>}
        {field.description && <p className="field-hint">{field.description}</p>}
        {err && <p id={describedBy} className="field-error">{err}</p>}
      </div>
    );
  };
  return (
    <form onSubmit={submit} noValidate className={inline ? `form-inline${texts[0].showLabel ? "" : " form-inline--nolabel"}` : "grid gap-3"}>
      {texts.map((f) => textField(f, inline))}
      {checks.length > 0 && <div className={inline ? "col-span-full" : ""}>{checks.map(checkbox)}</div>}
      {errors[FORM_ERROR] && <p className={`field-error ${inline ? "col-span-full" : ""}`}>{errors[FORM_ERROR]}</p>}
      {!inline && <div>{submitBtn}</div>}
    </form>
  );
}
