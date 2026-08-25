import type { APIRoute } from "astro";
import { submissions } from "@wix/forms";
import { CONTACT_FORM_ID } from "../../lib/constants";
import { json } from "./_json";

/**
 * The body is keyed by each field's Wix Forms `target`, which the form
 * component reads from the form definition — nothing here assumes a field set.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const values = await request.json();
    if (!values || typeof values !== "object" || Object.keys(values).length === 0) {
      return json({ message: "Nothing to submit" }, 400);
    }

    const { status } = await submissions.createSubmission({
      formId: CONTACT_FORM_ID,
      submissions: values,
    });

    if (status !== "PENDING" && status !== "CONFIRMED") {
      return json({ message: "The form could not be submitted" }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return json({ message: "Could not send the message" }, 500);
  }
};
