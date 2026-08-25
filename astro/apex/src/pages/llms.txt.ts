// GET /llms.txt — a curated site map for LLMs and agents (llmstxt.org).
// Sessions are queried live from Wix Bookings so names and prices never go
// stale; a failed query degrades to the static sections (same policy as the
// sitemap). NOTE: Wix serves its own auto-generated /llms.txt at the domain
// edge (homepage link + MCP tools only) — whether this richer route shadows
// it there is platform-dependent; it serves in dev and on the app host either
// way, so the MCP section is replicated below to lose nothing if this wins.
import type { APIRoute } from "astro";
import { services } from "@wix/bookings";
import { auth } from "@wix/essentials";

const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;

  let sessionLines: string[] = [];
  try {
    const result = await auth
      .elevate(services.queryServices)()
      .eq("appId", BOOKING_APP_ID)
      .limit(100)
      .find();
    sessionLines = ((result.items ?? []) as any[])
      .filter((s) => !s.hidden)
      .map((s) => {
        const slug = s.mainSlug?.name ?? s.supportedSlugs?.[0]?.name;
        if (!slug) return null;
        const duration = s.schedule?.availabilityConstraints?.sessionDurations?.[0];
        const p = s.payment;
        const price =
          p?.rateType === "FIXED" && p.fixed?.price?.value
            ? new Intl.NumberFormat("en-IE", {
                style: "currency",
                currency: p.fixed.price.currency ?? "EUR",
                maximumFractionDigits: 0,
              }).format(Number(p.fixed.price.value))
            : null;
        const facts = [price, duration && `${duration} min`].filter(Boolean).join(" · ");
        const tagline = (s.tagLine ?? "").trim();
        return `- [${s.name}](${abs(`/services/${slug}`)})${facts ? `: ${facts}` : ""}${tagline ? ` — ${tagline}` : ""}`;
      })
      .filter(Boolean) as string[];
  } catch (err) {
    console.error("[llms.txt] services query failed:", err);
  }

  const body = `# APEX

> Supercar driving experiences on closed circuits. Book a session behind the
> wheel of a specific supercar on a specific circuit at a specific time. All
> sessions are instructor-accompanied and bookable online with hosted checkout.

## Pages

- [Home](${abs("/")}): the marque, the fleet, and current sessions
- [Sessions](${abs("/services")}): the full catalog of bookable driving experiences
- [About](${abs("/about")}): who APEX is and how a session runs
- [FAQ](${abs("/faq")}): experience requirements, deposit and cancellation policy, what happens on the day
- [For agents](${abs("/agents")}): how to point your AI at this site — MCP endpoint, setup, example prompts
- [Full content for agents](${abs("/llms-full.txt")}): this map plus the complete About story and FAQ, live-generated

## Sessions
${sessionLines.length ? "\n" + sessionLines.join("\n") : "\n- See the [Sessions catalog](" + abs("/services") + ") for current sessions and prices."}

## AI Agent Access (Model Context Protocol)

This Wix-powered site exposes a live MCP endpoint for agentic access — query
business details, search site content, check availability, and book sessions
on a visitor's behalf. No scraping required.

- Site MCP endpoint: ${abs("/_api/mcp")}
- Setup guide: ${abs("/agents")}
- Docs: https://dev.wix.com/docs/develop-websites/articles/get-started/about-the-wix-site-mcp

## Notes

- APEX is a fictional marque; every car, circuit, and pass is an original design.
- Prices are shown in EUR; availability is live and queried per session page or via MCP.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
