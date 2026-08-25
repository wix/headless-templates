// GET /llms-full.txt — the llmstxt.org companion file: the FULL agent-facing
// content map, live-generated. Unlike /llms.txt (which the Wix platform
// shadows with an auto-generated homepage+MCP-tools file on the custom
// domain), this path reaches the app, so it carries what that file can't:
// the session catalog with prices, the About story, and the complete FAQ.
// Everything is queried live (5-min TTL via ssr-cache), so it never goes
// stale the way a manually edited llms.txt would.
import type { APIRoute } from "astro";
import { services } from "@wix/bookings";
import { items } from "@wix/data";
import { auth } from "@wix/essentials";
import { toHtml, htmlToText } from "../utils/cms-html";
import { cached } from "../utils/ssr-cache";

const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;

  // Each section degrades independently — a failed read drops to a link to
  // the live page instead of failing the whole file. cached() keeps serving
  // the last good value while a background refresh retries.
  let sessionLines: string[] = [];
  try {
    const result = await cached("llms:sessions", 5 * 60_000, () =>
      auth
        .elevate(services.queryServices)()
        .eq("appId", BOOKING_APP_ID)
        .limit(100)
        .find(),
    );
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
    console.error("[llms-full] services query failed:", err);
  }

  let aboutText = "";
  try {
    aboutText = await cached("llms:about", 5 * 60_000, async () => {
      const { items: results } = await auth
        .elevate(items.query)("About")
        .limit(1)
        .find();
      return results[0] ? htmlToText(toHtml(results[0].body)) : "";
    });
  } catch (err) {
    console.error("[llms-full] About query failed:", err);
  }

  let faqBlocks: string[] = [];
  try {
    faqBlocks = await cached("llms:faq", 5 * 60_000, async () => {
      const { items: results } = await auth
        .elevate(items.query)("FAQ")
        .ascending("_createdDate")
        .limit(100)
        .find();
      return results
        .map((item) => {
          const q = ((item.question as string) ?? "").trim();
          const a = htmlToText(toHtml(item.answer));
          return q && a ? `### ${q}\n\n${a}` : null;
        })
        .filter(Boolean) as string[];
    });
  } catch (err) {
    console.error("[llms-full] FAQ query failed:", err);
  }

  const body = `# APEX

> Supercar driving experiences on closed circuits. Book a session behind the
> wheel of a specific supercar on a specific circuit at a specific time. All
> sessions are instructor-accompanied and bookable online with hosted checkout.
> Prices in EUR; operating on Irish time (Europe/Dublin).

## Pages

- [Home](${abs("/")}): the marque, the fleet, and current sessions
- [Sessions](${abs("/services")}): the full catalog of bookable driving experiences
- [About](${abs("/about")}): who APEX is and how a session runs
- [FAQ](${abs("/faq")}): experience requirements, deposit and cancellation policy, what happens on the day

## Sessions
${sessionLines.length ? "\n" + sessionLines.join("\n") : "\n- See the [Sessions catalog](" + abs("/services") + ") for current sessions and prices."}

Availability is live on each session page. An on-site assistant ("The
Concierge") can check live availability and guide booking in chat on every
page of the site.
${aboutText ? `\n## About APEX\n\n${aboutText}\n` : ""}${faqBlocks.length ? `\n## FAQ\n\n${faqBlocks.join("\n\n")}\n` : ""}
## AI Agent Access (Model Context Protocol)

This Wix-powered site exposes a live MCP endpoint for agentic access — query
business details, search site content, check availability, and book sessions
on a visitor's behalf. No scraping required, no authentication needed; only
public site information is available. The tool list at [/llms.txt](${abs("/llms.txt")})
documents each MCP tool, or call tools/list on the endpoint directly.

- Site MCP endpoint: ${abs("/_api/mcp")}
- Docs: https://dev.wix.com/docs/develop-websites/articles/get-started/about-the-wix-site-mcp

## Notes

- APEX is a fictional marque; every car, circuit, and pass is an original design.
- Prices are shown in EUR; availability is live and queried per session page or via MCP.
- This file is generated live from the site's Bookings and CMS data.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Same edge-cache policy as the HTML pages — agents get a fast read,
      // content revalidates within the half hour.
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
};
