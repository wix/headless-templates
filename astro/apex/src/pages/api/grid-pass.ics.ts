// GET /api/grid-pass.ics — the booked session as a calendar event, straight
// off the grid pass. Times arrive as timezone-less local wall time (the same
// strings the booking flow carries), so the event is written as floating
// local time — it reads 09:00 wherever the driver's calendar lives, exactly
// like the printed pass.
import type { APIRoute } from "astro";
import { absoluteUrl, siteBase } from "../../lib/site";

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// "YYYY-MM-DDTHH:mm:ss" → "YYYYMMDDTHHMMSS" (floating local time).
const icsLocal = (s: string) => s.replace(/[-:]/g, "").slice(0, 15);

const VALID = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const GET: APIRoute = ({ url, site }) => {
  const service = (url.searchParams.get("service") ?? "Driving session").slice(0, 120);
  const start = url.searchParams.get("startDate") ?? "";
  const endParam = url.searchParams.get("endDate") ?? "";
  const instructor = (url.searchParams.get("instructor") ?? "").slice(0, 80);

  if (!VALID.test(start)) {
    return new Response("Missing or invalid startDate", { status: 400 });
  }
  // No end supplied → hold a 60-minute window.
  const end = VALID.test(endParam)
    ? endParam
    : (() => {
        const d = new Date(start);
        d.setMinutes(d.getMinutes() + 60);
        const p = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
      })();

  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const host = siteBase(site, url).host;
  const uid = `apex-${icsLocal(start)}-${service.replace(/[^a-z0-9]/gi, "").slice(0, 24).toLowerCase()}@${host}`;
  const passUrl = absoluteUrl(
    `/booking-confirmation?service=${encodeURIComponent(service)}&startDate=${encodeURIComponent(start)}`,
    site,
    url,
  );
  const description = [
    "Your APEX session. Arrive fifteen minutes early — the briefing walks the line before you take it.",
    instructor ? `Race engineer: ${instructor}` : "",
    `Grid pass: ${passUrl}`,
  ]
    .filter(Boolean)
    .join("\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//APEX//Grid Pass//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsLocal(start)}`,
    `DTEND:${icsLocal(end)}`,
    `SUMMARY:${escapeText(`APEX — ${service}`)}`,
    `DESCRIPTION:${escapeText(description).replace(/\\\\n/g, "\\n")}`,
    "LOCATION:APEX — at the circuit gate",
    `URL:${passUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:APEX session — leave for the circuit",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="apex-grid-pass.ics"',
    },
  });
};
