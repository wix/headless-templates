// Wix Forms submission (visitor token, no elevation). Field violations are
// returned as { fieldErrors: { [errorPath]: errorType } } for the form to map.
import type { APIRoute } from "astro";
import { submissions } from "@wix/forms";
import { FORM_IDS } from "../../lib/forms-config";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const allowed = new Set<string>(Object.values(FORM_IDS));

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (!allowed.has(body?.formId)) return json({ error: "Unknown form" }, 400);
  try {
    const r: any = await submissions.createSubmission({ formId: body.formId, submissions: body.values ?? {} } as any);
    return json({ ok: true, status: r?.status });
  } catch (e: any) {
    const fieldErrors: Record<string, string> = {};
    for (const v of e?.details?.validationError?.fieldViolations ?? [])
      for (const fe of v?.data?.errors ?? []) if (fe.errorPath && !fieldErrors[fe.errorPath]) fieldErrors[fe.errorPath] = fe.errorType;
    console.debug("form submission error", e?.message);
    return json({ error: "submit_failed", fieldErrors }, 422);
  }
};
