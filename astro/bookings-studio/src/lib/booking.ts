// Browser-side booking calls, VISITOR ONLY (no server endpoint, no elevation, no fallback):
//   re-read the session -> createBooking (eventId + totalParticipants, or the course's scheduleId) -> ONE Cart V2
//   -> calculateCart -> hosted checkout (money due) | placeOrder (free / pay in person).
// What this cannot do as a visitor is surfaced as visible states:
//   · Joining a waitlist, and paying with a plan (needs a signed-in member): design states on the form.
//   · getAnonymousActionToken 403s for a visitor, so a booking's status cannot be read back.
//   · placeOrder fails with SITE_NOT_ACCEPTING_PAYMENTS until the site owner connects payments.
import { bookings } from "@wix/bookings";
import { createCart, calculateCart, placeOrder } from "@wix/auto_sdk_ecom_cart-v-2";
import { redirects } from "@wix/redirects";
import { forms } from "@wix/forms";
import { BOOKING_APP_ID } from "./site";
import { findClassSession, loadCourses, type Session } from "./schedule";
import type { ServiceDTO } from "./services";

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
    for (const need of [...FALLBACK_FIELDS].reverse()) if (!fields.some((f) => f.target === need.target)) fields.unshift(need);
    return fields.length ? fields : FALLBACK_FIELDS;
  } catch (err) { console.error(err);
    return FALLBACK_FIELDS;
  }
}

export type BookingFailure =
  | { code: "gone" } // the session is gone, cancelled, or no longer bookable
  | { code: "spots"; left: number } // fewer spots than the visitor asked for (taken while they typed)
  | { code: "closed" } // a course whose enrollment has closed
  | { code: "policy" } // the booking policy refused (e.g. more participants than allowed per booking)
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

export const paymentOptionOf = (p: ServiceDTO["payment"]) => (p.online && !p.inPerson ? "ONLINE" : !p.online && p.inPerson ? "OFFLINE" : "ONLINE");
/** Decided BEFORE rendering the primary action: money due means hosted checkout. */
export const needsCheckout = (svc: ServiceDTO) => !!svc.price && (svc.payment.online || !svc.payment.inPerson);

// A booking created for an unchanged selection is reused on a retry, so a failed attempt does not leave another CREATED booking behind.
const created = new Map<string, string>();

export async function submit(opts: { service: ServiceDTO; session: Session | null; start?: string; tz: string; participants: number; values: Record<string, string> }): Promise<SubmitResult> {
  const { service: svc, tz, participants, values } = opts;
  const isCourse = svc.type === "COURSE";
  // 1 · A session is a claim, not a reservation: re-read it right before creating the booking.
  let eventId: string | undefined;
  try {
    if (isCourse) {
      const [c] = await loadCourses([svc], tz);
      if (!c || c.closed || c.status === "ended") throw new BookingError({ code: "closed" });
      if (c.left < participants) throw new BookingError({ code: c.left <= 0 ? "gone" : "spots", left: c.left });
    } else {
      const fresh = await findClassSession(svc, opts.start ?? opts.session?.start ?? "", tz);
      if (!fresh || fresh.state === "unavailable") throw new BookingError({ code: "gone" });
      if (fresh.state !== "book" || fresh.left < participants) throw new BookingError({ code: fresh.left > 0 ? "spots" : "gone", left: fresh.left });
      eventId = fresh.eventId;
    }
  } catch (e) {
    if (e instanceof BookingError) throw e; // a failed read is not a conflict: carry on, createBooking validates again
    eventId = opts.session?.eventId;
  }

  // 2 · One booking, with the number of participants. Class: by eventId (Wix derives the time, staff and location from it).
  //     Course: by the course's scheduleId (enrols the participant in every session).
  const key = `${svc.id}|${opts.start ?? ""}|${participants}|${JSON.stringify(values)}`;
  let bookingId = created.get(key);
  if (!bookingId) {
    try {
      const res: any = await bookings.createBooking(
        {
          selectedPaymentOption: paymentOptionOf(svc.payment),
          totalParticipants: participants,
          bookedEntity: isCourse ? { schedule: { scheduleId: svc.scheduleId, serviceId: svc.id, timezone: tz } } : { slot: { serviceId: svc.id, eventId } },
        } as any,
        { formSubmission: values } as any,
      );
      bookingId = res.booking?._id;
      if (!bookingId) throw new Error("no booking id");
    } catch (e: any) {
      if (e instanceof BookingError) throw e;
      const code = errCode(e);
      if (code === "SESSION_CAPACITY_EXCEEDED") throw new BookingError({ code: "spots", left: 0 });
      if (code === "BOOKING_POLICY_VIOLATION") throw new BookingError({ code: isCourse ? "closed" : "policy" });
      throw new BookingError({ code: "other", message: e?.message ?? "createBooking failed" });
    }
    created.set(key, bookingId!);
  }

  // 3 · One Cart V2, one catalog item for the booking (the price is the service price x participants).
  let cartId: string;
  try {
    const cart: any = await createCart({ catalogItems: [{ quantity: 1, catalogReference: { catalogItemId: bookingId, appId: BOOKING_APP_ID } }], cart: { source: { channelType: "WEB" } } } as any);
    if (!cart._id) throw new Error("cart creation failed");
    cartId = cart._id;
  } catch (e: any) {
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
      const { redirectSession }: any = await redirects.createRedirectSession({ ecomCheckout: { checkoutId: cartId }, callbacks: { postFlowUrl: `${window.location.origin}/book/done?from=checkout` } } as any);
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
