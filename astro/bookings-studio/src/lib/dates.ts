// Wall-clock helpers for the booking UI. Availability returns LOCAL strings ("2026-10-06T10:30:00")
// already in the visitor's selected time zone, so every label is derived from the string's own
// fields, never through Date + the machine's zone: a DST change can't shift a label.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const pad = (n: number) => String(n).padStart(2, "0");

export function parts(local: string) {
  const [d, t = "00:00:00"] = local.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return { y, mo, da, h, mi, dow: new Date(Date.UTC(y, mo - 1, da)).getUTCDay() };
}
export const dayKey = (local: string) => local.slice(0, 10);

/** "10:30 AM" */
export function timeLabel(local: string) {
  const { h, mi } = parts(local);
  return `${h % 12 || 12}:${pad(mi)} ${h < 12 ? "AM" : "PM"}`;
}
/** "Tue" */ export const weekdayShort = (local: string) => WEEKDAYS[parts(local).dow];
/** "Oct 6" */ export const dayShort = (local: string) => { const p = parts(local); return `${MONTHS[p.mo - 1]} ${p.da}`; };
/** "Tuesday, Oct 6" */ export const dayLong = (local: string) => { const p = parts(local); return `${WEEKDAYS_LONG[p.dow]}, ${MONTHS[p.mo - 1]} ${p.da}`; };
/** "Tue, Oct 6 · 10:30 AM" */ export const whenLabel = (local: string) => `${weekdayShort(local)}, ${dayShort(local)} · ${timeLabel(local)}`;

/** Today's calendar date in a given IANA zone, as "YYYY-MM-DD". */
export function todayIn(timeZone: string): string {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return f; // en-CA is YYYY-MM-DD
}
/** Add whole days to a "YYYY-MM-DD" key (pure calendar arithmetic, no zone). */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export const browserZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (err) { console.error(err); return "UTC"; } };

// ── Week strip, month label, time-of-day groups, overlap arithmetic (all wall-clock, zone-free) ──
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "October 2026" for any "YYYY-MM-DD" key. */
export const monthLabel = (key: string) => { const p = parts(key); return `${MONTHS_LONG[p.mo - 1]} ${p.y}`; };
/** "Mon", "Tue" … for a day key. */
export const weekdayOfKey = (key: string) => WEEKDAYS[parts(key).dow];
/** Day-of-month, unpadded, for a day key. */
export const dayNumOfKey = (key: string) => String(parts(key).da).padStart(2, "0");
/** "Monday, Oct 12" for a day key. */
export const dayLongOfKey = (key: string) => dayLong(key);
/** The Monday on or before a day key (weeks run Mon to Sun, as drawn). */
export function weekStart(key: string): string {
  const dow = parts(key).dow; // 0 = Sunday
  return addDays(key, -((dow + 6) % 7));
}
/** The seven day keys of the week starting at a Monday key. */
export const weekDays = (start: string) => Array.from({ length: 7 }, (_, i) => addDays(start, i));
/** First day of a month as a key, from any key in it. */
export const monthStart = (key: string) => `${key.slice(0, 7)}-01`;
/** The first of the month after the one a key is in. */
export const nextMonthStart = (key: string) => { const p = parts(key); return p.mo === 12 ? `${p.y + 1}-01-01` : `${p.y}-${pad(p.mo + 1)}-01`; };

export type DayPart = "Morning" | "Afternoon" | "Evening";
/** Morning before 12:00, Afternoon 12:00 to 16:59, Evening from 17:00. */
export function dayPart(local: string): DayPart {
  const { h } = parts(local);
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

/** Minutes since an arbitrary epoch for a local string; only differences are meaningful (same zone). */
export const minutesOf = (local: string) => { const p = parts(local); return Math.round(Date.UTC(p.y, p.mo - 1, p.da, p.h, p.mi) / 60000); };
/** Do two [start, end) local intervals overlap? Back-to-back (end == start) does not. */
export const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => minutesOf(aStart) < minutesOf(bEnd) && minutesOf(bStart) < minutesOf(aEnd);

/** "(GMT+03:00) Asia/Jerusalem" for an IANA zone. */
export function zoneLabel(timeZone: string): string {
  try {
    const off = new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "longOffset" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    return `(${off === "GMT" ? "GMT+00:00" : off}) ${timeZone}`;
  } catch (err) { console.error(err);
    return timeZone;
  }
}

// ── Zone conversion (schedule build) ────────────────────────────────────────────────────────────
/** A UTC instant as a local "YYYY-MM-DDThh:mm:ss" string in an IANA zone (Intl does the DST work; no Date arithmetic on labels). */
export function localInZone(utcIso: string, timeZone: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return "";
  const f = new Intl.DateTimeFormat("en-CA", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}:${p.second}`;
}
/** "(GMT+03:00)" style label is zoneLabel(); this is the short month-day-year for the week switcher: "Oct 12 – Oct 18, 2026". */
export function weekRangeLabel(start: string): string {
  const end = addDays(start, 6);
  const a = parts(start), b = parts(end);
  const m = (k: number) => MONTHS[k - 1];
  return `${m(a.mo)} ${a.da}${a.y !== b.y ? `, ${a.y}` : ""} – ${m(b.mo)} ${b.da}, ${b.y}`;
}
/** "01 Mon" for the desktop day header. */
export const dayHeading = (key: string) => `${dayNumOfKey(key)} - ${weekdayOfKey(key)}`;
/** Minutes between two local strings of the same zone. */
export const minutesBetween = (a: string, b: string) => minutesOf(b) - minutesOf(a);
/** "6:00 PM – 7:00 PM" */
export const timeRangeLabel = (a: string, b: string) => `${timeLabel(a)} – ${timeLabel(b)}`;
/** The ?tz= override (used to verify other zones); otherwise the browser zone. */
export function displayZone(): string {
  try {
    const q = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("tz");
    if (q) { new Intl.DateTimeFormat("en", { timeZone: q }); return q; }
  } catch (err) { console.error(err); /* an invalid zone name falls through to the browser zone */ }
  return browserZone();
}
