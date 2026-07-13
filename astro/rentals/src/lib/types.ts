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
}

export interface DurationRange {
  unit: 'HOUR' | 'DAY';
  minMinutes: number;
  maxMinutes: number;
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
}

/** A single line of the booking policy, rendered with a matching icon. */
export interface PolicyItem {
  kind: 'cancellation' | 'payment' | 'capacity';
  text: string;
}

/** A single bookable time slot, normalized for the UI + checkout hand-off. */
export interface AvailabilitySlot {
  /** Synthesized React key — Wix time slots have no id. */
  key: string;
  serviceId: string;
  localStartDate: string;
  localEndDate: string;
  dayKey: string; // YYYY-MM-DD
  startLabel: string; // e.g. "9:00 AM"
  endLabel: string;
  bookable: boolean;
  location?: { name?: string; address?: string };
  /** The original Wix SlotAvailability entry, passed to bookingsCheckout. */
  raw: unknown;
}
