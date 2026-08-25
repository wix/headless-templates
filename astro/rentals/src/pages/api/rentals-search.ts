import type { APIRoute } from "astro";
import { searchRentalIds } from "../../utils/rentals-service";
import type { RentalSearchFilters } from "../../utils/types";

/**
 * Live rental filtering via the Catalog Search API. The grid is server-rendered
 * once; on filter change the client POSTs the selected filters here and gets back
 * the matching rental IDs (resource-type category, location, resource attributes,
 * and date-range availability — all resolved server-side by Catalog Search). The
 * client then just shows/hides the existing cards, so nothing is re-rendered.
 */
export const POST: APIRoute = async ({ request }) => {
  let filters: RentalSearchFilters = {};
  try {
    filters = (await request.json()) as RentalSearchFilters;
  } catch {
    filters = {};
  }
  try {
    const ids = await searchRentalIds(filters);
    return new Response(JSON.stringify({ ids }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    console.error("rentals-search failed:", error);
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
