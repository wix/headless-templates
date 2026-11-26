// Wix Forms, read on the server: the form is found by its name (the site template provisions "Contact" and "Valuation") and its fields
// come from the form itself — labels, required flags, formats and lengths — so the page renders exactly what the owner set up.
import { forms } from "@wix/forms";

export type FormField = { target: string; label: string; required: boolean; format?: string; textarea: boolean; min?: number; max?: number };
export type SiteForm = { id: string; fields: FormField[] };

export async function getFormByName(name: string): Promise<SiteForm | null> {
  try {
    const res: any = await forms.queryForms().eq("namespace" as any, "wix.form_app.form").find();
    const form: any = (res.items ?? []).find((f: any) => f.name === name);
    if (!form) { console.error("[forms] form not found", name); return null; }
    const fields: FormField[] = (form.fields ?? []).filter((f: any) => f.target && !f.hidden).map((f: any) => ({
      target: f.target, label: f.view?.label ?? f.target, required: !!f.validation?.required, format: f.validation?.string?.format,
      textarea: f.view?.fieldType === "TEXT_AREA", min: f.validation?.string?.minLength, max: f.validation?.string?.maxLength,
    }));
    return { id: form._id ?? form.id, fields };
  } catch (e) { console.error("[forms] read failed", name, e); return null; }
}
