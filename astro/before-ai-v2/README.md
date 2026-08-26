# Code Before AI — Wix Events template

A Windows XP desktop that happens to be an events site: old programmers tell
stories about writing code before AI, and you RSVP through an XP-style wizard.

**[Live demo](https://before-ai-v-2-tuvitk-0d06.wix-site-host.com)**

It demonstrates:

- A full desktop metaphor — draggable-feeling windows, a Start menu, a taskbar
  and balloon tips — as **one** React island (`client:load`), server-rendered
  and then hydrated, so the event listing is in the HTML for crawlers
- Listing upcoming events as a plain **visitor-scoped** read
  (`wixEventsV2.queryEvents`) — no client, no API key: the `@wix/astro`
  integration authenticates module-level SDK imports for you
- Two Astro endpoints, `GET /api/events` and `POST /api/rsvp`, whose handler
  bodies are portable Web `Request`/`Response` code
- A **privileged write** behind an endpoint: `auth.elevate(rsvpV2.createRsvp)`,
  which only ever runs server-side

The Wix integration lives entirely in `src/lib/wix-events.ts`; the UI is
`src/components/XpDesktop.tsx`.

## Wix apps required

| App | Used for |
|---|---|
| Wix Events | the RSVP events and the RSVPs themselves |

## Notes

- **Events must be `RSVP`, not `TICKETING`.** `registration.initialType` is
  immutable after create, and this template's write path is `createRsvp`.
- **Event dates must be in the future** or the listing filters them out
  (`status` is queried as `UPCOMING`/`STARTED`).
- A site with no upcoming events renders an empty state. The template never
  substitutes sample events — what you see is what Wix returns.
- Each card's icon comes from a fixed decorative emoji list; Wix Events has no
  per-event icon, and an event's `mainImage` is not rendered by this design.

## Getting started

Use this template with the [Wix CLI for Headless quick start](https://dev.wix.com/docs/go-headless/get-started/quick-starts/wix-managed-headless/quick-start-with-the-wix-cli), then:

```bash
npm install
npm run dev
```

`npm run build` produces the Wix-hosted server bundle.
