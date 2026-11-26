// Browser-side booking calls, VISITOR ONLY (no server endpoint, no elevation, no fallback):
//   re-check each time → createBooking per appointment → ONE Cart V2 with every bookingId → calculateCart
//   → hosted checkout (money due) | placeOrder (free / pay in person).
// What this cannot do as a visitor is surfaced as visible states:
//   · getAnonymousActionToken 403s for a visitor, so a booking's status cannot be read back: the result below
//     reports only what the visitor's own calls returned.
//   · placeOrder fails with SITE_NOT_ACCEPTING_PAYMENTS until the site owner connects payments.
import { bookings } from "@wix/bookings";
import { createCart, calculateCart, placeOrder } from "@wix/auto_sdk_ecom_cart-v-2";
import { redirects } from "@wix/redirects";
import { forms } from "@wix/forms";
import { BOOKING_APP_ID } from "./site";
import { dayKey } from "./dates";
import { fetchSlots } from "./availability";
import type { Appointment } from "./cart";

export type FormField = { target: string; label: string; type: string; options?: string[]; required: boolean };

/** The contact basics the booking enforces; used whenever the live schema yields nothing usable. */
export const FALLBACK_FIELDS: FormField[] = [
  { target: "first_name", label: "First name", type: "STRING", required: true },
  { target: "last_name", label: "Last name", type: "STRING", required: true },
  { target: "email", label: "Email", type: "EMAIL", required: true },
];
const ENFORCED = new Set(["first_name", "last_name", "email"]);

/** Fields come from the service's @wix/forms form (getFormSummary, flat); simple text-like types only. */
export async function loadFormFields(formId?: string): Promise<FormField[]> {
  try {
    if (!formId) return FALLBACK_FIELDS;
    const { formSummary } = (await forms.getFormSummary(formId)) as any;
    const fields: FormField[] = (formSummary?.fields ?? [])
      .filter((f: any) => !f.deleted && f.type && ["STRING", "EMAIL", "PHONE", "NUMBER", "URL"].includes(f.type))
      .map((f: any) => ({ target: f.target, label: f.label || f.target, type: f.type, options: f.options?.length ? f.options : undefined, required: ENFORCED.has(f.target) }));
    // The booking enforces first_name / last_name / email whatever the schema says.
    for (const need of [...FALLBACK_FIELDS].reverse()) if (!fields.some((f) => f.target === need.target)) fields.unshift(need);
    return fields.length ? fields : FALLBACK_FIELDS;
  } catch (e) {
    console.error("booking form read failed", e);
    return FALLBACK_FIELDS;
  }
}

export type BookingFailure =
  | { code: "slot-gone"; appointmentId: string } // a chosen time was taken, or no longer offered
  | { code: "conflict"; appointmentId?: string } // Cart V2 refused two bookings that overlap for the same staff member
  | { code: "no-payments" } // 428 SITE_NOT_ACCEPTING_PAYMENTS: the site owner has not connected payments
  | { code: "other"; message: string };

export class BookingError extends Error {
  constructor(public failure: BookingFailure) { super(failure.code); }
}

const appErr = (e: any) => e?.details?.applicationError ?? e?.response?.data?.details?.applicationError;
const errCode = (e: any): string | undefined => appErr(e)?.code;

export type SubmitResult =
  | { kind: "placed"; orderId?: string } // placeOrder resolved: an order exists (free / pay in person)
  | { kind: "checkout"; url: string }; // hand off to Wix-hosted checkout (money due); outcome unknown on return

// Bookings created for an unchanged selection are reused on a retry, so a failed attempt does not leave a second
// CREATED booking per appointment. (CREATED holds nothing and is invisible on the calendar; the dashboard lists it.)
const created = new Map<string, string>();
const keyOf = (a: Appointment, values: Record<string, string>) => `${a.id}|${a.startDate}|${a.staff.id}|${JSON.stringify(values)}`;

export async function submitAppointments(appts: Appointment[], values: Record<string, string>): Promise<SubmitResult> {
  // 1 · A slot is a claim, not a reservation. Re-read each appointment's day for its staff member right before
  // creating bookings, so a time that was taken while the visitor typed is caught here, naming the appointment.
  await Promise.all(
    appts.map(async (a) => {
      try {
        const day = dayKey(a.startDate);
        const fresh = await fetchSlots({ serviceId: a.serviceId, fromKey: day, toKey: day, timeZone: a.timeZone, staffId: a.staff.id, retry: false });
        if (!fresh.some((f) => f.localStartDate === a.startDate)) throw new BookingError({ code: "slot-gone", appointmentId: a.id });
      } catch (e) {
        if (e instanceof BookingError) throw e; // an availability read that failed is not a conflict: carry on, createBooking re-validates
      }
    }),
  );

  // 2 · One booking per appointment, always with a CONCRETE staff member (specifying the resource makes
  // createBooking validate availability; "Any staff member" was resolved to a person on the time step).
  // In parallel: they do not depend on each other (a CREATED booking holds nothing), and each createBooking is ~1.5 s.
  const bookingIds: { apptId: string; bookingId: string }[] = await Promise.all(
    appts.map(async (a) => {
      const key = keyOf(a, values);
      let bookingId = created.get(key);
      if (!bookingId) {
        const { online, inPerson } = a.payment;
        const selectedPaymentOption = online && !inPerson ? "ONLINE" : !online && inPerson ? "OFFLINE" : "ONLINE";
        try {
          const res: any = await bookings.createBooking(
            {
              selectedPaymentOption,
              totalParticipants: 1,
              bookedEntity: {
                slot: {
                  serviceId: a.serviceId,
                  scheduleId: a.scheduleId ?? undefined, // the SELECTED SLOT's scheduleId, not the service's
                  startDate: a.startDate,
                  endDate: a.endDate,
                  timezone: a.timeZone,
                  resource: { _id: a.staff.id, name: a.staff.name },
                  location: { locationType: "OWNER_BUSINESS" }, // services say BUSINESS; the booking endpoint says OWNER_BUSINESS
                },
              },
            } as any,
            { formSubmission: values } as any,
          );
          bookingId = res.booking?._id;
          if (!bookingId) throw new Error("no booking id");
        } catch (e: any) {
          throw new BookingError({ code: "slot-gone", appointmentId: a.id });
        }
        created.set(key, bookingId!);
      }
      return { apptId: a.id, bookingId: bookingId! };
    }),
  );

  // 3 · One Cart V2, one catalog item per bookingId. Cart V2 is where Wix refuses overlapping appointments for the
  // same staff member (INSUFFICIENT_INVENTORY on the later booking): the time step prevents it, this is the backstop.
  let cartId: string;
  try {
    const cart: any = await createCart({
      catalogItems: bookingIds.map((b) => ({ quantity: 1, catalogReference: { catalogItemId: b.bookingId, appId: BOOKING_APP_ID } })),
      cart: { source: { channelType: "WEB" } },
    } as any);
    if (!cart._id) throw new Error("cart creation failed");
    cartId = cart._id;
  } catch (e: any) {
    if (errCode(e) === "INSUFFICIENT_INVENTORY") {
      const bad = appErr(e)?.data?.invalidItems?.[0]?.id?.catalogReference?.catalogItemId;
      throw new BookingError({ code: "conflict", appointmentId: bookingIds.find((b) => b.bookingId === bad)?.apptId });
    }
    throw new BookingError({ code: "other", message: e?.message ?? "cart failed" });
  }

  let calc: any;
  try { calc = await calculateCart(cartId); } catch (e: any) { throw new BookingError({ code: "other", message: e?.message ?? "calculate failed" }); }
  const total = Number(calc?.summary?.priceSummary?.total?.amount ?? 0);
  const lines: any[] = calc?.cart?.lineItems ?? [];
  const checkoutRequired = total > 0 || lines.some((l) => l.paymentConfig?.paymentOption && l.paymentConfig.paymentOption !== "FULL_PAYMENT_OFFLINE");

  if (checkoutRequired) {
    // postFlowUrl origin comes from window.location.origin (https): a server-derived http origin 403s.
    try {
      const { redirectSession }: any = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId: cartId },
        callbacks: { postFlowUrl: `${window.location.origin}/book/done?from=checkout` },
      } as any);
      return { kind: "checkout", url: redirectSession.fullUrl };
    } catch (e: any) {
      throw new BookingError({ code: "other", message: e?.message ?? "checkout failed" });
    }
  }
  try {
    const order: any = await placeOrder(cartId);
    return { kind: "placed", orderId: order?.orderId ?? order?.order?._id ?? order?._id };
  } catch (e: any) {
    if (errCode(e) === "SITE_NOT_ACCEPTING_PAYMENTS") throw new BookingError({ code: "no-payments" });
    throw new BookingError({ code: "other", message: e?.message ?? "placeOrder failed" });
  }
}
