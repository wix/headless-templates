// Reserved seating. A seated event (isSeatedEvent) sells places on the organizer's seating map instead
// of ticket quantities. Each place belongs to a category that sells one ticket definition, so the
// place decides the ticket and its price. @wix/events-registration-core builds the places, the map's
// stock and selected places, the selection, the label parts and the reservation lines; this file
// holds what the template adds: the map's colors and the label copy.
import { getPlaceLabel, getTicketDefinitionIdsByCategory } from '@wix/events-registration-core';

/**
 * The colors places are drawn in, one per ticket in ticket order. Wix categories have no color, so
 * the site picks them: swap these for the brand's, keeping them distinct and readable on the page.
 */
export const SEAT_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#84CC16'];

/** Ticket definition id → color. */
export function ticketColors(ticketDefinitions) {
  return Object.fromEntries(ticketDefinitions.map((t, i) => [t._id, SEAT_COLORS[i % SEAT_COLORS.length]]));
}

/** Plan category id → color of the ticket it sells, for SeatingPlanViewer's categoryColors. */
export function categoryColors(plan, colors) {
  return Object.fromEntries(
    Object.entries(getTicketDefinitionIdsByCategory(plan))
      .filter(([, ticketId]) => colors[ticketId])
      .map(([categoryId, ticketId]) => [categoryId, colors[ticketId]]),
  );
}

/** Places keyed by id: the id the viewer reports on a click (a whole table reports its first seat). */
export function placesById(places) {
  return Object.fromEntries(places.map((p) => [p.id, p]));
}

/** "Row 3" or "Table 2" for a bare number; a named row or table ("Balcony") as it is. */
const numbered = (word, title) => (/^\d+$/.test(title) ? `${word} ${title}` : title);

/** "Table 3 (6 seats)", "Row B · Seat 4", "Standing" (an area). The section shows beside it. */
export function placeLabel(place) {
  const { area, table, row, seat } = getPlaceLabel(place);
  if (place.archetype === 'WHOLE_TABLE') return `${table ? numbered('Table', table) : 'Table'} (${place.places?.length ?? 0} seats)`;
  if (place.archetype === 'AREA') return area || 'General admission';
  return [row && numbered('Row', row), table && numbered('Table', table), seat && `Seat ${seat}`].filter(Boolean).join(' · ');
}
