// Bookable services as the pages need them: a plain, serialisable shape (so it can cross into a
// React island as props) read from Services V2, plus the formatting helpers every surface shares.
// Entity ids are `_id`, never `id` (how-to-code-bookings.md). Services are discovered LIVE, never
// from a seed-time list, so a service the owner adds in the dashboard appears with no code change.
import { services } from "@wix/bookings";
import { BOOKING_APP_ID } from "./site";
import { imgSrc } from "./media";

export type StaffDTO = { id: string; name: string; photo: string };

export type ServiceDTO = {
  id: string;
  slug: string;
  name: string;
  tagLine: string;
  description: string;
  minutes: number;
  /** null = free (NO_FEE). */
  price: { value: string; currency: string } | null;
  /** How the visitor pays: drives the checkout-vs-placeOrder decision and selectedPaymentOption. */
  payment: { online: boolean; inPerson: boolean };
  image: string; // resolved https URL ("" when the service has no image)
  gallery: string[]; // resolved https URLs, the modal gallery
  category: { id: string; name: string; order: number };
  order: number;
  staff: StaffDTO[]; // id = the staff RESOURCE id (what availability + booking filter by)
  formId?: string;
  locationLabel: string;
  /** The booking policy as owner-configured lines, read live (cancellation / rescheduling / custom text). */
  policy: string[];
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

function toDTO(s: any): ServiceDTO {
  const fixed = s.payment?.fixed?.price;
  return {
    id: s._id,
    slug: s.mainSlug?.name ?? s.supportedSlugs?.[0]?.name ?? s._id,
    name: s.name ?? "",
    tagLine: s.tagLine ?? "",
    description: s.description ?? "",
    minutes: s.schedule?.availabilityConstraints?.sessionDurations?.[0] ?? 0,
    price: s.payment?.rateType === "NO_FEE" || !fixed?.value ? null : { value: String(fixed.value), currency: fixed.currency },
    payment: { online: !!s.payment?.options?.online, inPerson: !!s.payment?.options?.inPerson },
    image: imgSrc(s.media?.mainMedia?.image, 960, 720),
    gallery: (s.media?.items ?? []).map((m: any) => imgSrc(m.image, 640, 480)).filter(Boolean).slice(0, 3),
    category: { id: s.category?._id ?? "", name: s.category?.name ?? "", order: s.category?.sortOrder ?? 0 },
    order: s.sortOrder ?? 0,
    staff: (s.staffMemberDetails?.staffMembers ?? s.staffMembers ?? []).map((m: any) => ({ id: m.staffMemberId, name: m.name ?? "", photo: imgSrc(m.mainMedia?.image, 96, 96) })),
    formId: s.form?._id,
    locationLabel: locationLabel(s),
    policy: policyLines(s.bookingPolicy),
  };
}

/** Every visible service, in the dashboard's order: by category, then by the service's own order. */
export async function listServices(): Promise<ServiceDTO[]> {
  const { items } = await services
    .queryServices({ conditionalFields: ["STAFF_MEMBER_DETAILS"] })
    .eq("appId", BOOKING_APP_ID)
    .limit(100)
    .find();
  return items
    .filter((s: any) => !s.hidden)
    .map(toDTO)
    .sort((a, b) => a.category.order - b.category.order || a.order - b.order || a.name.localeCompare(b.name, "en", { numeric: true }));
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
export function formatMoney(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
  } catch {
    return `${n} ${currency}`; // an unknown currency code: show the code
  }
}

/** "Staff Member 1" or "Staff Member 1, Staff Member 2" for a tile. */
export const staffNames = (s: Pick<ServiceDTO, "staff">) => s.staff.map((m) => m.name).filter(Boolean).join(", ");
