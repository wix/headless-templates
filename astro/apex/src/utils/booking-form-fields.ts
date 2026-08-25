// Booking-form SCHEMA — read from the service's own Wix Form.
//
// Wix owns this data (labels, required flags, dropdown options), so we read it
// from the Forms API rather than mirroring it anywhere. What we do NOT do is
// `import { forms } from "@wix/forms"`: that package re-exports an 11 MB
// generated module through a namespace import, so nothing tree-shakes and one
// `getForm` call costs ~4.2 MB of server bundle — landing as a single 4,212 KB
// chunk, over the ~4 MB per-file limit the template registry enforces.
//
// `httpClient.fetchWithAuth` hits the exact endpoint the SDK's `getForm` builds
// (`GET /v4/forms/{formId}`, wix.forms.v4.FormSchemaService.GetForm) and comes
// from `@wix/essentials`, which is already in the bundle — so this is the same
// API and the same data for ~0 KB.
import { auth, httpClient } from "@wix/essentials";
import { cached } from "./ssr-cache";
import type { BookingFormField } from "../components/BookingForm";

// Only field types the island can submit as a simple string value. Complex,
// object-valued fields (e.g. a multi-line ADDRESS) carry no string
// `componentType`, and sending a string for them fails createBooking with
// "must be object". The booking enforces only the contact basics
// (first_name/last_name/email), so skipping optional complex fields is safe.
const RENDERABLE = ["TEXT_INPUT", "PHONE_INPUT", "DROPDOWN"];

function toField(f: any): BookingFormField | null {
  const opts = f.inputOptions;
  const str = opts?.stringOptions;
  const componentType = str?.componentType;
  if (f.fieldType !== "INPUT" || f.hidden || !RENDERABLE.includes(componentType)) return null;
  return {
    label:
      str?.textInputOptions?.label ??
      str?.dropdownOptions?.label ??
      str?.phoneInputOptions?.label ??
      "",
    // The key createBooking expects in formSubmission — never rename it.
    target: opts?.target ?? "",
    required: opts?.required ?? false,
    componentType,
    identifier: f.identifier ?? "",
    options: str?.dropdownOptions?.options?.map((o: any) => ({
      value: o.value ?? o.label ?? "",
      label: o.label ?? o.value ?? "",
    })),
  };
}

/**
 * The booking-form field list for one service, from `service.form._id`.
 * Cached briefly (serve-stale) so a busy service page doesn't re-read the
 * schema on every render. Never throws — a failed read returns [] and the
 * caller renders the page without the form.
 */
export async function bookingFormFields(formId: string | undefined): Promise<BookingFormField[]> {
  if (!formId) return [];
  try {
    return await cached(`forms:${formId}`, 5 * 60_000, async () => {
      const resp = await auth.elevate(httpClient.fetchWithAuth)(
        `https://www.wixapis.com/forms/v4/forms/${formId}`,
      );
      if (!resp.ok) throw new Error(`getForm ${formId}: HTTP ${resp.status}`);
      const body: any = await resp.json();
      const form = body?.form ?? body;
      return (form?.formFields ?? [])
        .map(toField)
        .filter((f: BookingFormField | null): f is BookingFormField => f !== null);
    });
  } catch (err) {
    console.error(`[forms] schema read failed for ${formId}:`, err);
    return [];
  }
}
