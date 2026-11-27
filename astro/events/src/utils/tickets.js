// Ticket rules come from @wix/events-registration-core: what a guest can pick, prices, the
// preliminary invoice, reservation lines and what reservation errors mean. It takes the @wix/events
// SDK objects as they are and returns codes and amounts. This file only turns them into the copy the
// pickers show.
import { formatMoney, getCheckoutTotals, getTicketPriceLabel, getTicketUnavailableReason } from '@wix/events-registration-core';

/** The visitor's locale. Prices render in the browser only (tickets load after mount). */
export function locale() {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
}

/** A Wix Money ({ value, currency }) in the visitor's locale: "€45.00". */
export function money(amount) {
  return formatMoney(locale(), amount);
}

/** "Free", "€20.00", "€12.00 – €18.00" or "From €5.00" (pay what you want). */
export function priceLabel(ticket) {
  const label = getTicketPriceLabel(ticket);
  switch (label?.type) {
    case 'FREE': return 'Free';
    case 'DONATION': return label.minimum ? `From ${money(label.minimum)}` : 'Pay what you want';
    case 'PRICE': return money(label.price);
    case 'PRICE_RANGE': return `${money(label.min)} – ${money(label.max)}`;
    default: return '';
  }
}

const UNAVAILABLE_COPY = {
  REGISTRATION_CLOSED: 'Registration closed',
  SOLD_OUT: 'Sold out',
  SALE_ENDED: 'Sale ended',
  GOES_ON_SALE: 'Not on sale yet',
};

/** Why a ticket can't be bought right now, or '' when it's on sale. */
export function saleLabel(ticket, event) {
  return UNAVAILABLE_COPY[getTicketUnavailableReason(ticket, event)] ?? '';
}

/**
 * The summary rows of a preliminary invoice: subtotal, tax, service fee, additional fees and the
 * total. The hosted checkout repeats them from the server's invoice, which is authoritative.
 */
export function totalRows(invoice) {
  const t = getCheckoutTotals(invoice);
  const rows = [];
  // The totals only carry tax and the service fee when they aren't zero.
  if (t.hasSubTotal) rows.push({ label: 'Subtotal', amount: t.subTotal });
  if (t.tax) rows.push({ label: t.tax.name || 'Tax', amount: t.tax.amount });
  if (t.addedFee) rows.push({ label: 'Service fee', amount: t.addedFee });
  for (const fee of t.additionalFees) rows.push({ label: fee.name, amount: fee.amount });
  rows.push({ label: 'Total', amount: t.buyerTotal, total: true });
  return rows;
}

const ISSUE_COPY = {
  EMPTY_BASKET: 'Choose at least one ticket.',
  ORDER_LIMIT_EXCEEDED: "That's more tickets than one order allows.",
  TICKET_LIMIT_EXCEEDED: "That's more of one ticket than an order allows.",
  PLACE_STOCK_EXCEEDED: 'Some of your seats are no longer available. Pick again.',
  TICKET_NOT_ON_SALE: 'One of your tickets is no longer on sale.',
  PLACE_NOT_ON_SALE: 'One of your seats is no longer on sale.',
  MISSING_PRICING_OPTION: 'Pick a price for each ticket.',
  UNKNOWN_PRICING_OPTION: 'Pick a price for each ticket.',
};

const DONATION_COPY = {
  EMPTY_DONATION: 'Enter your amount.',
  MINIMUM_NOT_REACHED: 'Your amount is below the minimum.',
  ABOVE_MAXIMUM: 'Your amount is too high.',
};

/** Copy for the first issue validate…Selection or get…ReservationLines returned. */
export function issueMessage(issues) {
  const issue = issues?.[0];
  if (!issue) return '';
  if (issue.code === 'INVALID_DONATION') return DONATION_COPY[issue.donationError] ?? 'Check your amount.';
  return ISSUE_COPY[issue.code] ?? 'Check your tickets and try again.';
}

const RESERVATION_COPY = {
  PLACE_RESERVED: 'Some of your seats were just taken. The map is updated, pick again.',
  TICKETS_UNAVAILABLE: 'Those tickets just sold out. Please pick again.',
  TICKET_DEFINITION_HIDDEN: 'One of your tickets is no longer on sale. Please pick again.',
  TICKET_DEFINITION_NOT_FOUND: 'One of your tickets is no longer on sale. Please pick again.',
  UNSUPPORTED_PRICING_OPTION: 'That price is no longer offered. Please pick again.',
};

/** Visitor copy for a failed createTicketReservation, from its code (getReservationErrorCode). */
export function reservationMessage(code, error) {
  if (RESERVATION_COPY[code]) return RESERVATION_COPY[code];
  // No payment method yet: the package reports SOMETHING_WENT_WRONG, the message says why.
  if (/payment method|not configured|premium/i.test(error?.message ?? '')) {
    return "Ticket sales aren't switched on yet. The organizer needs to connect a payment method.";
  }
  return 'Could not reserve tickets. Please try again.';
}
