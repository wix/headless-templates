// Booking-form SCHEMA, read from Wix CMS instead of Wix Forms.
//
// This used to be `forms.getForm(service.form._id)` via `@wix/forms`. That
// import cost 4.2 MB of the backend bundle (the package re-exports a single
// 11 MB generated module through a namespace import, so nothing tree-shakes)
// — on its own more than the whole 4 MB backend budget. The field list is a
// handful of rows that change about never, so it lives in CMS now: same
// shape, ~0 KB, and editable in the CMS grid without a release.
//
// Collection `BookingFormFields`, one row per field:
//   sortOrder      NUMBER   display order
//   label          TEXT     visible label
//   target         TEXT     the key createBooking expects in formSubmission
//   required       BOOLEAN
//   componentType  TEXT     TEXT_INPUT | PHONE_INPUT | DROPDOWN
//   identifier     TEXT     TEXT_AREA renders a textarea; BOOKINGS_* are Wix defaults
//   options        TEXT     JSON array for DROPDOWN: [{"value":"a","label":"A"}]
//   serviceSlug    TEXT     blank = every service; set = overrides that one service
//
// `target` is the contract with `createBooking` — the Bookings default form
// uses snake_case targets (first_name, last_name, email, phone). Changing a
// target in CMS silently breaks the submission, so treat that column as code.
import { items } from "@wix/data";
import { auth } from "@wix/essentials";
import { cached } from "./ssr-cache";
import type { BookingFormField } from "../components/BookingForm";

const COLLECTION_ID = "BookingFormFields";

// Last-resort schema. The Forms SDK could not return an empty form; CMS can
// (misconfigured collection, wiped rows), and a zero-field booking form is an
// unusable page. These are the contact basics createBooking enforces.
const DEFAULT_FIELDS: BookingFormField[] = [
  { label: "First name", target: "first_name", required: true, componentType: "TEXT_INPUT", identifier: "BOOKINGS_FIRST_NAME" },
  { label: "Last name",  target: "last_name",  required: true, componentType: "TEXT_INPUT", identifier: "BOOKINGS_LAST_NAME" },
  { label: "Email",      target: "email",      required: true, componentType: "TEXT_INPUT", identifier: "BOOKINGS_EMAIL" },
];

// Only field types the island can submit as a simple string value — the same
// filter the Forms-backed version applied. A row with an unknown
// componentType is skipped rather than rendered as a broken input.
const RENDERABLE = ["TEXT_INPUT", "PHONE_INPUT", "DROPDOWN"];

function parseOptions(raw: unknown): { value: string; label: string }[] | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed
      .map((o: any) => ({
        value: String(o?.value ?? o?.label ?? ""),
        label: String(o?.label ?? o?.value ?? ""),
      }))
      .filter((o) => o.value);
  } catch {
    return undefined;
  }
}

function toField(item: Record<string, any>): BookingFormField | null {
  const target = ((item.target as string) ?? "").trim();
  const componentType = ((item.componentType as string) ?? "TEXT_INPUT").trim();
  if (!target || !RENDERABLE.includes(componentType)) return null;
  return {
    label: ((item.label as string) ?? "").trim(),
    target,
    required: item.required === true,
    componentType,
    identifier: ((item.identifier as string) ?? "").trim(),
    options: parseOptions(item.options),
  };
}

// One query serves every service — the whole collection is a handful of rows,
// so we read it once (5-min TTL, serve-stale) and partition in memory rather
// than firing a filtered query per service page.
async function allRows(): Promise<Record<string, any>[]> {
  return cached("cms:booking-form-fields", 5 * 60_000, async () => {
    const { items: results } = await auth.elevate(items.query)(COLLECTION_ID)
      .ascending("sortOrder")
      .limit(100)
      .find();
    return results as Record<string, any>[];
  });
}

/**
 * The booking-form field list for one service. Rows carrying this service's
 * slug win outright; otherwise the slug-less default set applies. Never
 * throws — a failed read falls back to DEFAULT_FIELDS so the booking page
 * still works.
 */
export async function bookingFormFields(slug: string): Promise<BookingFormField[]> {
  let rows: Record<string, any>[] = [];
  try {
    rows = await allRows();
  } catch (err) {
    console.error("[cms:BookingFormFields] query failed:", err);
    return DEFAULT_FIELDS;
  }

  const scoped = rows.filter((r) => ((r.serviceSlug as string) ?? "").trim() === slug);
  const source = scoped.length > 0 ? scoped : rows.filter((r) => !((r.serviceSlug as string) ?? "").trim());

  const fields = source.map(toField).filter((f): f is BookingFormField => f !== null);
  if (fields.length === 0) {
    console.warn(`[cms:BookingFormFields] no usable rows for "${slug}" — using defaults`);
    return DEFAULT_FIELDS;
  }
  return fields;
}
