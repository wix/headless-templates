import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { seatingReservation } from '@wix/seatings';
import { SeatingPlanViewer } from '@wix/seating-plan-viewer';
import {
  addPlace,
  clampPlaceSelection,
  getOrderLimit,
  getPlaceAvailability,
  getPlaceSelectionInvoice,
  getPlaceSelectionQuantity,
  getPlaceSelectionReservationLines,
  getPlaces,
  getPlanStock,
  getPricingOptions,
  getReservationErrorCode,
  getCheckoutTotals,
  isAvailabilityError,
  isDonation,
  normalizePrice,
  removePlace,
  setPlaceDonation,
  setPlaceQuantity,
} from '@wix/events-registration-core';
import { categoryColors, placeLabel, placesById, seatingExternalId, selectedPlanIds, ticketColors } from '../utils/seating';
import { issueMessage, money, priceLabel, reservationMessage, saleLabel } from '../utils/tickets';
import TotalRows from './TotalRows.jsx';

function Swatch({ color }) {
  return <span aria-hidden="true" className="swatch" style={{ backgroundColor: color }} />;
}

/**
 * The seat picker for a seated event: the organizer's map (drawn by @wix/seating-plan-viewer, with
 * pan, zoom and keyboard access), a legend of the tickets in their map colors, the picked places
 * with their prices, and the order total. A seat or a whole table is toggled on the map; an area
 * takes a quantity per price. Each place sells the ticket its category maps to, and a whole table
 * is one ticket per seat. @wix/events-registration-core decides what can be picked, what it costs
 * and the reservation lines. A place taken meanwhile reloads the map.
 */
export default function SeatingPicker({ event, tickets, reserve }) {
  const orderLimit = getOrderLimit(event);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState([]);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  const places = useMemo(() => (summary ? getPlaces(summary, tickets) : []), [summary, tickets]);
  const byId = useMemo(() => placesById(places), [places]);
  const colors = useMemo(() => ticketColors(tickets), [tickets]);

  const loadMap = useCallback(async () => {
    setLoading(true);
    try {
      const next = await seatingReservation.getSeatingReservationSummaryByExternalId(seatingExternalId(event._id));
      setSummary(next?.plan ? next : null);
      // Keep what is still free on the new map.
      setSelection((s) => clampPlaceSelection(s, placesById(getPlaces(next, tickets))));
    } catch (e) {
      console.error('Failed to load the seating map', e);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [event._id, tickets]);

  useEffect(() => { loadMap(); }, [loadMap]);

  const blockedCopy = { PLACE_NOT_ON_SALE: "That place isn't on sale.", PLACE_STOCK: 'That place is taken.', ORDER_LIMIT: `Up to ${orderLimit} tickets per order.` };

  function add(place, pricingOptionId) {
    const availability = getPlaceAvailability(place, selection, { orderLimit, pricingOptionId });
    if (!availability.canAdd) { setError(blockedCopy[availability.blockedBy] ?? ''); return; }
    setSelection(addPlace(selection, { place, quantity: 1, ...(pricingOptionId ? { pricingOptionIds: [pricingOptionId] } : {}) }, { orderLimit }));
  }

  function togglePlace(placeId) {
    setError('');
    const place = byId[placeId];
    if (!place) return;
    if (selection.some((s) => s.placeId === placeId)) { setSelection(removePlace(selection, { place })); return; }
    add(place, getPricingOptions(place.ticket)[0]?.optionId ?? undefined);
  }

  /** An area's count for one price (or its only count): raising past a limit is refused with a reason. */
  function setAreaQuantity(place, pricingOptionId, quantity) {
    setError('');
    const entry = selection.find((s) => s.placeId === place.id && (!pricingOptionId || s.pricingOptionIds?.[0] === pricingOptionId));
    if (!entry) { if (quantity > 0) add(place, pricingOptionId); return; }
    if (quantity < 1) { setSelection(removePlace(selection, { place, pricingOptionId })); return; }
    const next = setPlaceQuantity(selection, { place, pricingOptionId, quantity }, { orderLimit });
    if (next === selection) {
      const { limit } = getPlaceAvailability(place, selection, { orderLimit, pricingOptionId });
      setError(limit.limitedBy === 'ORDER_LIMIT' ? blockedCopy.ORDER_LIMIT : 'No more places left there.');
      return;
    }
    setSelection(next);
  }

  /** A seat's or a whole table's price option: every ticket at that place takes it. */
  function setOption(place, pricingOptionId) {
    setSelection(selection.map((s) => (s.placeId === place.id ? { ...s, pricingOptionIds: Array.from({ length: s.quantity }, () => pricingOptionId) } : s)));
  }

  async function handleReserve() {
    setError('');
    const result = getPlaceSelectionReservationLines(selection, byId, { eventId: event._id, orderLimit });
    if ('issues' in result) { setError(issueMessage(result.issues)); return; }
    setReserving(true);
    try {
      await reserve(result.tickets);
    } catch (e) {
      console.error(e);
      const code = getReservationErrorCode(e);
      setError(reservationMessage(code, e));
      if (isAvailabilityError(code)) await loadMap();
    } finally {
      setReserving(false);
    }
  }

  if (loading && !summary) return <p className="muted">Loading the seating map…</p>;
  if (!summary) return <p className="muted">The seating map couldn't load. Refresh the page to try again.</p>;

  const mapTickets = tickets.filter((t) => places.some((p) => p.ticket._id === t._id));
  const picked = [...new Set(selection.map((s) => s.placeId))].map((id) => byId[id]).filter(Boolean);
  /** The tickets at one place, before tax and fees: a whole table adds up its seats. */
  const placePrice = (place) => getCheckoutTotals(
    getPlaceSelectionInvoice(event, tickets, selection.filter((s) => s.placeId === place.id), { withAdditionalFees: false }),
  ).subTotal;
  const count = getPlaceSelectionQuantity(selection);

  return (
    <div>
      <ul className="seat-legend">
        {mapTickets.map((t) => (
          <li key={t._id}>
            <Swatch color={colors[t._id]} />
            <span>{t.name}</span>
            <span className="muted">{saleLabel(t, event) || priceLabel(t)}</span>
          </li>
        ))}
      </ul>

      <SeatingPlanViewer
        plan={summary.plan}
        className="seat-map"
        style={{ height: 420 }}
        placesStock={getPlanStock(summary.plan, places, selection)}
        categoryColors={categoryColors(summary.plan, colors)}
        selectedPlaceIds={selectedPlanIds(selection, byId)}
        onPlaceActivate={(place) => togglePlace(place.id)}
      />
      <p className="muted" style={{ marginTop: 8 }}>
        Pick your seats on the map, up to {orderLimit} tickets per order. A table sold whole counts one ticket per seat.
      </p>

      {picked.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="seat-head">
            <p className="tier-name">Your seats ({count} {count === 1 ? 'ticket' : 'tickets'})</p>
            <button type="button" className="link-btn" onClick={() => { setSelection([]); setError(''); }}>Clear</button>
          </div>
          {picked.map((place) => {
            const options = getPricingOptions(place.ticket);
            const entries = selection.filter((s) => s.placeId === place.id);
            const label = placeLabel(place);
            return (
              <div key={place.id} className="tier-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <Swatch color={colors[place.ticket._id]} />
                  <div>
                    <p className="tier-name">{label}</p>
                    <p className="tier-desc">{[place.sectionTitle, place.ticket.name].filter(Boolean).join(' · ')}</p>
                    <p className="tier-price">{money(placePrice(place))}</p>
                    {isDonation(place.ticket) && (
                      <input
                        aria-label={`Your amount per ticket for ${label}`}
                        className="guest-price"
                        inputMode="decimal"
                        placeholder={priceLabel(place.ticket)}
                        value={entries[0]?.donation ?? ''}
                        onChange={(e) => setSelection(setPlaceDonation(selection, { place, donation: e.target.value === '' ? '' : normalizePrice(e.target.value, entries[0]?.donation ?? '') }))}
                      />
                    )}
                  </div>
                </div>
                <div className="qty" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {place.archetype !== 'AREA' && options.length > 0 && (
                    <select aria-label={`Price for ${label}`} value={entries[0]?.pricingOptionIds?.[0] ?? ''} onChange={(e) => setOption(place, e.target.value)}>
                      {options.map((o) => <option key={o.optionId} value={o.optionId}>{o.name} ({money(o.price)})</option>)}
                    </select>
                  )}
                  {place.archetype === 'AREA' && (options.length ? options : [null]).map((o) => {
                    const optionId = o?.optionId ?? undefined;
                    const quantity = entries.find((s) => !optionId || s.pricingOptionIds?.[0] === optionId)?.quantity ?? 0;
                    const name = o ? `${o.name} (${money(o.price)})` : '';
                    return (
                      <div key={optionId ?? 'all'} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {name && <span className="tier-desc" style={{ marginTop: 0 }}>{name}</span>}
                        <button type="button" className="qty-btn" aria-label={`Fewer ${name || label}`} onClick={() => setAreaQuantity(place, optionId, quantity - 1)}>−</button>
                        <span style={{ minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                        <button type="button" className="qty-btn" aria-label={`More ${name || label}`} onClick={() => setAreaQuantity(place, optionId, quantity + 1)}>+</button>
                      </div>
                    );
                  })}
                  <button type="button" className="link-btn" aria-label={`Remove ${label}`} onClick={() => setSelection(removePlace(selection, { place }))}>Remove</button>
                </div>
              </div>
            );
          })}
          <TotalRows invoice={getPlaceSelectionInvoice(event, tickets, selection)} />
        </div>
      )}

      <button onClick={handleReserve} disabled={reserving || loading || selection.length === 0} className="btn full" style={{ marginTop: 16 }}>
        {reserving ? 'Reserving…' : 'Get Tickets'}
      </button>
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
