import { httpClient } from "@wix/essentials";
import { CONTACT_FORM_ID } from "./constants";

export type ContactField = {
  target: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select" | "checkbox";
  required: boolean;
  options: string[];
};

/**
 * The form's field definitions, read over REST rather than through
 * `forms.getForm()`.
 *
 * `@wix/forms`' form-schema module is a namespace re-export of one very large
 * generated module, so importing it pulls ~4 MB into the server bundle even
 * for a single call — enough on its own to exceed the hosting size limit.
 * This endpoint returns the same definitions for ~0 KB. (`@wix/forms` is still
 * used for `submissions`, which is small.)
 *
 * Note the REST shape differs from the SDK's: fields live under `fields` (not
 * `formFields`), and carry `view` / `validation` instead of `inputOptions`.
 */
const FORM_SCHEMA_URL = `https://www.wixapis.com/form-schema-service/v4/forms/${CONTACT_FORM_ID}`;

function toField(field: any): ContactField | null {
  // Display-only nodes (the submit button, text blocks) carry no target.
  if (!field?.target || field.hidden) return null;

  const view = field.view ?? {};
  const validation = field.validation ?? {};
  const label = view.label || field.target;
  const required = validation.required === true;
  const choices: string[] = validation.string?.enum ?? [];

  let type: ContactField["type"] = "text";
  if (choices.length > 0) type = "select";
  else if (view.fieldType === "TEXT_AREA") type = "textarea";
  else if (view.fieldType === "CONTACTS_EMAIL" || validation.string?.format === "EMAIL") type = "email";
  else if (view.fieldType === "CONTACTS_PHONE" || validation.string?.format === "PHONE") type = "tel";
  else if (validation.number) type = "number";
  else if (validation.boolean) type = "checkbox";

  return { target: field.target, label, required, type, options: choices };
}

export async function getContactFields(): Promise<ContactField[]> {
  try {
    const response = await httpClient.fetchWithAuth(FORM_SCHEMA_URL);
    if (!response.ok) {
      console.error("[contact] form schema request failed:", response.status);
      return [];
    }
    const { form } = await response.json();
    return (form?.fields ?? []).map(toField).filter(Boolean) as ContactField[];
  } catch (err) {
    console.error("[contact] could not load the form:", err);
    return [];
  }
}
