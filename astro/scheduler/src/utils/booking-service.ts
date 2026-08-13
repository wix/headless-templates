import { services, availabilityCalendar, bookings } from "@wix/bookings";
import { cartV2 } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { BOOKINGS_APP_ID, TIME_FORMAT } from "./constants";

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  date?: string;
  time?: string;
  displayDate?: string;
  displayTime?: string;
}

export interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  entity: any;
}

interface WixService {
  _id: string;
  name: string;
  [key: string]: any;
}

// Simplified view of a Wix Bookings service, safe to pass from the server to the client
export interface ServiceSummary {
  id: string;
  name: string;
  description: string;
  durationMinutes: number | null;
  price: string | null;
  requiresPayment: boolean;
}

interface WixBookingResponse {
  [key: string]: any;
}

interface WixRedirectResponse {
  redirectSession?: {
    fullUrl?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * The visitor's IANA timezone (e.g. "America/New_York").
 */
export function getVisitorTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function getServices(): Promise<WixService[]> {
  try {
    const { items } = await services.queryServices().find();
    return items as WixService[];
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

/**
 * Map raw Wix service entities to the summary shape rendered by the UI.
 */
export function toServiceSummaries(items: WixService[]): ServiceSummary[] {
  return items.map((service) => {
    const rate = service.payment?.rateType;
    const fixedPrice = service.payment?.fixed?.price;
    const varied = service.payment?.varied;

    let price: string | null = null;
    if (rate === "NO_FEE") {
      price = "Free";
    } else if (fixedPrice?.value != null) {
      price = `${fixedPrice.value} ${fixedPrice.currency ?? ""}`.trim();
    } else if (varied?.defaultPrice?.value != null) {
      price = `From ${varied.defaultPrice.value} ${varied.defaultPrice.currency ?? ""}`.trim();
    }

    const duration =
      service.schedule?.availabilityConstraints?.sessionDurations?.[0] ?? null;

    return {
      id: service._id,
      name: service.name,
      description: service.tagLine ?? service.description ?? "",
      durationMinutes: duration,
      price,
      requiresPayment: rate != null && rate !== "NO_FEE",
    };
  });
}

/**
 * Fetch bookable slots for a service on a given day, in the visitor's timezone.
 * Errors propagate to the caller so the UI can surface an error state.
 */
export async function getAvailableSlots(
  date: Date,
  serviceId: string
): Promise<TimeSlot[]> {
  const timezone = getVisitorTimezone();

  // `date` is midnight in the visitor's local timezone, so start/end of the
  // day are computed with local date parts rather than naive UTC math.
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const availability = await availabilityCalendar.queryAvailability(
    {
      filter: {
        serviceId: [serviceId],
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      },
    },
    { timezone }
  );

  return availability.availabilityEntries.map((item) => ({
    time: item.slot?.startDate!,
    display: Intl.DateTimeFormat("en-US", TIME_FORMAT).format(
      new Date(item.slot?.startDate!)
    ),
    available: item.bookable!,
    entity: item,
  }));
}

export async function createBooking(
  bookingData: BookingData,
  selectedSlot: TimeSlot
): Promise<WixBookingResponse> {
  try {
    const [firstName, ...lastNameParts] = bookingData.name.split(" ");
    const lastName = lastNameParts.join(" ");

    const booking = await bookings.createBooking({
      bookedEntity: selectedSlot.entity,
      totalParticipants: 1,
      contactDetails: {
        firstName,
        lastName,
        fullAddress: {
          addressLine: bookingData.address,
        },
        email: bookingData.email,
        phone: bookingData.phone,
      },
    });

    // Create a cart, calculate it to get the price-verification token, then
    // place the order.
    const createdCart = await cartV2.createCart({
      cart: {
        source: { channelType: "WEB" },
        customerInfo: {
          email: bookingData.email,
        },
        paymentInfo: {
          billingContact: {
            firstName: firstName,
            lastName: lastName,
            phone: bookingData.phone,
          },
        },
      },
      catalogItems: [
        {
          quantity: 1,
          catalogReference: {
            appId: BOOKINGS_APP_ID,
            catalogItemId: booking.booking!._id!,
          },
        },
      ],
    });

    const cartId = createdCart._id!;
    const calculated = await cartV2.calculateCart(cartId);
    await cartV2.placeOrder(cartId, {
      priceVerificationToken:
        calculated.summary?.priceVerificationToken ?? undefined,
    });

    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export async function createRedirectSession(
  slot: any,
  returnUrl: string
): Promise<string | undefined> {
  try {
    const redirect: WixRedirectResponse = await redirects.createRedirectSession(
      {
        bookingsCheckout: {
          slotAvailability: slot,
          timezone: getVisitorTimezone(),
        },
        callbacks: {
          postFlowUrl: returnUrl,
        },
      }
    );

    return redirect.redirectSession?.fullUrl;
  } catch (error) {
    console.error("Error creating redirect session:", error);
    throw error;
  }
}
