// Bookable services as the pages need them: a plain, serialisable shape (so it can cross into a React island as props)
// read from Services V2, plus the formatting helpers every surface shares. Entity ids are `_id`, never `id`
// (how-to-code-bookings.md). Services are discovered LIVE, never from a seed-time list.
import { services } from "@wix/bookings";
import { BOOKING_APP_ID } from "./site";
import { imgSrc } from "./media";

export type StaffDTO = { id: string; name: string };

export type ServiceDTO = {
  /** Level tag from the CMS (ContentItems "levels"), set by the page. */
  level?: string;
  id: string;
  slug: string;
  type: "CLASS" | "COURSE";
  name: string;
  tagLine: string;
  description: string;
  /** null = free (NO_FEE). */
  price: { value: string; currency: string } | null;
  /** How the visitor can pay. `plan` = the service accepts a Pricing Plans membership (service.payment.options.pricingPlan). */
  payment: { online: boolean; inPerson: boolean; plan: boolean; planIds: string[] };
  image: string; // 4:3, 960 wide (modal header, Home tile)
  thumb: string; // 4:3, 480 wide (timetable cards)
  gallery: string[];
  category: { id: string; name: string; order: number };
  order: number;
  capacity: number;
  staff: StaffDTO[]; // may be empty for a course: its staff come from the sessions
  formId?: string;
  locationLabel: string;
  /** Booking policy, read live. */
  policy: {
    maxParticipants: number;
    waitlist: boolean;
    /** Minutes before the first session after which a course can no longer be booked (null = no cut-off). */
    limitLateMinutes: number | null;
    lines: string[];
  };
  /** Courses only: first and last session as UTC ISO strings (Services V2 `schedule`). */
  courseSpan: { start: string; end: string } | null;
  scheduleId: string;
};

function minutesLabel(m: number) {
  if (m % 1440 === 0) return `${m / 1440} ${m === 1440 ? "day" : "days"}`;
  if (m % 60 === 0) return `${m / 60} ${m === 60 ? "hour" : "hours"}`;
  return `${m} min`;
}

function policyLines(p: any): string[] {
  const out: string[] = [];
  if (!p) return out;
  const rule = (label: string, on: boolean, limited: boolean, mins: number) => {
    if (!on) return;
    out.push(limited ? `${label}: up to ${minutesLabel(mins)} before the start.` : `${label}: any time before the start.`);
  };
  rule("Cancellation", !!p.cancellationPolicy?.enabled, !!p.cancellationPolicy?.limitLatestCancellation, p.cancellationPolicy?.latestCancellationInMinutes ?? 0);
  rule("Rescheduling", !!p.reschedulePolicy?.enabled, !!p.reschedulePolicy?.limitLatestReschedule, p.reschedulePolicy?.latestRescheduleInMinutes ?? 0);
  if (p.customPolicyDescription?.enabled && p.customPolicyDescription?.description) out.push(String(p.customPolicyDescription.description));
  return out;
}

function locationLabel(s: any): string {
  const t = s.locations?.[0]?.type;
  if (t === "CUSTOMER") return "At your location";
  if (t === "CUSTOM") return s.locations?.[0]?.custom?.address?.formattedAddress || "At a set location";
  return "At the business";
}

export function toDTO(s: any): ServiceDTO {
  const fixed = s.payment?.fixed?.price;
  const p = s.bookingPolicy;
  return {
    id: s._id,
    slug: s.mainSlug?.name ?? s.supportedSlugs?.[0]?.name ?? s._id,
    type: s.type === "COURSE" ? "COURSE" : "CLASS",
    name: s.name ?? "",
    tagLine: s.tagLine ?? "",
    description: s.description ?? "",
    price: s.payment?.rateType === "NO_FEE" || !fixed?.value ? null : { value: String(fixed.value), currency: fixed.currency },
    payment: { online: !!s.payment?.options?.online, inPerson: !!s.payment?.options?.inPerson, plan: !!s.payment?.options?.pricingPlan, planIds: s.payment?.pricingPlanIds ?? [] },
    image: imgSrc(s.media?.mainMedia?.image, 960, 720),
    thumb: imgSrc(s.media?.mainMedia?.image, 480, 360),
    gallery: (s.media?.items ?? []).map((m: any) => imgSrc(m.image, 640, 480)).filter(Boolean).slice(0, 3),
    category: { id: s.category?._id ?? "", name: s.category?.name ?? "", order: s.category?.sortOrder ?? 0 },
    order: s.sortOrder ?? 0,
    capacity: s.defaultCapacity ?? 0,
    staff: (s.staffMemberDetails?.staffMembers ?? s.staffMembers ?? []).map((m: any) => ({ id: m.staffMemberId, name: m.name ?? "" })),
    formId: s.form?._id,
    locationLabel: locationLabel(s),
    policy: {
      maxParticipants: p?.participantsPolicy?.enabled ? p.participantsPolicy.maxParticipantsPerBooking ?? 1 : 1,
      waitlist: !!p?.waitlistPolicy?.enabled,
      limitLateMinutes: p?.limitLateBookingPolicy?.enabled ? p.limitLateBookingPolicy.latestBookingInMinutes ?? 0 : null,
      lines: policyLines(p),
    },
    courseSpan: s.type === "COURSE" && s.schedule?.firstSessionStart && s.schedule?.lastSessionEnd ? { start: String(s.schedule.firstSessionStart), end: String(s.schedule.lastSessionEnd) } : null,
    scheduleId: s.schedule?._id ?? "",
  };
}

/** Every visible service, in the dashboard's order: classes first, then courses, each by name (Class Name 1..9). */
export async function listServices(): Promise<ServiceDTO[]> {
  const { items } = await services
    .queryServices({ conditionalFields: ["STAFF_MEMBER_DETAILS"] })
    .eq("appId", BOOKING_APP_ID)
    .limit(100)
    .find();
  return items
    .filter((s: any) => !s.hidden)
    .map(toDTO)
    .sort((a, b) => (a.type === b.type ? 0 : a.type === "CLASS" ? -1 : 1) || a.name.localeCompare(b.name, "en", { numeric: true }));
}

/** "30 min", "1 hr", "1 hr 30 min". */
export function formatDuration(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Price from the service's OWN currency (the site's, not an assumed one); "Free" for NO_FEE. */
export function formatPrice(price: ServiceDTO["price"] | { value: string; currency: string } | null): string {
  if (!price) return "Free";
  return formatMoney(Number(price.value), price.currency);
}
// Prices in the currency Wix returns with them (the site currency), formatted with Intl.
export function formatMoney(n: number, currency: string): string {
  if (!currency) return String(n);
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
  } catch (err) { console.error(err);
    return `${n} ${currency}`;
  }
}
