// POST /api/concierge — the pit-wall radio: a Claude-driven booking concierge.
//
// Hybrid tool surface, chosen for demo latency:
// - `check_availability` is a NATIVE tool run inside this route (the same
//   elevated Bookings queries the calendar island makes) — one fast round
//   trip instead of the multi-minute SearchSiteApiDocs → GenerateVisitorToken
//   → CallWixSiteAPI dance through the MCP connector.
// - Everything else stays on the site's own Wix Site MCP endpoint via the
//   Messages API MCP connector (beta `mcp-client-2025-11-20`) — content
//   search, business details — executed server-side at Anthropic.
// The SDK tool runner drives the loop; this route re-streams simplified SSE
// to the chat island:
//   data: {"type":"text","text":"..."}   incremental reply text
//   data: {"type":"tool","name":"..."}   a tool call started (status line)
//   data: {"type":"error","message":"…"} terminal failure, friendly wording
//   data: {"type":"done"}                turn complete
// Missing ANTHROPIC_API_KEY degrades to a clean "off the air" error event so
// the widget never breaks the site. Set the key with:
//   wix env set --key ANTHROPIC_API_KEY --value <key>   (production)
//   wix env pull                                        (sync .env.local)
import type { APIRoute } from "astro";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { availabilityTimeSlots, eventTimeSlots, services } from "@wix/bookings";
import { auth } from "@wix/essentials";

// Injected at build time by the Vite `define` in astro.config.mjs.
declare const __ANTHROPIC_API_KEY__: string | undefined;

const BOOKING_APP_ID = "13d21c63-b5ec-5912-8397-c3a5ddb27a97";
// Resolved per request from Astro's configured `site` (falling back to the
// request origin) — never hardcode a domain here: the MCP server URL below is
// the site this concierge searches, so a baked-in host would point every
// deployment at someone else's site. Module-scope mutable is safe: every
// consumer runs inside a request that has already called resolveSiteUrl().
let SITE_URL = "";
const MCP_URL = () => `${SITE_URL}/_api/mcp`;

function resolveSiteUrl(site: URL | undefined, request: Request): void {
  SITE_URL = (site?.origin ?? new URL(request.url).origin).replace(/\/$/, "");
}
const TIME_ZONE = "Europe/Dublin";
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 2000;
const MAX_ITERATIONS = 6; // tool-loop cap per turn (cost bound)

type CatalogEntry = {
  id: string;
  name: string;
  slug: string;
  type: "APPOINTMENT" | "CLASS";
  durationMin?: number;
  price: string;
  tagline: string;
};

// Live catalog for the system prompt and slug→service resolution — cached
// briefly so a chatty session doesn't re-query Bookings on every turn
// (serverless module scope, best-effort).
let catalogCache: { entries: CatalogEntry[]; at: number } | null = null;
async function catalog(): Promise<CatalogEntry[]> {
  if (catalogCache && Date.now() - catalogCache.at < 5 * 60_000) {
    return catalogCache.entries;
  }
  let entries: CatalogEntry[] = [];
  try {
    const result = await auth
      .elevate(services.queryServices)()
      .eq("appId", BOOKING_APP_ID)
      .limit(100)
      .find();
    entries = ((result.items ?? []) as any[])
      .filter((s) => !s.hidden)
      .map((s) => {
        const slug = s.mainSlug?.name ?? s.supportedSlugs?.[0]?.name;
        if (!slug || !s._id) return null;
        const p = s.payment;
        return {
          id: s._id,
          name: s.name ?? slug,
          slug,
          type: s.type === "CLASS" ? "CLASS" : "APPOINTMENT",
          durationMin: s.schedule?.availabilityConstraints?.sessionDurations?.[0],
          price:
            p?.rateType === "FIXED" && p.fixed?.price?.value
              ? `${p.fixed.price.currency ?? "EUR"} ${Number(p.fixed.price.value)}`
              : "price on page",
          tagline: (s.tagLine ?? "").trim(),
        } as CatalogEntry;
      })
      .filter(Boolean) as CatalogEntry[];
  } catch (err) {
    console.error("[concierge] catalog query failed:", err);
  }
  catalogCache = { entries, at: Date.now() };
  return entries;
}

function catalogBlock(entries: CatalogEntry[]): string {
  if (!entries.length) {
    return `- The catalog is temporarily unavailable — send visitors to ${SITE_URL}/services for current sessions and prices.`;
  }
  return entries
    .map(
      (e) =>
        `- ${e.name} (slug: ${e.slug}) — ${e.price}, ${e.durationMin ?? "?"} min — ${SITE_URL}/services/${e.slug}${e.tagline ? ` — ${e.tagline}` : ""}`,
    )
    .join("\n");
}

function systemPrompt(entries: CatalogEntry[]): string {
  const now = new Date().toLocaleString("en-IE", {
    timeZone: TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `You are the APEX Concierge — the pit-wall radio operator for APEX (${SITE_URL}), a fictional supercar driving-experience outfit. Visitors radio in from the website; you help them pick a session and get it booked.

The catalog right now:
${catalogBlock(entries)}

Site pages: ${SITE_URL}/services (all sessions), ${SITE_URL}/about (who we are), ${SITE_URL}/faq (requirements, 30% deposit, cancellation policy, what happens on the day).

Tools:
- check_availability — THE way to check live slots. ONE call handles several sessions: pass every relevant slug in service_slugs at once (e.g. all four for "what's free this weekend?"). Never call it once per service. Report the best few concrete options (weekday, date, time). All times are ${TIME_ZONE}.
- The site's MCP tools (SearchInSite, GetBusinessDetails, …) for site content questions the catalog can't answer and business facts. Do NOT use CallWixSiteAPI for availability — check_availability is faster and authoritative.

House rules:
- Radio style: short, confident, warm. One to three sentences per reply, plain prose — no headers, no bullet walls. A little pit-lane flavour is welcome; clarity comes first.
- Ground every claim in the catalog above or a tool result. Never invent sessions, cars, prices, or time slots.
- When you recommend a session, give its markdown link — booking is completed on that page (live calendar, instructor choice, checkout).
- Ask at most one clarifying question, and only when you genuinely can't recommend without it.
- Off-topic requests: steer back to the circuit, politely and briefly.
- APEX is a fictional marque; every car, circuit, and pass is an original design. Don't compare to or claim real-world brands.

Today is ${now} (${TIME_ZONE}).`;
}

// The native availability tool — same elevated queries the calendar island
// makes (APPOINTMENT vs CLASS shapes per AvailabilityCalendar.tsx). Batched:
// several services resolve in ONE tool round trip, queried in parallel — the
// platform kills requests at ~15s, so "what's free this weekend?" must not
// cost one model iteration per service.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function slotsForService(
  service: CatalogEntry,
  from: string,
  to: string,
): Promise<object> {
  try {
    let slots: { start: string }[];
    if (service.type === "CLASS") {
      const result = await auth.elevate(eventTimeSlots.listEventTimeSlots)({
        serviceIds: [service.id],
        fromLocalDate: from,
        toLocalDate: to,
        timeZone: TIME_ZONE,
        includeNonBookable: false,
        cursorPaging: { limit: 100 },
      });
      slots = (result.timeSlots ?? []).map((s: any) => ({ start: s.localStartDate }));
    } else {
      const result = await auth.elevate(availabilityTimeSlots.listAvailabilityTimeSlots)({
        serviceId: service.id,
        fromLocalDate: from,
        toLocalDate: to,
        timeZone: TIME_ZONE,
        bookable: true,
        cursorPaging: { limit: 100 },
      });
      slots = (result.timeSlots ?? []).map((s: any) => ({ start: s.localStartDate }));
    }
    const starts = [...new Set(slots.map((s) => s.start).filter(Boolean))];
    return {
      service: service.name,
      url: `${SITE_URL}/services/${service.slug}`,
      slot_count: starts.length,
      slots: starts.slice(0, 25),
    };
  } catch (err) {
    console.error(`[concierge] availability query failed (${service.slug}):`, err);
    return {
      service: service.name,
      error: `Lookup failed — the live calendar is at ${SITE_URL}/services/${service.slug}.`,
    };
  }
}

async function checkAvailability(input: {
  service_slugs: string[];
  from_date: string;
  to_date?: string;
}): Promise<string> {
  const entries = await catalog();
  const slugs = Array.isArray(input.service_slugs) ? input.service_slugs.slice(0, 8) : [];
  const services = slugs.map((slug) => entries.find((e) => e.slug === slug));
  const unknown = slugs.filter((_, i) => !services[i]);
  if (!slugs.length || unknown.length) {
    return JSON.stringify({
      error: `Unknown or missing service slugs${unknown.length ? ` (${unknown.join(", ")})` : ""}. Valid slugs: ${entries.map((e) => e.slug).join(", ")}`,
    });
  }
  if (!DATE_RE.test(input.from_date) || (input.to_date && !DATE_RE.test(input.to_date))) {
    return JSON.stringify({ error: "Dates must be YYYY-MM-DD." });
  }
  const from = `${input.from_date}T00:00:00`;
  const toDate =
    input.to_date ??
    new Date(new Date(`${input.from_date}T12:00:00`).getTime() + 6 * 86400_000)
      .toISOString()
      .slice(0, 10);
  const to = `${toDate}T23:59:59`;

  const results = await Promise.all(
    (services as CatalogEntry[]).map((s) => slotsForService(s, from, to)),
  );
  return JSON.stringify({
    timezone: TIME_ZONE,
    from: input.from_date,
    to: toDate,
    results,
  });
}

const availabilityTool = betaTool({
  name: "check_availability",
  description:
    "Check live bookable time slots for one or MORE APEX sessions in a single call. Always batch: pass every service slug you need in `service_slugs` at once. Returns local start times in the site timezone.",
  inputSchema: {
    type: "object",
    properties: {
      service_slugs: {
        type: "array",
        items: { type: "string" },
        description: "Service slugs from the catalog — pass all services of interest at once",
      },
      from_date: { type: "string", description: "Start of the window, YYYY-MM-DD (local)" },
      to_date: {
        type: "string",
        description: "End of the window, YYYY-MM-DD (local). Defaults to from_date + 6 days.",
      },
    },
    required: ["service_slugs", "from_date"],
  },
  run: (input: any) => checkAvailability(input),
});

type WireMessage = { role: "user" | "assistant"; content: string };

// Normalize, don't nitpick: real transcripts round-trip through the widget
// (error bubbles filtered out, history sliced), so leading assistant turns or
// over-long assistant replies are expected shapes — repair them. Reject only
// structurally hostile input (wrong types/roles, oversize count).
function validateMessages(body: unknown): WireMessage[] | null {
  const raw = (body as any)?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const clean: WireMessage[] = [];
  for (const m of raw) {
    const role = m?.role;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof m?.content !== "string") return null;
    const content = m.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (content) clean.push({ role, content });
  }
  // The API requires the conversation to start (and sensibly end) on user.
  while (clean.length && clean[0].role === "assistant") clean.shift();
  while (clean.length && clean[clean.length - 1].role === "assistant") clean.pop();
  return clean.length ? clean : null;
}

const sse = (payload: object) => `data: ${JSON.stringify(payload)}\n\n`;

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export const POST: APIRoute = async ({ request, site }) => {
  resolveSiteUrl(site, request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON" }), { status: 400 });
  }
  const messages = validateMessages(body);
  if (!messages) {
    return new Response(JSON.stringify({ error: "invalid messages" }), { status: 400 });
  }

  // Build-time inlined via Vite define (see astro.config.mjs) — the deployed
  // Wix runtime has no user env vars, so runtime lookups are dev-only backup.
  const apiKey =
    (typeof __ANTHROPIC_API_KEY__ !== "undefined" && __ANTHROPIC_API_KEY__) ||
    import.meta.env.ANTHROPIC_API_KEY ||
    (globalThis as any).process?.env?.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful degrade — the widget shows this as a normal radio message.
    return new Response(
      sse({
        type: "error",
        message:
          "The concierge is off the air right now — radio checks are underway. Browse the sessions directly, every page has a live calendar.",
      }) + sse({ type: "done" }),
      { headers: SSE_HEADERS },
    );
  }

  const client = new Anthropic({ apiKey });
  const system = systemPrompt(await catalog());

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (payload: object) => controller.enqueue(encoder.encode(sse(payload)));
      const history: Anthropic.Beta.BetaMessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const runTurn = async () => {
        const runner = client.beta.messages.toolRunner({
          // Opus over Sonnet 5, empirically: on identical prompts Sonnet skipped
          // the MCP site-search and invented an answer ("no instructor names on
          // file"); Opus reached for the tool and got it right. `effort: low`
          // keeps Opus latency in the same band (~10-15s/turn).
          model: "claude-opus-4-8",
          max_tokens: 2048,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          betas: ["mcp-client-2025-11-20"],
          system,
          mcp_servers: [{ type: "url", url: MCP_URL(), name: "apex-site" }],
          tools: [availabilityTool, { type: "mcp_toolset", mcp_server_name: "apex-site" }],
          messages: history,
          stream: true,
          max_iterations: MAX_ITERATIONS,
        });

        for await (const messageStream of runner) {
          for await (const event of messageStream) {
            if (event.type === "content_block_start") {
              const block = (event as any).content_block;
              if (block?.type === "mcp_tool_use" || block?.type === "tool_use") {
                send({ type: "tool", name: block.name ?? "site lookup" });
              }
            } else if (event.type === "content_block_delta") {
              const delta = (event as any).delta;
              if (delta?.type === "text_delta" && delta.text) {
                send({ type: "text", text: delta.text });
              }
            }
          }
          // Server-side MCP loops can pause; resume by pushing the turn back.
          const message = await messageStream.finalMessage();
          if (message.stop_reason === "pause_turn") {
            runner.pushMessages({ role: "assistant", content: message.content });
          }
        }
      };

      try {
        try {
          await runTurn();
        } catch (err: any) {
          // The Anthropic→site MCP link occasionally blips ("Connection error
          // while communicating with MCP server") — one retry rescues it.
          if (err instanceof Anthropic.BadRequestError && /MCP server/i.test(err.message)) {
            console.warn("[concierge] MCP link blip, retrying turn once");
            await runTurn();
          } else {
            throw err;
          }
        }
        send({ type: "done" });
      } catch (err) {
        console.error("[concierge] stream failed:", err);
        send({
          type: "error",
          message:
            "Lost the radio link mid-transmission — give it another go in a moment, or browse the sessions directly.",
        });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
};
