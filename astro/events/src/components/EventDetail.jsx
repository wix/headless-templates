import React, { useState, useEffect } from 'react';
import { orders, ticketReservations, rsvpV2 } from '@wix/events';
import { redirects } from '@wix/redirects';
import { media } from '@wix/sdk';
import { BUSINESS_NAME } from '../utils/constants';

function imgSrc(mainImage, w = 1000, h = 1000) {
  const v = mainImage?.url ?? mainImage;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://')) return media.getScaledToFillImageUrl(v, w, h, {});
  return typeof v === 'string' ? v : (v.url ?? '');
}

/* ─── Ticket Picker (TICKETING events) ──────────────────────────────────── */
function TicketPicker({ event }) {
  const [tiers, setTiers] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    orders.queryAvailableTickets({ filter: { eventId: event._id }, limit: 20 })
      .then(({ definitions }) => setTiers(definitions ?? []))
      .catch(() => setTiers([]));
  }, [event._id]);

  function setQty(id, qty) {
    setQuantities(q => ({ ...q, [id]: Math.max(0, qty) }));
  }

  async function handleReserve() {
    setError('');
    const selections = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketDefinitionId, quantity]) => ({ ticketDefinitionId, quantity }));
    if (selections.length === 0) { setError('Choose at least one ticket.'); return; }
    setReserving(true);
    try {
      const reservation = await ticketReservations.createTicketReservation({ tickets: selections });
      const origin = window.location.origin;
      const { redirectSession } = await redirects.createRedirectSession({
        eventsCheckout: { reservationId: reservation._id, eventSlug: event.slug },
        callbacks: {
          thankYouPageUrl: `${origin}/event-confirmation`,
          postFlowUrl: `${origin}/events/${event.slug}`,
        },
      });
      window.location.href = redirectSession.fullUrl;
    } catch (e) {
      const msg = e?.message ?? '';
      if (/payment method|not configured|premium/i.test(msg)) {
        setError("Ticket sales aren't switched on yet — the organizer needs to connect a payment method.");
      } else {
        setError('Could not reserve tickets. Please try again.');
      }
      console.error(e);
    } finally {
      setReserving(false);
    }
  }

  if (tiers === null) return <p className="muted">Loading tickets…</p>;
  if (tiers.length === 0) return <p className="muted">Tickets aren't available yet.</p>;

  return (
    <div>
      {tiers.map(tier => (
        <div key={tier._id} className="tier-row">
          <div>
            <p className="tier-name">{tier.name}</p>
            {tier.description && <p className="tier-desc">{tier.description}</p>}
            <p className="tier-price">{tier.free ? 'Free' : `${tier.price?.currency ?? ''} ${tier.price?.value ?? ''}`}</p>
          </div>
          <div className="qty">
            <button className="qty-btn" onClick={() => setQty(tier._id, (quantities[tier._id] ?? 0) - 1)}>−</button>
            <span style={{ minWidth: 20, textAlign: 'center' }}>{quantities[tier._id] ?? 0}</span>
            <button className="qty-btn" onClick={() => setQty(tier._id, (quantities[tier._id] ?? 0) + 1)}>+</button>
          </div>
        </div>
      ))}
      <button onClick={handleReserve} disabled={reserving} className="btn full" style={{ marginTop: 16 }}>
        {reserving ? 'Reserving…' : 'Get Tickets'}
      </button>
      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
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
