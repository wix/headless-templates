// Booking-form SCHEMA — read from the service's own Wix Form.
//
// Wix owns this data (labels, required flags, dropdown options), so we read it
// from the Forms API rather than mirroring it anywhere. What we do NOT do is
// `import { forms } from "@wix/forms"`: that package re-exports an 11 MB
// generated module through a namespace import, so nothing tree-shakes and one
// `getForm` call costs ~4.2 MB of server bundle — landing as a single 4,212 KB
// chunk, over the ~4 MB per-file limit the template registry enforces.
// `httpClient.fetchWithAuth` comes from `@wix/essentials`, already in the
// bundle, so this is the same API and the same data for ~0 KB.
//
// Two things the SDK would have done for us, which we do here instead:
//
//  1. The PATH. On www.wixapis.com the service is mounted at
//     `/form-schema-service`, not `/forms` — `/forms/v4/forms/{id}` 404s.
//  2. The SHAPE. `getForm` post-processes the response; raw v4 returns
//     `form.fields` (not `formFields`) with `view`/`validation` sub-objects
//     instead of `inputOptions`/`stringOptions`. `toField` maps that shape.
import { auth, httpClient } from "@wix/essentials";
import { cached } from "./ssr-cache";
import type { BookingFormField } from "../components/BookingForm";

// The Bookings default form is served under the all-zero id — a real id, not a
// missing one, so it is passed through rather than treated as absent.
const FORMS_BASE = "https://www.wixapis.com/form-schema-service/v4/forms";

/**
 * Map one raw v4 field to the island's shape, or null when it isn't a simple
 * value the booking form can submit.
 *
 * Skipped: display-only nodes (headings carry no `target`), hidden fields, and
 * complex fields — a MULTILINE_ADDRESS arrives under `validation.predefined`
 * rather than `validation.string`, and submitting a string for it fails
 * createBooking with "must be object". Bookings enforces only the contact
 * basics, so dropping optional complex fields is safe.
 */
function toField(f: any): BookingFormField | null {
  const target = f?.target;
  const str = f?.validation?.string;
  if (!target || f.hidden || !str) return null;

  const options = (str.enum ?? [])
    .filter((v: unknown) => typeof v === "string" && v)
    .map((v: string) => ({ value: v, label: v }));

  // componentType drives which control the island renders.
  const componentType =
    options.length > 0 ? "DROPDOWN" : str.format === "PHONE" ? "PHONE_INPUT" : "TEXT_INPUT";

  return {
    label: f.view?.label ?? "",
    target, // the key createBooking expects in formSubmission — never rename
    required: f.validation?.required === true,
    componentType,
    // BOOKINGS_* for the contact basics, TEXT_AREA for the multi-line note.
    identifier: f.view?.fieldType ?? "",
    options: options.length > 0 ? options : undefined,
  };
}

/**
 * The booking-form field list for one service, from `service.form._id`.
 * Cached briefly (serve-stale) so a busy service page doesn't re-read the
 * schema on every render. Never throws — a failed read returns [] and the
 * page renders without the form rather than 500ing.
 */
export async function bookingFormFields(formId: string | undefined): Promise<BookingFormField[]> {
  if (!formId) return [];
  try {
    return await cached(`forms:${formId}`, 5 * 60_000, async () => {
      const resp = await auth.elevate(httpClient.fetchWithAuth)(`${FORMS_BASE}/${formId}`);
      if (!resp.ok) throw new Error(`getForm ${formId}: HTTP ${resp.status}`);
      const body: any = await resp.json();
      const fields = body?.form?.fields ?? [];
      return fields
        .map(toField)
        .filter((f: BookingFormField | null): f is BookingFormField => f !== null);
    });
  } catch (err) {
    console.error(`[forms] schema read failed for ${formId}:`, err);
    return [];
  }
}
