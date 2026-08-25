// One-shot seeder for the `BookingFormFields` CMS collection. Already run
// against this site on 2026-08-25 — kept as the reproduction recipe for a
// fresh site, not as a live route.
//
// The leading `_` keeps Astro's pages router (and therefore the bundler) away
// from this file: it ships in neither the route table nor the server bundle.
// To run it, drop the underscore, `wix dev`, GET
// /api/seed-booking-form-fields, then rename it back. It is idempotent —
// it skips the insert when the collection already holds rows.
//
// It exists because the CLI's site-scoped REST token can write wix-data ITEMS
// but not manage COLLECTIONS (403 on POST /wix-data/v2/collections). Inside
// the app runtime, auth.elevate carries the app identity, which can.
import type { APIRoute } from "astro";
import { collections, items } from "@wix/data";
import { auth } from "@wix/essentials";

const COLLECTION_ID = "BookingFormFields";

// Captured from production on 2026-08-25: all four services resolve to the
// same default Wix Bookings form, so these seed as slug-less defaults.
const ROWS = [
  { sortOrder: 1, label: "First name",       target: "first_name",       required: true,  componentType: "TEXT_INPUT",  identifier: "BOOKINGS_FIRST_NAME", options: "", serviceSlug: "" },
  { sortOrder: 2, label: "Last name",        target: "last_name",        required: true,  componentType: "TEXT_INPUT",  identifier: "BOOKINGS_LAST_NAME",  options: "", serviceSlug: "" },
  { sortOrder: 3, label: "Phone",            target: "phone",            required: false, componentType: "PHONE_INPUT", identifier: "BOOKINGS_PHONE",      options: "", serviceSlug: "" },
  { sortOrder: 4, label: "Email",            target: "email",            required: true,  componentType: "TEXT_INPUT",  identifier: "BOOKINGS_EMAIL",      options: "", serviceSlug: "" },
  { sortOrder: 5, label: "Add your message", target: "add_your_message", required: false, componentType: "TEXT_INPUT",  identifier: "TEXT_AREA",           options: "", serviceSlug: "" },
];

const FIELDS = [
  { key: "sortOrder",     displayName: "Order",            type: "NUMBER"  },
  { key: "label",         displayName: "Label",            type: "TEXT"    },
  { key: "target",        displayName: "Target Key",       type: "TEXT"    },
  { key: "required",      displayName: "Required",         type: "BOOLEAN" },
  { key: "componentType", displayName: "Component Type",   type: "TEXT"    },
  { key: "identifier",    displayName: "Identifier",       type: "TEXT"    },
  { key: "options",       displayName: "Dropdown Options", type: "TEXT"    },
  { key: "serviceSlug",   displayName: "Service Slug",     type: "TEXT"    },
];

export const GET: APIRoute = async () => {
  const log: string[] = [];
  try {
    try {
      await auth.elevate(collections.createDataCollection)({
        _id: COLLECTION_ID,
        displayName: "Booking Form Fields",
        fields: FIELDS as any,
        permissions: { insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ANYONE" } as any,
      } as any);
      log.push("collection created");
    } catch (err: any) {
      log.push(`createDataCollection: ${err?.message ?? err}`);
    }

    const existing = await auth.elevate(items.query)(COLLECTION_ID).limit(100).find();
    log.push(`existing items: ${existing.items.length}`);

    if (existing.items.length === 0) {
      for (const row of ROWS) {
        await auth.elevate(items.insert)(COLLECTION_ID, row as any);
      }
      log.push(`inserted ${ROWS.length} rows`);
    } else {
      log.push("items present — skipped insert");
    }

    const verify = await auth.elevate(items.query)(COLLECTION_ID)
      .ascending("sortOrder")
      .limit(100)
      .find();

    return new Response(
      JSON.stringify({ log, items: verify.items }, null, 2),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ log, error: err?.message ?? String(err), details: err?.details }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
