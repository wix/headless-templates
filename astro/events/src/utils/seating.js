// Reserved seating. A seated event (registration.tickets.stockManagerAppId is the Wix Seating app)
// sells places on the organizer's seating map instead of ticket quantities. Each place belongs to a
// category whose externalId names a ticket definition, so the place decides the ticket and its price.
// @wix/events-registration-core builds the places (getPlaces), the map's stock (getPlanStock), the
// selection and the reservation lines; this file holds what the template adds: the map's colors
// and the place labels.

export const SEATING_APP_ID = '64e6bcf3-b6e2-456a-81f9-b0cfbdd5c2c3';

/** The seating plan's external id for an event: what the reservation summary is read by. */
export function seatingExternalId(eventId) {
  return `wix.events.v1.event:${eventId}`;
}

/**
 * The colors places are drawn in, one per ticket in ticket order. Wix categories have no color, so
 * the site picks them: swap these for the brand's, keeping them distinct and readable on the page.
 */
export const SEAT_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#84CC16'];

const TICKET_EXTERNAL_ID = /^wix\.events\.(?:v1|\*)\.ticket_definition:(.+)$/;

/** Ticket definition id → color. */
export function ticketColors(ticketDefinitions) {
  return Object.fromEntries(ticketDefinitions.map((t, i) => [t._id, SEAT_COLORS[i % SEAT_COLORS.length]]));
}

/** Plan category id → color of the ticket it sells, for SeatingPlanViewer's categoryColors. */
export function categoryColors(plan, colors) {
  const result = {};
  for (const c of plan?.categories ?? []) {
    const ticketId = String(c.externalId ?? '').match(TICKET_EXTERNAL_ID)?.[1];
    if (ticketId && colors[ticketId] && c._id != null) result[c._id] = colors[ticketId];
  }
  return result;
}

/** Places keyed by id: the id the viewer reports on a click (a whole table reports its first seat). */
export function placesById(places) {
  return Object.fromEntries(places.map((p) => [p.id, p]));
}

/** "Table 3 (6 seats)", "Row B · Seat 4", "Standing" (an area). */
export function placeLabel(place) {
  if (place.archetype === 'WHOLE_TABLE') return `${place.elementTitle || 'Table'} (${place.places?.length ?? 0} seats)`;
  if (place.archetype === 'AREA') return place.elementTitle || place.label || 'General admission';
  // "Row 3", "Table 2" for a bare number; a named row ("Balcony") as it is.
  const title = String(place.elementTitle ?? '').trim();
  const where = !title ? '' : /^\d+$/.test(title) ? `${place.elementKind === 'TABLE' ? 'Table' : 'Row'} ${title} · ` : `${title} · `;
  return `${where}Seat ${place.label}`;
}

/** The ids the viewer shows as selected: every seat of a picked table, the place itself otherwise. */
export function selectedPlanIds(selection, places) {
  return [...new Set(selection.map((s) => s.placeId))].flatMap((id) => {
    const place = places[id];
    return place?.archetype === 'WHOLE_TABLE' ? place.places.map((p) => p._id) : [id];
  });
}
