// Ticket rules come from @wix/events-registration-core: what a guest can pick, prices, the
// preliminary invoice, reservation lines and what reservation errors mean. It takes the @wix/events
// SDK objects as they are. This file only turns its codes and amounts into the copy the pickers show.
import {
  formatMoney,
  getCheckoutTotals,
  getMinimumDonationPrice,
  getPriceRange,
  getTicketSaleState,
  isDonation,
  isFree,
} from '@wix/events-registration-core';

/** The visitor's locale. Prices render in the browser only (tickets load after mount). */
export function locale() {
  return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
}

/** A Wix Money ({ value, currency }) in the visitor's locale: "€45.00". */
export function money(amount) {
  return formatMoney(locale(), amount);
}

/** Ticket definitions to list, in the organizer's order, without the ones hidden until their sale. */
export function visibleTickets(ticketDefinitions, event) {
  return (ticketDefinitions ?? [])
    .filter((t) => !getTicketSaleState(t, event).hidden)
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
}

/** "Free", "€20.00", "€12.00 – €18.00" or "From €5.00" (pay what you want). */
export function priceLabel(ticket) {
  if (isFree(ticket)) return 'Free';
  if (isDonation(ticket)) {
    const min = getMinimumDonationPrice(ticket);
    return Number(min?.value) > 0 ? `From ${money(min)}` : 'Pay what you want';
  }
  const range = getPriceRange(ticket);
  if (!range) return '';
  return range.samePrice ? money(range.min) : `${money(range.min)} – ${money(range.max)}`;
}

/** Why a ticket can't be bought right now, or '' when it's on sale. */
export function saleLabel(ticket, event) {
  const state = getTicketSaleState(ticket, event);
  if (state.soldOut) return 'Sold out';
  if (state.saleEnded) return 'Sale ended';
  if (state.goesOnSale) return 'Not on sale yet';
  return '';
}

/**
 * The summary rows of a preliminary invoice: subtotal, tax, service fee, additional fees and the
 * total. The hosted checkout repeats them from the server's invoice, which is authoritative.
 */
export function totalRows(invoice) {
  const t = getCheckoutTotals(invoice);
  const rows = [];
  if (t.hasSubTotal) rows.push({ label: 'Subtotal', amount: t.subTotal });
  if (t.tax?.amount && Number(t.tax.amount.value) > 0) rows.push({ label: t.tax.name || 'Tax', amount: t.tax.amount });
  if (t.addedFee && Number(t.addedFee.value) > 0) rows.push({ label: 'Service fee', amount: t.addedFee });
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
