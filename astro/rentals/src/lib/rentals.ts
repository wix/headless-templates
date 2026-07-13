import { wixClient, ensureVisitorSession, isClientConfigured, isLoggedIn } from './wix-client';
import type {
  AvailabilitySlot,
  DurationRange,
  Money,
  RentalDetails,
  RentalImage,
  RentalSummary,
} from './types';
import {
  dayKeyOf,
  formatDayLabel,
  formatDurationRange,
  formatMinutes,
  formatTimeLabel,
  resolveWixImage,
} from './format';

export interface AvailabilityResult {
  slots: AvailabilitySlot[];
  timeZone?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Wix service objects are large/variadic; we read a defensive subset. The
// generated SDK types are minified, so we call through an `any` view of the
// client and validate the real runtime shapes against the live API.
const client = wixClient as any;

// Optionally restrict the catalog to a single Bookings app (by appId) — set
// PUBLIC_WIX_RENTALS_APP_ID to your rentals app to hide yoga/other Bookings
// services on the same site. When unset, all non-hidden services are listed.
const RENTALS_APP_ID = (import.meta.env.PUBLIC_WIX_RENTALS_APP_ID ?? '').trim();

// A media item's `image` may be a `wix:image://` string OR an object { url }.
function mediaUrl(m: any): string | undefined {
  if (!m) return undefined;
  const raw =
    (typeof m.image === 'string' ? m.image : m.image?.url) ??
    m.url ??
    (typeof m === 'string' ? m : undefined);
  return resolveWixImage(raw);
}
function mediaAlt(m: any, fallback?: string): string | undefined {
  return (typeof m?.image === 'object' ? m.image?.altText : undefined) ?? m?.altText ?? fallback;
}

function firstImage(service: any): RentalImage | undefined {
  const m = service?.media?.mainMedia ?? service?.media?.items?.[0];
  const url = mediaUrl(m);
  return url ? { url, altText: mediaAlt(m, service?.name) } : undefined;
}

function allImages(service: any): RentalImage[] {
  const items: any[] = service?.media?.items ?? [];
  const imgs: RentalImage[] = [];
  for (const m of items) {
    const url = mediaUrl(m);
    if (url) imgs.push({ url, altText: mediaAlt(m) });
  }
  const main = firstImage(service);
  if (main && !imgs.some((img) => img.url === main.url)) imgs.unshift(main);
  return imgs;
}

function priceOf(service: any): Money | undefined {
  const p = service?.payment;
  const fixed = p?.fixed?.price;
  if (fixed) {
    return { amount: fixed.value, currency: fixed.currency, formatted: fixed.formattedValue };
  }
  const varied = p?.varied?.defaultPrice;
  if (varied) {
    return { amount: varied.value, currency: varied.currency, formatted: varied.formattedValue };
  }
  if (p?.custom?.description) return { formatted: p.custom.description };
  return undefined;
}

const MINUTES_PER_DAY = 24 * 60;

function durationOf(service: any): string | undefined {
  const range = durationRangeOf(service);
  if (range) return formatDurationRange(range.minMinutes, range.maxMinutes);
  const durations: number[] = service?.schedule?.availabilityConstraints?.sessionDurations ?? [];
  if (durations.length) return formatMinutes(durations[0]);
  return undefined;
}

// Wix duration shapes (verified against the live API):
//   HOUR → durationRange.hourOptions.{minDurationInMinutes, maxDurationInMinutes}
//   DAY  → durationRange.dayOptions.{minDurationInDays,   maxDurationInDays}
function durationRangeOf(service: any): DurationRange | undefined {
  const range = service?.schedule?.availabilityConstraints?.durationRange;
  if (!range) return undefined;
  if (range.unitType === 'HOUR' && range.hourOptions) {
    const min = Number(range.hourOptions.minDurationInMinutes ?? 60);
    return {
      unit: 'HOUR',
      minMinutes: min,
      maxMinutes: Number(range.hourOptions.maxDurationInMinutes ?? min),
    };
  }
  if (range.unitType === 'DAY' && range.dayOptions) {
    const minDays = Number(range.dayOptions.minDurationInDays ?? 1);
    const maxDays = Number(range.dayOptions.maxDurationInDays ?? minDays);
    return {
      unit: 'DAY',
      minMinutes: minDays * MINUTES_PER_DAY,
      maxMinutes: maxDays * MINUTES_PER_DAY,
    };
  }
  return undefined;
}

function slugOf(service: any): string {
  return service?.mainSlug?.name ?? service?.slug ?? service?._id ?? service?.id ?? '';
}

function toSummary(service: any): RentalSummary {
  const category = service?.category;
  const range = durationRangeOf(service);
  const opts = service?.payment?.options;
  return {
    id: service?._id ?? service?.id ?? '',
    slug: slugOf(service),
    name: service?.name ?? 'Untitled rental',
    tagLine: service?.tagLine || undefined,
    description: service?.description || undefined,
    image: firstImage(service),
    category: category
      ? { id: category.id ?? category._id, name: category.name }
      : undefined,
    price: priceOf(service),
    durationLabel: durationOf(service),
    rentalUnit: range?.unit,
    minMinutes: range?.minMinutes,
    maxMinutes: range?.maxMinutes,
    priceUnit: range ? (range.unit === 'HOUR' ? 'hour' : 'day') : undefined,
    paymentOnline: opts?.online === true,
    paymentInPerson: opts?.inPerson === true,
  };
}

function toDetails(service: any): RentalDetails {
  const range = durationRangeOf(service);
  const cancel = service?.bookingPolicy?.cancellationPolicy;
  return {
    ...toSummary(service),
    images: allImages(service),
    timeZone: service?.schedule?.availabilityConstraints?.timeZone ?? undefined,
    durationRange: range,
    priceUnit: range ? (range.unit === 'HOUR' ? 'hour' : 'day') : undefined,
    freeCancellationMinutes: cancel?.enabled
      ? Number(cancel.latestCancellationInMinutes ?? 0)
      : undefined,
    maxParticipants: service?.bookingPolicy?.participantsPolicy?.maxParticipantsPerBooking,
  };
}

/** Run a Wix query whether it returns a builder (`.find()`) or a promise. */
async function runQuery(query: any): Promise<any> {
  if (query && typeof query.find === 'function') return query.find();
  return query;
}

async function fetchAllServices(): Promise<any[]> {
  await ensureVisitorSession();
  const res = await runQuery(client.services.queryServices());
  return res?.items ?? res?.services ?? [];
}

/** Bookable services, optionally scoped to a single Bookings app (see RENTALS_APP_ID). */
async function fetchRentalServices(): Promise<any[]> {
  const items = await fetchAllServices();
  return items.filter(
    (s) => s?.hidden !== true && (!RENTALS_APP_ID || s?.appId === RENTALS_APP_ID),
  );
}

function resourceIdsOf(service: any): string[] {
  const rs: any[] = service?.serviceResources ?? [];
  return rs.flatMap((r) => r?.resourceIds?.values ?? []).filter(Boolean);
}

/** Load the features catalog (attribute definitions) + a resourceId→featureIds map.
 *  Features are Bookings attributes assigned to the resource each service uses. */
async function loadFeatureData(): Promise<{
  defs: Map<string, { id: string; name: string }>;
  byResource: Map<string, Set<string>>;
}> {
  const defs = new Map<string, { id: string; name: string }>();
  const byResource = new Map<string, Set<string>>();
  try {
    const [defRes, valRes] = await Promise.all([
      runQuery(client.attributeDefinition.queryAttributeDefinitions()),
      runQuery(client.attributeValue.queryAttributeValues()),
    ]);
    for (const d of defRes?.items ?? []) {
      const id = d?._id ?? d?.id;
      if (id) defs.set(id, { id, name: d?.name ?? 'Feature' });
    }
    for (const v of valRes?.items ?? []) {
      if (v?.boolData !== true || !v?.entityId || !v?.attributeDefinitionId) continue;
      const set = byResource.get(v.entityId) ?? new Set<string>();
      set.add(v.attributeDefinitionId);
      byResource.set(v.entityId, set);
    }
  } catch {
    /* attributes unavailable — features simply won't show */
  }
  return { defs, byResource };
}

export async function listRentals(): Promise<RentalSummary[]> {
  const items = await fetchRentalServices();
  const { defs, byResource } = await loadFeatureData();
  return items
    .map((s) => {
      const featIds = new Set<string>();
      for (const rid of resourceIdsOf(s)) {
        for (const did of byResource.get(rid) ?? []) featIds.add(did);
      }
      const features = [...featIds]
        .map((id) => defs.get(id))
        .filter((f): f is { id: string; name: string } => Boolean(f));
      return { ...toSummary(s), features };
    })
    .filter((r) => r.id);
}

export async function getRentalBySlug(slug: string): Promise<RentalDetails | undefined> {
  const items = await fetchRentalServices();
  const match = items.find(
    (s) => slugOf(s) === slug || s?._id === slug || s?.id === slug,
  );
  if (!match) return undefined;
  const details = toDetails(match);
  const { defs, byResource } = await loadFeatureData();
  const featIds = new Set<string>();
  for (const rid of resourceIdsOf(match)) {
    for (const did of byResource.get(rid) ?? []) featIds.add(did);
  }
  details.features = [...featIds]
    .map((id) => defs.get(id))
    .filter((f): f is { id: string; name: string } => Boolean(f));
  return details;
}

function toSlotFromEntry(serviceId: string) {
  return (entry: any, index: number): AvailabilitySlot => {
    const slot = entry?.slot ?? {};
    const startIso: string = slot.startDate ?? '';
    const endIso: string = slot.endDate ?? '';
    // slot.startDate is ISO with offset (e.g. 2026-07-04T21:30:00.000+01:00);
    // the first 19 chars are the local wall-clock we display and key on.
    const localStartDate = startIso.slice(0, 19);
    const localEndDate = endIso.slice(0, 19);
    const loc = slot.location;
    return {
      key: `${startIso || 'slot'}-${index}`,
      serviceId,
      localStartDate,
      localEndDate,
      dayKey: dayKeyOf(localStartDate),
      startLabel: formatTimeLabel(localStartDate),
      endLabel: formatTimeLabel(localEndDate),
      bookable: entry?.bookable === true,
      location: loc ? { name: loc.name, address: loc.formattedAddress } : undefined,
      raw: entry,
    };
  };
}

// The business timezone (e.g. Europe/Dublin). queryAvailability returns UTC unless
// given a timezone, so we resolve it once (via time-slots) and reuse it — this keeps
// displayed slot times in the business's local time.
let cachedTimeZone: string | undefined;
async function siteTimeZone(serviceId: string): Promise<string | undefined> {
  if (cachedTimeZone) return cachedTimeZone;
  try {
    const now = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const from = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T00:00:00`;
    const later = new Date(now);
    later.setDate(later.getDate() + 1);
    const to = `${later.getFullYear()}-${p(later.getMonth() + 1)}-${p(later.getDate())}T00:00:00`;
    const res: any = await client.availabilityTimeSlots.listAvailabilityTimeSlots({
      serviceId,
      fromLocalDate: from,
      toLocalDate: to,
      bookable: true,
    });
    cachedTimeZone = res?.timeZone;
  } catch {
    /* fall back to UTC */
  }
  return cachedTimeZone;
}

export async function getAvailability(
  serviceId: string,
  fromLocalDate: string,
  toLocalDate: string,
  timeZone?: string,
): Promise<AvailabilityResult> {
  await ensureVisitorSession();
  const tz = timeZone ?? (await siteTimeZone(serviceId));
  // Use queryAvailability: it returns the SlotAvailability shape that bookingsCheckout
  // needs (a flat V2 time slot leaves the hosted booking form's serviceId empty). It
  // filters by a UTC range, so widen a day on each side and filter back to local days.
  const startUtc = new Date(`${fromLocalDate.slice(0, 10)}T00:00:00Z`);
  startUtc.setUTCDate(startUtc.getUTCDate() - 1);
  const endUtc = new Date(`${toLocalDate.slice(0, 10)}T23:59:59Z`);
  endUtc.setUTCDate(endUtc.getUTCDate() + 1);
  const res: any = await client.availabilityCalendar.queryAvailability(
    {
      filter: {
        serviceId: [serviceId],
        startDate: startUtc.toISOString(),
        endDate: endUtc.toISOString(),
      },
    },
    tz ? { timezone: tz } : undefined,
  );
  const entries: any[] = res?.availabilityEntries ?? [];
  const fromDay = fromLocalDate.slice(0, 10);
  const toDay = toLocalDate.slice(0, 10);
  const slots = entries
    .map(toSlotFromEntry(serviceId))
    .filter((s) => s.localStartDate && s.dayKey >= fromDay && s.dayKey <= toDay);
  return {
    slots,
    timeZone: tz ?? entries[0]?.slot?.timezone,
  };
}

/** True if the service has at least one bookable slot in the given local range. */
export async function hasAvailabilityInRange(
  serviceId: string,
  fromLocalDate: string,
  toLocalDate: string,
): Promise<boolean> {
  const res = await getAvailability(serviceId, fromLocalDate, toLocalDate);
  return res.slots.some((s) => s.bookable);
}

// Wix Bookings' eCommerce catalog app id — used as the `catalogReference.appId`
// for a booking line item in the eCom checkout. The rental services belong to a
// custom Bookings app, and the legacy `bookingsCheckout` redirect lands on the
// standard `/__bookings/booking-form`, which rejects them ("service not valid").
// Routing through the eCom checkout (createBooking → createCheckout → redirect)
// works regardless of which app owns the service.
const BOOKINGS_APP_DEF_ID = '13d21c63-b5ec-5912-8397-c3a5ddb27a97';

interface MemberContact {
  contactId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** The logged-in member's contact identity, or null for anonymous visitors.
 *  A member's bookings are scoped by the contact attached to the booking, so we
 *  must stamp `contactDetails` (esp. `contactId`) on createBooking — otherwise
 *  the booking is tied to an anonymous/guest contact and never shows up in the
 *  member's account. */
async function currentMemberContact(): Promise<MemberContact | null> {
  if (!isLoggedIn()) return null;
  try {
    // FULL fieldset so we get loginEmail + contact name; contactId is present at
    // any fieldset but the email/name only come back with FULL.
    const res: any = await client.members.getCurrentMember({ fieldsets: ['FULL'] });
    const m = res?.member ?? res;
    if (!m) return null;
    const contact: MemberContact = {
      contactId: m.contactId ?? undefined,
      email: m.loginEmail ?? undefined,
      firstName: m.contact?.firstName ?? undefined,
      lastName: m.contact?.lastName ?? undefined,
    };
    // Nothing to link on if we couldn't resolve either identifier.
    return contact.contactId || contact.email ? contact : null;
  } catch {
    return null;
  }
}

/** Create a booking for the chosen SlotAvailability entry, wrap it in an eCom
 *  checkout, then redirect the browser to the Wix-hosted checkout page. `entry`
 *  is the queryAvailability entry (its `.slot.endDate` may already be extended
 *  for multi-hour rentals). For a logged-in member we attach their contact so
 *  the booking shows in their account; anonymous visitors supply contact details
 *  on the hosted checkout page instead. */
async function checkoutSlotEntry(entry: any): Promise<void> {
  await ensureVisitorSession();
  const slot = entry?.slot;
  if (!slot) throw new Error('Could not start checkout — missing slot data.');

  const contact = await currentMemberContact();

  const created: any = await client.bookings.createBooking({
    bookedEntity: { slot },
    totalParticipants: 1,
    ...(contact ? { contactDetails: contact } : {}),
  });
  const bookingId = created?.booking?._id;
  if (!bookingId) throw new Error('Could not start checkout — booking was not created.');

  const checkout: any = await client.checkout.createCheckout({
    channelType: 'WEB',
    lineItems: [
      { quantity: 1, catalogReference: { appId: BOOKINGS_APP_DEF_ID, catalogItemId: bookingId } },
    ],
    // Seed the buyer email so the hosted checkout resolves to the member's
    // contact (memberId/contactId on buyerInfo are read-only, derived from the
    // member session that created the checkout).
    ...(contact?.email ? { checkoutInfo: { buyerInfo: { email: contact.email } } } : {}),
  });
  const checkoutId = checkout?._id;
  if (!checkoutId) throw new Error('Could not start checkout — no checkout was created.');

  const res: any = await client.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl: `${window.location.origin}/confirmation` },
  });
  const url = res?.redirectSession?.fullUrl;
  if (!url) throw new Error('Could not start checkout — no redirect URL returned.');
  window.location.href = url;
}

/** Reserve a raw Wix SlotAvailability entry (optionally with an extended end for
 *  multi-hour rentals) by creating a booking + eCom checkout and redirecting the
 *  browser. */
export async function reserve(rawSlot: unknown): Promise<void> {
  await checkoutSlotEntry(rawSlot);
}

/* ---------------------------------------------------------- Member bookings
   Requires a logged-in member session (see wix-client login helpers). */

export interface MyBooking {
  id: string;
  revision: string;
  serviceId: string;
  title: string;
  /** Human-friendly date/time of the booking. */
  when: string;
  startIso: string;
  status: string; // CONFIRMED | PENDING | CANCELED | DECLINED | ...
  unit: 'HOUR' | 'DAY';
  durationMinutes: number;
  /** Governed by the booking policy (server-computed allowedActions). */
  canCancel: boolean;
  canReschedule: boolean;
}

function toMyBooking(entry: any): MyBooking {
  const b = entry?.booking ?? {};
  const slot = b?.bookedEntity?.slot ?? {};
  const startIso: string = slot.startDate ?? '';
  const endIso: string = slot.endDate ?? '';
  const startLocal = startIso.slice(0, 19);
  const endLocal = endIso.slice(0, 19);
  const durationMinutes =
    startLocal && endLocal
      ? Math.max(
          0,
          Math.round((new Date(endLocal).getTime() - new Date(startLocal).getTime()) / 60000),
        )
      : 0;
  const unit: 'HOUR' | 'DAY' = slot?.durationUnitType === 'DAY' ? 'DAY' : 'HOUR';
  const startDay = dayKeyOf(startLocal);
  const days = Math.max(1, Math.round(durationMinutes / (24 * 60)));
  const when =
    unit === 'DAY'
      ? `${formatDayLabel(startDay)} · ${days} day${days > 1 ? 's' : ''}`
      : `${formatDayLabel(startDay)} · ${formatTimeLabel(startLocal)} – ${formatTimeLabel(endLocal)}`;
  return {
    id: b?._id ?? b?.id ?? '',
    revision: String(b?.revision ?? ''),
    serviceId: slot?.serviceId ?? b?.bookedEntity?.slot?.serviceId ?? '',
    title: b?.bookedEntity?.title ?? 'Booking',
    when,
    startIso,
    status: b?.status ?? 'CONFIRMED',
    unit,
    durationMinutes,
    canCancel: entry?.allowedActions?.cancel === true,
    canReschedule: entry?.allowedActions?.reschedule === true,
  };
}

/** The logged-in member's bookings, newest first, with policy-driven allowed
 *  actions. `withBookingAllowedActions` makes Wix compute cancel/reschedule
 *  eligibility from the booking policy. (We deliberately skip
 *  `withBookingPolicySettings`, which needs the extra
 *  `BOOKINGS.BOOKING_POLICY_SNAPSHOT_READ` scope and isn't used here.) */
export async function listMyBookings(): Promise<MyBooking[]> {
  await ensureVisitorSession();
  const res: any = await runQuery(
    client.extendedBookings.queryExtendedBookings({
      withBookingAllowedActions: true,
    }),
  );
  const items: any[] = res?.items ?? res?.extendedBookings ?? [];
  return items
    .map(toMyBooking)
    .filter((b) => b.id)
    .sort((a, b) => (a.startIso < b.startIso ? 1 : -1));
}

export async function cancelMyBooking(bookingId: string, revision: string): Promise<void> {
  await ensureVisitorSession();
  await client.bookings.cancelBooking(bookingId, { revision });
}

/** Reschedule to a new slot. `newSlot` is a V2Slot (see buildRescheduledSlot). */
export async function rescheduleMyBooking(
  bookingId: string,
  revision: string,
  newSlot: unknown,
): Promise<void> {
  await ensureVisitorSession();
  await client.bookings.rescheduleBooking(bookingId, newSlot, { revision });
}

// Add `minutes` to an ISO datetime with offset (e.g. 2026-07-15T09:00:00.000+01:00),
// keeping the original UTC offset — used to preserve a booking's duration when the
// start moves.
function addMinutesToIso(iso: string, minutes: number): string {
  const m = iso.match(/([+-]\d{2}:\d{2}|Z)$/);
  const offset = m ? m[0] : 'Z';
  const local = iso.slice(0, 19); // YYYY-MM-DDTHH:mm:ss
  const d = new Date(`${local}Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  const p = (n: number) => String(n).padStart(2, '0');
  const wall =
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
  return `${wall}.000${offset}`;
}

/** Build the new slot for a reschedule: clone a fresh availability entry's slot
 *  and stretch its end so the booking keeps its original length. `availEntry` is
 *  the raw queryAvailability entry for the chosen new start. */
export function buildRescheduledSlot(availEntry: any, durationMinutes: number): unknown {
  const slot = JSON.parse(JSON.stringify(availEntry?.slot ?? {}));
  if (slot.startDate && durationMinutes > 0) {
    slot.endDate = addMinutesToIso(slot.startDate, durationMinutes);
  }
  return slot;
}

export { isClientConfigured };
