import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { pricing } from "@wix/bookings";

/**
 * Rental price preview. Uses the Bookings Pricing API's `previewPrice` — the
 * rentals-correct way to price a duration (per-minute for hourly, per-day for
 * daily) rather than computing it client-side. `previewPrice` needs a sensitive
 * Bookings read scope a visitor doesn't hold, so it runs elevated in this
 * backend route; the frontend calls it via `fetch('/api/preview-price?…')`.
 */
export const GET: APIRoute = async ({ url }) => {
  const serviceId = url.searchParams.get("serviceId");
  const localStartDate = url.searchParams.get("start");
  const localEndDate = url.searchParams.get("end");
  const timeZone = url.searchParams.get("tz") ?? undefined;

  if (!serviceId || !localStartDate || !localEndDate) {
    return json({ error: "serviceId, start and end are required" }, 400);
  }

  try {
    const previewPrice = auth.elevate(pricing.previewPrice);
    const res: any = await previewPrice([
      { serviceId, localStartDate, localEndDate, timeZone, numberOfParticipants: 1 },
    ]);
    const info = res?.priceInfo ?? res;
    return json({
      calculatedPrice: info?.calculatedPrice ?? null,
      currency: info?.currency ?? null,
      deposit: info?.deposit ?? null,
    });
  } catch (error: any) {
    console.error("preview-price failed:", error);
    return json({ error: String(error?.message ?? error) }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
