import {
  services,
  availabilityTimeSlots,
  attributeDefinition,
  attributeValue,
  bookings,
  extendedBookings,
  resourceTypes,
  catalogSearch,
} from '@wix/bookings';
import { members } from '@wix/members';
import { checkout, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { auth, httpClient } from '@wix/essentials';
import { BOOKINGS_APP_ID, RENTALS_APP_ID } from './constants';
import type {
  AvailabilitySlot,
  DurationRange,
  Money,
  RentalAttributeDef,
  RentalDetails,
  RentalImage,
  RentalLocation,
  RentalSearchFilters,
  RentalSummary,
  ResourceTypeCategory,
} from './types';
import {
  dayKeyOf,
  formatDayLabel,
  formatDurationRange,
  formatMinutes,
  formatTimeLabel,
  resolveWixImage,
} from './format';

/* Wix service objects are large and variadic; we read a defensive subset through
 * an `any` view and validate the real runtime shapes against the live API. In the
 * `@wix/astro` integration the SDK modules are already authenticated per request,
 * so there's no client to create and no tokens to manage. */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AvailabilityResult {
  slots: AvailabilitySlot[];
  timeZone?: string;
}

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
    category: category ? { id: category.id ?? category._id, name: category.name } : undefined,
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
  const res = await runQuery(services.queryServices());
  return res?.items ?? res?.services ?? [];
}

/** Visible rental services. When `RENTALS_APP_ID` is set, only services from that
 *  Bookings app are treated as rentals; otherwise every visible service qualifies. */
async function fetchRentalServices(): Promise<any[]> {
  const items = await fetchAllServices();
  return items.filter(
    (s) => s?.hidden !== true && (!RENTALS_APP_ID || s?.appId === RENTALS_APP_ID),
  );
}

/** Distinct `appId`s across the rental services — used to scope member booking
 *  reads (an `extendedBookings.query` without an `appId` filter returns nothing). */
async function rentalAppIds(): Promise<string[]> {
  const items = await fetchRentalServices();
  const ids = new Set<string>();
  for (const s of items) if (s?.appId) ids.add(s.appId);
  if (RENTALS_APP_ID) ids.add(RENTALS_APP_ID);
  if (ids.size === 0) ids.add(BOOKINGS_APP_ID);
  return [...ids];
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
      runQuery(attributeDefinition.queryAttributeDefinitions()),
      runQuery(attributeValue.queryAttributeValues()),
    ]);
    for (const d of defRes?.items ?? []) {
      const id = d?._id ?? d?.id;
      if (id) defs.set(id, { id, name: d?.name ?? 'Feature' });
    }
    for (const v of valRes?.items ?? []) {
      // Count any attribute assigned to the resource, except ones explicitly
      // turned off. Boolean features carry `boolData: true`; others have no
      // boolData at all — both mean "has it".
      if (!v?.entityId || !v?.attributeDefinitionId || v?.boolData === false) continue;
      const set = byResource.get(v.entityId) ?? new Set<string>();
      set.add(v.attributeDefinitionId);
      byResource.set(v.entityId, set);
    }
  } catch (error) {
    console.error('Error loading feature attributes:', error);
    /* attributes unavailable — features simply won't show */
  }
  return { defs, byResource };
}

/** Per-service location discovery via availability. The Wix Rentals app ties a
 *  rental's business location to its service schedule — surfaced on each
 *  availability slot (`slot.location`) — rather than to a queryable Bookings
 *  resource, so the resource-based path above finds nothing for app-owned
 *  rentals. Query a window per service and collect the distinct locations. */
async function loadLocationsByAvailability(
  serviceIds: string[],
): Promise<Map<string, RentalLocation[]>> {
  const byService = new Map<string, RentalLocation[]>();
  const p = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const from = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T00:00:00`;
  const endD = new Date(now);
  endD.setDate(endD.getDate() + 30);
  const to = `${endD.getFullYear()}-${p(endD.getMonth() + 1)}-${p(endD.getDate())}T00:00:00`;
  await Promise.all(
    serviceIds.map(async (serviceId) => {
      try {
        // Time Slots V2 (one slot/day is enough to read the slot's location).
        const res: any = await availabilityTimeSlots.listAvailabilityTimeSlots({
          serviceId,
          fromLocalDate: from,
          toLocalDate: to,
          timeSlotsPerDay: 1,
        });
        const seen = new Map<string, RentalLocation>();
        for (const ts of res?.timeSlots ?? []) {
          const loc = ts?.location;
          const id = loc?._id ?? loc?.id;
          if (id && !seen.has(id)) {
            seen.set(id, {
              id,
              name: loc.name || loc.formattedAddress || 'Location',
              address: loc.formattedAddress ?? undefined,
            });
          }
        }
        if (seen.size) byService.set(serviceId, [...seen.values()]);
      } catch {
        /* ignore — this service simply has no resolvable location */
      }
    }),
  );
  return byService;
}

/** Map each business-location id to its CITY, from the structured address, so the
 *  frontend labels locations by city rather than the street-level location name.
 *  Uses the auto-authenticated REST client (managed-Astro — no client to build). */
async function loadLocationCities(): Promise<Map<string, string>> {
  const byId = new Map<string, string>();
  try {
    const res = await httpClient.fetchWithAuth(
      'https://www.wixapis.com/locations/v1/locations/query',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: {} }),
      },
    );
    const data: any = await res.json();
    for (const l of data?.locations ?? []) {
      const id = l?._id ?? l?.id;
      const city = l?.address?.city;
      if (id && city) byId.set(id, city);
    }
  } catch {
    /* locations API unavailable — fall back to the slot's own name */
  }
  return byId;
}

/** Resource types = rental *categories* (e.g. "Conference Rooms"). A service's
 *  `primaryResourceType` points at one of these; the top-level filter uses them. */
export async function listResourceTypes(): Promise<ResourceTypeCategory[]> {
  try {
    const res: any = await runQuery(resourceTypes.queryResourceTypes());
    const items = res?.items ?? res?.resourceTypes ?? [];
    return items
      .map((t: any) => ({ id: t?._id ?? t?.id, name: t?.name }))
      .filter((t: ResourceTypeCategory) => t.id && t.name);
  } catch (error) {
    console.error('Error loading resource types:', error);
    return [];
  }
}

async function resourceTypeNameMap(): Promise<Map<string, string>> {
  const m = new Map<string, string>();
  for (const t of await listResourceTypes()) m.set(t.id, t.name);
  return m;
}

/** Visible, typed resource attribute definitions for the Filters panel. Types
 *  beyond BOOLEAN (STRING with `allowedValues`, NUMBER with min/max) are surfaced
 *  so the UI can render the right control instead of assuming a checkbox. */
export async function listAttributeDefinitions(): Promise<RentalAttributeDef[]> {
  try {
    const res: any = await runQuery(attributeDefinition.queryAttributeDefinitions());
    const items = res?.items ?? res?.attributeDefinitions ?? [];
    return items
      .filter((d: any) => d?.visibility !== false)
      .map(
        (d: any): RentalAttributeDef => ({
          id: d?._id ?? d?.id,
          name: d?.name ?? 'Attribute',
          valueType: d?.valueType ?? 'STRING',
          allowedValues: d?.stringConfig?.allowedValues ?? undefined,
          min: d?.numberConfig?.min ?? undefined,
          max: d?.numberConfig?.max ?? undefined,
        }),
      )
      .filter((d: RentalAttributeDef) => d.id);
  } catch (error) {
    console.error('Error loading attribute definitions:', error);
    return [];
  }
}

/** Enrich raw rental services into UI cards: category (resource type), features
 *  (attributes), and locations (city). Shared by the list and search paths. */
async function enrichRentals(items: any[]): Promise<RentalSummary[]> {
  const [{ defs, byResource: featByResource }, rtMap] = await Promise.all([
    loadFeatureData(),
    resourceTypeNameMap(),
  ]);
  const serviceIds = items
    .map((s) => s?._id ?? s?.id)
    .filter((id): id is string => Boolean(id));
  const [availLocsByService, cityById] = await Promise.all([
    loadLocationsByAvailability(serviceIds),
    loadLocationCities(),
  ]);
  return items
    .map((s) => {
      const sid = s?._id ?? s?.id;
      const featIds = new Set<string>();
      for (const rid of resourceIdsOf(s)) {
        for (const did of featByResource.get(rid) ?? []) featIds.add(did);
      }
      const features = [...featIds]
        .map((id) => defs.get(id))
        .filter((f): f is { id: string; name: string } => Boolean(f));
      const byId = new Map<string, RentalLocation>();
      for (const loc of availLocsByService.get(sid) ?? []) {
        const city = cityById.get(loc.id);
        byId.set(loc.id, city ? { ...loc, name: city } : loc);
      }
      const locations = [...byId.values()];
      // Category is the rental's resource type (e.g. "Conference Rooms").
      const rtId: string | undefined = s?.primaryResourceType;
      const rtName = rtId ? rtMap.get(rtId) : undefined;
      const summary = toSummary(s);
      return {
        ...summary,
        category: rtName ? { id: rtId, name: rtName } : summary.category,
        features,
        locations,
      };
    })
    .filter((r) => r.id);
}

/** Search rentals through the Catalog Search API — filter by resource-type
 *  category, business location, resource attributes, and availability, all
 *  server-side in a single call. This is the rentals-correct way to filter a
 *  catalog (vs. querying every service and filtering client-side). */
export async function searchRentals(filters: RentalSearchFilters = {}): Promise<RentalSummary[]> {
  const serviceFilters: any = {};
  if (filters.resourceTypeIds?.length) serviceFilters.resourceTypes = filters.resourceTypeIds;
  if (filters.locationIds?.length) serviceFilters.locationIds = filters.locationIds;
  if (filters.attributes?.length) serviceFilters.attributes = filters.attributes;
  if (filters.localStartDate && filters.localEndDate) {
    serviceFilters.localStartDate = filters.localStartDate;
    serviceFilters.localEndDate = filters.localEndDate;
    if (filters.timeZone) serviceFilters.timeZone = filters.timeZone;
    if (filters.includeUnavailable) serviceFilters.includeUnavailable = true;
  }
  const collected: any[] = [];
  let cursor: string | undefined;
  try {
    do {
      const res: any = await auth.elevate(catalogSearch.queryServicesByFilters)({
        query: {
          filter: RENTALS_APP_ID ? { appId: RENTALS_APP_ID } : {},
          cursorPaging: { limit: 50, ...(cursor ? { cursor } : {}) },
        },
        ...(Object.keys(serviceFilters).length ? { serviceFilters } : {}),
      });
      for (const r of res?.results ?? []) if (r?.service) collected.push(r.service);
      cursor = res?.pagingMetadata?.cursors?.next;
    } while (cursor);
  } catch (error) {
    console.error('Error searching rentals via catalog search:', error);
    // Never blank the list: fall back to the plain service query.
    return enrichRentals(await fetchRentalServices());
  }
  return enrichRentals(collected);
}

export async function listRentals(): Promise<RentalSummary[]> {
  return searchRentals({});
}

/** The business time zone (IANA), read from the default location. Needed to pass
 *  a date-range availability filter to Catalog Search. */
let cachedBusinessTz: string | undefined;
export async function getBusinessTimeZone(): Promise<string | undefined> {
  if (cachedBusinessTz) return cachedBusinessTz;
  try {
    const res = await httpClient.fetchWithAuth(
      'https://www.wixapis.com/locations/v1/locations/query',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: {} }),
      },
    );
    const data: any = await res.json();
    const locs = data?.locations ?? [];
    const def = locs.find((l: any) => l?.default) ?? locs[0];
    cachedBusinessTz = def?.timeZone ?? undefined;
  } catch {
    /* fall back to undefined — availability filter is skipped without a tz */
  }
  return cachedBusinessTz;
}

/** Like `searchRentals` but returns only the matching rental IDs — used by the
 *  live filter endpoint, which re-uses the server-rendered cards and just shows
 *  or hides them by ID (no client-side re-render). Skips the card enrichment. */
export async function searchRentalIds(filters: RentalSearchFilters = {}): Promise<string[]> {
  const serviceFilters: any = {};
  if (filters.resourceTypeIds?.length) serviceFilters.resourceTypes = filters.resourceTypeIds;
  if (filters.locationIds?.length) serviceFilters.locationIds = filters.locationIds;
  if (filters.attributes?.length) serviceFilters.attributes = filters.attributes;
  if (filters.localStartDate && filters.localEndDate) {
    serviceFilters.localStartDate = filters.localStartDate;
    serviceFilters.localEndDate = filters.localEndDate;
    serviceFilters.timeZone = filters.timeZone ?? (await getBusinessTimeZone());
    if (filters.includeUnavailable) serviceFilters.includeUnavailable = true;
  }
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await catalogSearch.queryServicesByFilters({
      query: {
        filter: RENTALS_APP_ID ? { appId: RENTALS_APP_ID } : {},
        cursorPaging: { limit: 50, ...(cursor ? { cursor } : {}) },
      },
      ...(Object.keys(serviceFilters).length ? { serviceFilters } : {}),
    });
    for (const r of res?.results ?? []) {
      const id = r?.service?._id ?? r?.service?.id;
      if (id && r?.available !== false) ids.push(id);
    }
    cursor = res?.pagingMetadata?.cursors?.next;
  } while (cursor);
  return ids;
}

export async function getRentalBySlug(slug: string): Promise<RentalDetails | undefined> {
  const items = await fetchRentalServices();
  const match = items.find((s) => slugOf(s) === slug || s?._id === slug || s?.id === slug);
  if (!match) return undefined;
  const details = toDetails(match);
  details.resourceTypeId = match?.primaryResourceType;
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

// Map a Time Slots V2 `TimeSlot` (localStartDate/localEndDate carry the local
// wall-clock directly, no offset to slice) to the UI's AvailabilitySlot. The raw
// slot is preserved so the booking step can read its `location` for end-options.
function toSlotFromTimeSlot(serviceId: string) {
  return (ts: any, index: number): AvailabilitySlot => {
    const localStartDate = String(ts?.localStartDate ?? '').slice(0, 19);
    const localEndDate = String(ts?.localEndDate ?? '').slice(0, 19);
    const loc = ts?.location;
    return {
      key: `${localStartDate || 'slot'}-${index}`,
      serviceId,
      localStartDate,
      localEndDate,
      dayKey: dayKeyOf(localStartDate),
      startLabel: formatTimeLabel(localStartDate),
      endLabel: formatTimeLabel(localEndDate),
      bookable: ts?.bookable === true,
      location: loc ? { name: loc.name, address: loc.formattedAddress } : undefined,
      raw: ts,
    };
  };
}

export async function getAvailability(
  serviceId: string,
  fromLocalDate: string,
  toLocalDate: string,
  timeZone?: string,
  timeSlotsPerDay?: number,
): Promise<AvailabilityResult> {
  // Rentals availability comes from Time Slots V2 (resource schedules), not the
  // legacy availability calendar. Hourly services list start times across the
  // range; daily services pass `timeSlotsPerDay: 1` to get one slot per day.
  // Visitor-scoped read (READ-CALENDAR) — called from the client islands, so no
  // elevation (auth.elevate is backend-only). @wix/astro authenticates the call.
  const res: any = await availabilityTimeSlots.listAvailabilityTimeSlots({
    serviceId,
    fromLocalDate,
    toLocalDate,
    ...(timeZone ? { timeZone } : {}),
    ...(timeSlotsPerDay ? { timeSlotsPerDay } : {}),
  });
  const slots = (res?.timeSlots ?? []).map(toSlotFromTimeSlot(serviceId));
  return { slots, timeZone: res?.timeZone ?? timeZone };
}

/** Available end times for a selected hourly start (Time Slots V2 end-options).
 *  `location` is the chosen start slot's raw `location` — the API requires it. */
export async function getSlotEndOptions(
  serviceId: string,
  localStartDate: string,
  timeZone: string | undefined,
  location: any,
): Promise<{ localStartDate: string; localEndDate: string; bookable: boolean; label: string }[]> {
  const res: any = await availabilityTimeSlots.listAvailabilityTimeSlotEndOptions(serviceId, {
    localStartDate,
    ...(timeZone ? { timeZone } : {}),
    location: location
      ? {
          _id: location._id ?? location.id,
          name: location.name,
          formattedAddress: location.formattedAddress,
          locationType: location.locationType ?? 'BUSINESS',
        }
      : { locationType: 'BUSINESS' },
  });
  return (res?.endOptions ?? []).map((ts: any) => {
    const localEndDate = String(ts?.localEndDate ?? '').slice(0, 19);
    return { localStartDate, localEndDate, bookable: ts?.bookable === true, label: formatTimeLabel(localEndDate) };
  });
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

interface MemberContact {
  contactId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** The logged-in member's contact identity, or null for anonymous visitors. A
 *  member's bookings are scoped by the contact attached to the booking, so we
 *  stamp `contactDetails` on createBooking — otherwise the booking is tied to a
 *  guest contact and never shows up in the member's account. */
async function currentMemberContact(): Promise<MemberContact | null> {
  try {
    const res: any = await (members as any).getCurrentMember({ fieldsets: ['FULL'] });
    const m = res?.member ?? res;
    if (!m) return null;
    const contact: MemberContact = {
      contactId: m.contactId ?? undefined,
      email: m.loginEmail ?? undefined,
      firstName: m.contact?.firstName ?? undefined,
      lastName: m.contact?.lastName ?? undefined,
    };
    return contact.contactId || contact.email ? contact : null;
  } catch {
    return null; // anonymous visitor
  }
}

/** The selected span to reserve, resolved into a Rentals booking by `reserve`. */
export interface ReserveRequest {
  serviceId: string;
  /** Selected local start, e.g. "2026-08-24T09:00:00". */
  localStartDate: string;
  localEndDate: string;
  timeZone?: string;
  /** The service's resource type (from `primaryResourceType`). */
  resourceTypeId?: string;
  /** The chosen slot's location (from the Time Slots V2 slot) — required to
   *  resolve a concrete resource for the span. */
  location?: any;
}

/** Create a Rentals booking for the selected span, wrap it in an eCom checkout,
 *  and redirect to the Wix-hosted checkout. Uses Time Slots V2 `getAvailabilityTimeSlot`
 *  to resolve a concrete resource + scheduleId for the exact [start, end] span
 *  (this SDK's createBooking needs a specific resource, not ANY_RESOURCE), then
 *  books that slot. Runs client-side so the session cookie is sent. */
// Time Slots V2 reports the location type as BUSINESS/CUSTOM/CUSTOMER, but the
// booking slot's `location.locationType` uses a DIFFERENT enum
// (OWNER_BUSINESS/OWNER_CUSTOM/CUSTOM). Map between them.
function bookingLocationType(t?: string) {
  return t === 'CUSTOM' ? 'OWNER_CUSTOM' : t === 'CUSTOMER' ? 'CUSTOM' : 'OWNER_BUSINESS';
}

/** Resolve the selected span into a bookable slot. Per the Wix Rentals booking
 *  flow, createBooking / rescheduleBooking take a concrete `resource` + `scheduleId`,
 *  so we call Time Slots V2 `getAvailabilityTimeSlot` for the exact [start, end]
 *  and read back the resource, scheduleId, and location. */
async function resolveBookingSlot(req: ReserveRequest): Promise<any> {
  const loc = req.location;
  const locArg: any = loc
    ? {
        _id: loc._id ?? loc.id,
        name: loc.name,
        formattedAddress: loc.formattedAddress,
        locationType: loc.locationType ?? 'BUSINESS',
      }
    : { locationType: 'BUSINESS' };

  const gts: any = await availabilityTimeSlots.getAvailabilityTimeSlot(
    req.serviceId,
    req.localStartDate,
    req.localEndDate,
    req.timeZone ?? '',
    locArg,
    req.resourceTypeId ? { includeResourceTypeIds: [req.resourceTypeId] } : undefined,
  );
  const ts: any = gts?.timeSlot ?? {};
  const resourceId =
    ts?.availableResources?.[0]?.resources?.[0]?._id ?? ts?.availableResources?.[0]?.resources?.[0]?.id;
  const scheduleId = ts?.scheduleId;
  const tsLoc = ts?.location ?? loc;

  return {
    serviceId: req.serviceId,
    ...(scheduleId ? { scheduleId } : {}),
    startDate: req.localStartDate,
    endDate: req.localEndDate,
    ...(req.timeZone ? { timezone: req.timeZone } : {}),
    location: {
      ...(tsLoc?._id ?? tsLoc?.id ? { _id: tsLoc._id ?? tsLoc.id } : {}),
      ...(tsLoc?.name ? { name: tsLoc.name } : {}),
      ...(tsLoc?.formattedAddress ? { formattedAddress: tsLoc.formattedAddress } : {}),
      locationType: bookingLocationType(tsLoc?.locationType),
    },
    ...(resourceId ? { resource: { _id: resourceId } } : {}),
  };
}

export async function reserve(req: ReserveRequest): Promise<void> {
  const contact = await currentMemberContact();
  const slot = await resolveBookingSlot(req);

  const created: any = await bookings.createBooking({
    bookedEntity: { slot },
    totalParticipants: 1,
    ...(contact ? { contactDetails: contact } : {}),
  });
  const bookingId = created?.booking?._id ?? created?.booking?.id;
  if (!bookingId) throw new Error('Could not start checkout — booking was not created.');

  const created2: any = await checkout.createCheckout({
    channelType: checkout.ChannelType.WEB,
    lineItems: [{ quantity: 1, catalogReference: { appId: BOOKINGS_APP_ID, catalogItemId: bookingId } }],
    // Seed the buyer email so the hosted checkout resolves to the member's contact.
    ...(contact?.email ? { checkoutInfo: { buyerInfo: { email: contact.email } } } : {}),
  });
  const checkoutId = created2?._id;
  if (!checkoutId) throw new Error('Could not start checkout — no checkout was created.');

  // Only a *completed* order should land on the confirmation page (thankYouPageUrl).
  // Exiting the checkout — "Continue Browsing" / back to cart — returns to the
  // catalog (postFlowUrl / cartPageUrl), so an abandoned checkout never shows a
  // false "Booking confirmed!".
  const origin = window.location.origin;
  const res: any = await redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: {
      thankYouPageUrl: `${origin}/confirmation`,
      postFlowUrl: origin,
      cartPageUrl: origin,
    },
  });
  const url = res?.redirectSession?.fullUrl;
  if (!url) throw new Error('Could not start checkout — no redirect URL returned.');
  window.location.href = url;
}

/* ------------------------------------------------------------------- Orders */

export interface OrderSummary {
  /** Customer-facing order number (e.g. "10003") — not the internal GUID. */
  number?: string;
  paymentStatus?: string;
  total?: string;
}

/** Resolve a customer-facing order number (+ status/total) from the order GUID
 *  Wix appends to the thank-you URL. Elevated because the confirmation page may
 *  be viewed by an anonymous buyer right after checkout. */
export async function getOrderSummary(orderId: string): Promise<OrderSummary | null> {
  try {
    const getOrder = auth.elevate(orders.getOrder);
    const res: any = await getOrder(orderId);
    const order = res?.order ?? res;
    if (!order) return null;
    return {
      number: order?.number,
      paymentStatus: order?.paymentStatus,
      total: order?.priceSummary?.total?.formattedAmount,
    };
  } catch (error) {
    console.error('Error loading order summary:', error);
    return null;
  }
}

/* ---------------------------------------------------------- Member profile */

export interface MemberProfile {
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
}

/** The currently logged-in member's profile, or null when nobody is signed in.
 *  Safe to call server-side (page frontmatter) — it never throws. */
export async function getCurrentMember(): Promise<MemberProfile | null> {
  try {
    const res: any = await (members as any).getCurrentMember({ fieldsets: ['FULL'] });
    const m = res?.member ?? res;
    if (!m || !(m._id ?? m.id)) return null;
    return {
      id: m._id ?? m.id,
      name: m.profile?.nickname || m.contact?.firstName || m.loginEmail || 'Member',
      email: m.loginEmail,
      photo: m.profile?.photo?.url,
    };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------- Member bookings */

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
 *  actions. The `appId` filter is required — a member read without it defaults to
 *  the Wix Bookings namespace and returns nothing — so we scope it to the app(s)
 *  that own the rental services. */
export async function listMyBookings(): Promise<MyBooking[]> {
  const appIds = await rentalAppIds();
  const res: any = await extendedBookings.query(
    { filter: { appId: { $in: appIds } } },
    { withBookingAllowedActions: true },
  );
  const items: any[] = res?.items ?? res?.extendedBookings ?? [];
  return items
    .map(toMyBooking)
    .filter((b) => b.id)
    .sort((a, b) => (a.startIso < b.startIso ? 1 : -1));
}

export async function cancelMyBooking(bookingId: string, revision: string): Promise<void> {
  await bookings.cancelBooking(bookingId, { revision });
}

export interface RescheduleRequest {
  serviceId: string;
  /** New local start, e.g. "2026-08-24T09:00:00". */
  localStartDate: string;
  /** Original booking length in minutes — preserved across the reschedule. */
  durationMinutes: number;
  timeZone?: string;
  /** The chosen slot's location (from the Time Slots V2 slot). */
  location?: any;
}

/** Reschedule a booking to a new start, keeping its original length. Resolves a
 *  concrete resource + scheduleId for the new span (same slot shape as booking)
 *  so `rescheduleBooking` gets what this SDK version requires. */
export async function rescheduleMyBooking(
  bookingId: string,
  revision: string,
  req: RescheduleRequest,
): Promise<void> {
  const localEndDate = addMinutesLocal(req.localStartDate, req.durationMinutes || 0);
  const slot = await resolveBookingSlot({
    serviceId: req.serviceId,
    localStartDate: req.localStartDate,
    localEndDate,
    timeZone: req.timeZone,
    location: req.location,
  });
  await (bookings as any).rescheduleBooking(bookingId, slot, { revision });
}

// Add minutes to a local wall-clock datetime (no offset), returning YYYY-MM-DDThh:mm:ss.
function addMinutesLocal(local: string, minutes: number): string {
  const d = new Date(`${local}Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
  );
}
