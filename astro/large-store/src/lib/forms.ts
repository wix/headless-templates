// Wix Forms are looked up by NAME at request time (Dashboard → Forms & Submissions), never by a hardcoded id:
// the site template provisions "Newsletter" and "Contact" forms and their ids differ per site.
import { listForms } from "../wix/forms/forms";

export async function findFormId(name: string): Promise<string | null> {
  try {
    const forms = await listForms();
    return forms.find((f) => f.name === name)?.id ?? null;
  } catch (err) {
    console.error(`forms: could not look up the "${name}" form`, err);
    return null;
  }
}
