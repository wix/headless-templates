/** Domain types the UI renders — decoupled from raw Wix SDK shapes. */

export interface Money {
  amount?: string;
  currency?: string;
  formatted?: string;
}

export interface RentalImage {
  url: string;
  altText?: string;
}

export interface RentalCategory {
  id?: string;
  name?: string;
}

export interface RentalLocation {
  id: string;
  name: string;
  address?: string;
}

/** An inclusive local-date range (YYYY-MM-DD) used for availability filtering. */
export interface DateRange {
  start: string;
  end: string;
}

export interface RentalSummary {
  id: string;
  slug: string;
  name: string;
  tagLine?: string;
  description?: string;
  image?: RentalImage;
  category?: RentalCategory;
  price?: Money;
  durationLabel?: string;
  /** 'HOUR' | 'DAY' — drives the Hourly/Daily badge and rental-type filter. */
  rentalUnit?: 'HOUR' | 'DAY';
  minMinutes?: number;
  maxMinutes?: number;
  priceUnit?: string;
  paymentOnline?: boolean;
  paymentInPerson?: boolean;
  /** Features (Bookings attributes) assigned to this rental's resource. */
  features?: { id: string; name: string }[];
  /** Business locations where this rental's resource(s) are available. */
  locations?: RentalLocation[];
}

export interface DurationRange {
  unit: 'HOUR' | 'DAY';
  minMinutes: number;
  maxMinutes: number;
}

/** A resource type — the rental's *category* (e.g. "Conference Rooms"). Drives the
 *  top-level category filter (a service's `primaryResourceType`). */
export interface ResourceTypeCategory {
  id: string;
  name: string;
}

/** A typed resource attribute definition (Bookings Attributes API). `valueType`
 *  can be BOOLEAN, STRING (with `allowedValues`), or NUMBER (with min/max) — the
 *  Filters panel renders the control that fits the type. */
export interface RentalAttributeDef {
  id: string;
  name: string;
  valueType: 'BOOLEAN' | 'STRING' | 'NUMBER' | string;
  allowedValues?: string[];
  min?: number;
  max?: number;
}

/** Filters passed to the Catalog Search API (server-side rental filtering). */
export interface RentalSearchFilters {
  resourceTypeIds?: string[];
  locationIds?: string[];
  /** One entry per selected attribute value; same attribute = match-any. The
   *  value field is type-specific: `boolValue` (BOOLEAN), `enumValue` (STRING),
   *  or `numberValues` (NUMBER) — matching Catalog Search's Attribute shape. */
  attributes?: {
    attributeId: string;
    enumValue?: string;
    boolValue?: boolean;
    numberValues?: { values: number[] };
  }[];
  localStartDate?: string;
  localEndDate?: string;
  timeZone?: string;
  includeUnavailable?: boolean;
}

export interface RentalDetails extends RentalSummary {
  images: RentalImage[];
  timeZone?: string;
  durationRange?: DurationRange;
  /** 'hour' | 'day' — the unit the price applies to, derived from the duration range. */
  priceUnit?: string;
  /** Minutes before start that free cancellation is allowed (if enabled). */
  freeCancellationMinutes?: number;
  maxParticipants?: number;
  /** The service's primary resource type — passed to booking as ANY_RESOURCE. */
  resourceTypeId?: string;
}

/** A single line of the booking policy, rendered with a matching icon. */
export interface PolicyItem {
  kind: 'cancellation' | 'payment' | 'capacity';
  text: string;
}

/** A single bookable time slot, normalized for the UI + checkout hand-off. */
export interface AvailabilitySlot {
  /** Synthesized key — Wix time slots have no id. */
  key: string;
  serviceId: string;
  localStartDate: string;
  localEndDate: string;
  dayKey: string; // YYYY-MM-DD
  startLabel: string; // e.g. "9:00 AM"
  endLabel: string;
  bookable: boolean;
  location?: { name?: string; address?: string };
  /** The original Wix SlotAvailability entry, passed through to checkout. */
  raw: unknown;
}
