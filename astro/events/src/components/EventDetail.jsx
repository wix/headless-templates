import React, { useState, useEffect } from 'react';
import { ticketDefinitionsV2, ticketReservations, rsvpV2 } from '@wix/events';
import { redirects } from '@wix/redirects';
import { media } from '@wix/sdk';
import { BUSINESS_NAME } from '../utils/constants';
import {
  getOrderLimit,
  getPricingOptions,
  getReservationErrorCode,
  getTicketQuantityLimit,
  getTicketSelectionInvoice,
  getTicketSelectionQuantity,
  getTicketSelectionReservationLines,
  isDonation,
  normalizePrice,
  setTicketDonation,
  setTicketQuantity,
} from '@wix/events-registration-core';
import { issueMessage, money, priceLabel, reservationMessage, saleLabel, visibleTickets } from '../utils/tickets';
import SeatingPicker from './SeatingPicker.jsx';
import TotalRows from './TotalRows.jsx';

function imgSrc(mainImage, w = 1000, h = 1000) {
  const v = mainImage?.url ?? mainImage;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://')) return media.getScaledToFillImageUrl(v, w, h, {});
  return typeof v === 'string' ? v : (v.url ?? '');
}

/**
 * Reserve the ticket lines (held for a few minutes), then send the guest to the Wix-hosted
 * checkout, which collects their details and payment and lists any seats. Runs in the browser:
 * the return URLs need the site's origin.
 */
async function reserveAndCheckout(event, tickets) {
  const reservation = await ticketReservations.createTicketReservation({ tickets });
  const origin = window.location.origin;
  const { redirectSession } = await redirects.createRedirectSession({
    eventsCheckout: { reservationId: reservation._id, eventSlug: event.slug },
    // Wix appends ?orderNumber=&eventId= to the thank-you URL; /event-confirmation reads eventId.
    callbacks: {
      thankYouPageUrl: `${origin}/event-confirmation`,
      postFlowUrl: `${origin}/events/${event.slug}`,
    },
  });
  window.location.href = redirectSession.fullUrl;
}

/* ─── Tier Picker (TICKETING events without a seating map) ──────────────── */
// @wix/events-registration-core keeps the TicketSelection ({ [ticketDefinitionId]: { quantity,
// pricingOptionIds, donation } }), refuses quantities past the ticket's or the order's limit, prices
// the preliminary invoice and builds the reservation lines.
function TierPicker({ event, tickets }) {
  const orderLimit = getOrderLimit(event);
  const [selection, setSelection] = useState({});
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  // One row per ticket, or per price of a ticket with several prices.
  const rows = tickets.flatMap((ticket) => {
    const options = getPricingOptions(ticket);
    return options.length
      ? options.map((o) => ({ key: `${ticket._id}:${o.optionId}`, ticket, pricingOptionId: o.optionId, name: `${ticket.name}: ${o.name}`, price: money(o.price) }))
      : [{ key: ticket._id, ticket, name: ticket.name, price: priceLabel(ticket) }];
  });

  function setQuantity(row, quantity) {
    setError('');
    const next = setTicketQuantity(selection, { ticketDefinition: row.ticket, pricingOptionId: row.pricingOptionId, quantity: Math.max(0, quantity) }, { orderLimit });
    if (next === selection && quantity > getTicketSelectionQuantity(selection, { ticketDefinitionId: row.ticket._id, pricingOptionId: row.pricingOptionId })) {
      const { limitedBy, max } = getTicketQuantityLimit(selection, row.ticket, { orderLimit, pricingOptionId: row.pricingOptionId });
      setError(limitedBy === 'ORDER_LIMIT' ? `Up to ${orderLimit} tickets per order.` : `Up to ${max} of this ticket per order.`);
    }
    setSelection(next);
  }

  async function handleReserve() {
    setError('');
    const result = getTicketSelectionReservationLines(selection, tickets, { eventId: event._id, orderLimit });
    if ('issues' in result) { setError(issueMessage(result.issues)); return; }
    setReserving(true);
    try {
      await reserveAndCheckout(event, result.tickets);
    } catch (e) {
      console.error(e);
      setError(reservationMessage(getReservationErrorCode(e), e));
    } finally {
      setReserving(false);
    }
  }

  const count = getTicketSelectionQuantity(selection);

  return (
    <div>
      {rows.map((row) => {
        const quantity = getTicketSelectionQuantity(selection, { ticketDefinitionId: row.ticket._id, pricingOptionId: row.pricingOptionId });
        const unavailable = saleLabel(row.ticket, event);
        const donation = selection[row.ticket._id]?.donation ?? '';
        return (
          <div key={row.key} className="tier-row">
            <div>
              <p className="tier-name">{row.name}</p>
              {row.ticket.description && <p className="tier-desc">{row.ticket.description}</p>}
              <p className="tier-price">{unavailable || row.price}</p>
              {isDonation(row.ticket) && quantity > 0 && (
                <input
                  aria-label={`Your amount per ticket for ${row.ticket.name}`}
                  className="guest-price"
                  inputMode="decimal"
                  placeholder={priceLabel(row.ticket)}
                  value={donation}
                  onChange={(e) => setSelection(setTicketDonation(selection, { ticketDefinition: row.ticket, donation: e.target.value === '' ? '' : normalizePrice(e.target.value, donation) }, { orderLimit }))}
                />
              )}
            </div>
            <div className="qty">
              <button className="qty-btn" disabled={!!unavailable || quantity === 0} aria-label={`Fewer ${row.name}`} onClick={() => setQuantity(row, quantity - 1)}>−</button>
              <span style={{ minWidth: 20, textAlign: 'center' }}>{quantity}</span>
              <button className="qty-btn" disabled={!!unavailable} aria-label={`More ${row.name}`} onClick={() => setQuantity(row, quantity + 1)}>+</button>
            </div>
          </div>
        );
      })}
      {count > 0 && <TotalRows invoice={getTicketSelectionInvoice(event, tickets, selection)} />}
      <button onClick={handleReserve} disabled={reserving} className="btn full" style={{ marginTop: 16 }}>
        {reserving ? 'Reserving…' : 'Get Tickets'}
      </button>
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

/* ─── Ticket Picker (TICKETING events) ──────────────────────────────────── */
// A seated event sells places on its seating map; it never sells ticket quantities, because Wix
// would issue tickets that hold no seat. Any other ticketed event sells ticket quantities.
function TicketPicker({ event }) {
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    ticketDefinitionsV2.queryAvailableTicketDefinitions({ filter: { eventId: event._id }, sort: [{ fieldName: 'sortIndex', order: 'ASC' }] })
      .then(({ ticketDefinitions }) => setTickets(visibleTickets(ticketDefinitions, event)))
      .catch((e) => { console.error('Failed to load tickets', e); setTickets([]); });
  }, [event]);

  if (tickets === null) return <p className="muted">Loading tickets…</p>;
  if (tickets.length === 0) return <p className="muted">Tickets aren't available yet.</p>;
  if (event.seating) return <SeatingPicker event={event} tickets={tickets} reserve={(lines) => reserveAndCheckout(event, lines)} />;
  return <TierPicker event={event} tickets={tickets} />;
}

/* ─── RSVP Form (RSVP events) ────────────────────────────────────────────── */
function RsvpForm({ event }) {
  const allowDecline = event.registration?.rsvp?.responseType === 'YES_AND_NO';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  async function submit(status) {
    setError('');
    if (!firstName || !lastName || !email) { setError('Please fill in your name and email.'); return; }
    setSubmitting(true);
    try {
      await rsvpV2.createRsvp({ eventId: event._id, firstName, lastName, email, status });
      setDone(status);
    } catch (e) {
      setError('Could not submit your RSVP. Please try again.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div>
        <p style={{ fontSize: 16, fontWeight: 600 }}>{done === 'YES' ? "You're on the list!" : "Thanks for letting us know."}</p>
        <p className="muted" style={{ marginTop: 8 }}>An email with the details was sent to {email}.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <div className="rsvp-field">
        <label>First name *</label>
        <input value={firstName} onChange={e => setFirstName(e.target.value)} />
      </div>
      <div className="rsvp-field">
        <label>Last name *</label>
        <input value={lastName} onChange={e => setLastName(e.target.value)} />
      </div>
      <div className="rsvp-field">
        <label>Email *</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={() => submit('YES')} disabled={submitting} className="btn" style={{ flex: 1 }}>
          {submitting ? 'Sending…' : 'RSVP Yes'}
        </button>
        {allowDecline && (
          <button onClick={() => submit('NO')} disabled={submitting} className="pill line" style={{ flex: 1, textAlign: 'center' }}>
            Can't Make It
          </button>
        )}
      </div>
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

/* ─── Event Detail Page ──────────────────────────────────────────────────── */
export default function EventDetail({ event, member = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const src = imgSrc(event.mainImage);
  const isTicketing = event.registration?.initialType === 'TICKETING';

  return (
    <div className="app">
      <div className="banner">ADD YOUR PROMOTIONAL BANNER HERE</div>

      <header className="header">
        <div className="site-header-inner">
          <a href="/" className="logo">
            <div className="logo-dot" />
            <span>{BUSINESS_NAME}</span>
          </a>
          <nav className="nav desktop-header-actions" style={{ justifyContent: 'flex-end' }}>
            <a href="/#events">All Events</a>
            <a href="/about">Our Story</a>
            {member && <span className="muted">{member.profile?.nickname ?? member.loginEmail}</span>}
          </nav>
          <button className="mobile-menu-btn" aria-label="menu" onClick={() => setMenuOpen(o => !o)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu-panel">
            <a href="/#events">All Events</a>
            <a href="/about">Our Story</a>
          </div>
        )}
      </header>

      <section className="grid-2 grow" style={{ background: '#fff', gap: 60, padding: '60px var(--pad)', alignItems: 'start' }}>
        <div className="sq" style={{ aspectRatio: '4/5' }}>
          {src ? <img className="fill" style={{ objectFit: 'cover', borderRadius: 2 }} src={src} alt={event.title} /> : <div className="fill ph0" />}
        </div>
        <div>
          <p className="eyebrow">{isTicketing ? 'GET TICKETS' : 'RSVP'}</p>
          <h1 className="h-md" style={{ marginBottom: 16 }}>{event.title}</h1>
          <p className="body-copy" style={{ marginBottom: 6, opacity: 0.7 }}>{event.dateAndTimeSettings?.formatted?.dateAndTime}</p>
          <p className="body-copy" style={{ marginBottom: 24, opacity: 0.7 }}>{event.location?.name}</p>
          {event.shortDescription && <p className="body-copy" style={{ marginBottom: 32 }}>{event.shortDescription}</p>}
          {isTicketing ? <TicketPicker event={event} /> : <RsvpForm event={event} />}
        </div>
      </section>

      <footer className="footer" style={{ padding: '48px var(--pad) 32px', textAlign: 'center' }}>
        <p className="footer-copy" style={{ marginTop: 0, paddingBottom: 0 }}>© 2035 by {BUSINESS_NAME}. Powered and secured by Wix</p>
      </footer>
    </div>
  );
}
