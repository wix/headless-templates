import { format } from "date-fns";
import { createWixClient } from "./wix-client";
import { DATE_FORMAT, TIME_FORMAT } from "./constants";

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

// Create Wix client
const wixClient = createWixClient();

export async function getServices(): Promise<WixService[]> {
  try {
    const { items } = await wixClient.services.queryServices().find();
    return items;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function getServiceByType(
  type: "free" | "premium"
): Promise<WixService | undefined> {
  try {
    const services = await getServices();

    return type === "free"
      ? services.find((s) => s.payment.rateType === "NO_FEE")
      : services.find((s) => s.payment.rateType === "FIXED");
  } catch (error) {
    console.error(`Error finding ${type} service:`, error);
    throw error;
  }
}

export async function getAvailableSlots(
  date: Date,
  serviceType: "free" | "premium"
): Promise<TimeSlot[]> {
  try {
    const service = await getServiceByType(serviceType);

    if (!service) {
      throw new Error(`No ${serviceType} service found`);
    }

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const availability = await wixClient.availabilityCalendar.queryAvailability(
      {
        filter: {
          serviceId: [service._id],
          startDate: date.toISOString(),
          endDate: tomorrow.toISOString(),
        },
      },
      { timezone: "UTC" }
    );

    return availability.availabilityEntries.map((item) => ({
      time: item.slot?.startDate!,
      display: Intl.DateTimeFormat("en-US", TIME_FORMAT).format(
        new Date(item.slot?.startDate!)
      ),
      available: item.bookable!,
      entity: item,
    }));
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return [];
  }
}

export async function createBooking(
  bookingData: BookingData,
  selectedSlot: TimeSlot,
  selectedDate: Date
): Promise<WixBookingResponse> {
  try {
    const booking = await wixClient.bookings.createBooking({
      bookedEntity: selectedSlot.entity,
      totalParticipants: 1,
      contactDetails: {
        firstName: bookingData.name.split(" ")[0],
        lastName: bookingData.name.split(" ")[1] || "",
        fullAddress: {
          addressLine: bookingData.address,
        },
        email: bookingData.email,
        phone: bookingData.phone,
      },
    });

    // Prepare data for confirmation page
    const confirmationData = {
      ...bookingData,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedSlot.time,
      displayDate: format(selectedDate, DATE_FORMAT),
      displayTime: selectedSlot.display,
    };

    // Save to session storage
    sessionStorage.setItem("bookingData", JSON.stringify(confirmationData));

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
    const redirect: WixRedirectResponse =
      await wixClient.redirects.createRedirectSession({
        bookingsCheckout: {
          slotAvailability: slot,
          timezone: "UTC",
        },
        callbacks: {
          postFlowUrl: returnUrl,
        },
      });

    return redirect.redirectSession?.fullUrl;
  } catch (error) {
    console.error("Error creating redirect session:", error);
    throw error;
  }
}
