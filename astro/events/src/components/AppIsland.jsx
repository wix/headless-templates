import React, { useState, useRef } from 'react';
import { media } from '@wix/sdk';
import { BUSINESS_NAME } from '../utils/constants';

function imgSrc(mainImage, w = 600, h = 600) {
  const v = mainImage?.url ?? mainImage;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://')) return media.getScaledToFillImageUrl(v, w, h, {});
  return typeof v === 'string' ? v : (v.url ?? '');
}

function EventCard({ event, index, featured }) {
  const src = imgSrc(event.mainImage, featured ? 1000 : 600, featured ? 1250 : 600);
  const isTicketing = event.registration?.initialType === 'TICKETING';
  return (
    <a href={`/events/${event.slug}`} className={`card${featured ? ' featured' : ''}`}>
      <div className="card-img">
        {src ? <img src={src} alt={event.title} /> : <div className={`fill ph${index % 4}`} />}
      </div>
      <div>
        <p className="card-name">{event.title}</p>
        <p className="card-price">{event.dateAndTimeSettings?.formatted?.startDate}</p>
        {!featured && <p className="card-action">{isTicketing ? 'Get Tickets' : 'RSVP'}</p>}
      </div>
    </a>
  );
}

function EventCarousel({ events, startIndex = 0 }) {
  const trackRef = useRef(null);
  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240 * 2, behavior: 'smooth' });
  };
  return (
    <div className="carousel">
      <div className="carousel-track" ref={trackRef}>
        {events.map((e, i) => (
          <div key={e._id}>
            <EventCard event={e} index={startIndex + i} />
          </div>
        ))}
      </div>
      <button className="car-arrow left" aria-label="Previous events" onClick={() => scrollByAmount(-1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button className="car-arrow right" aria-label="Next events" onClick={() => scrollByAmount(1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  );
}

function HomePage({ events }) {
  const featured = events[0] ?? null;
  const gridEvents = events.slice(1);

  return (
    <>
      <section className="hero grad pl">
        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          <h1 className="h-hero">Add your event series<br />name or title here</h1>
          <a href="#events" className="pill dark" style={{ marginTop: 36 }}>See What's On</a>
        </div>
      </section>

      <section id="events" className="shop-sec">
        <div className="wrap">
          {events.length === 0 ? (
            <div className="grid-4" style={{ gap: 16 }}>
              {[0, 1, 2, 3].map(i => <div key={i} className={`sq ph${i % 4}`} />)}
            </div>
          ) : (
            <div className="shop-grid" style={{ gap: 40, alignItems: 'start' }}>
              {featured && <EventCard event={featured} index={0} featured />}
              <div style={{ minWidth: 0 }}>
                <div className="grid-3" style={{ gap: 20, marginBottom: 12 }}>
                  {gridEvents.slice(0, 3).map((e, i) => <EventCard key={e._id} event={e} index={i + 1} />)}
                </div>
                <div className="tc" style={{ textAlign: 'right' }}>
                  <a href="#events" className="pill sm">All Events</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="quote-sec">
        <blockquote>"This is the space to introduce<br />your event and what makes it worth attending"</blockquote>
        <p style={{ marginTop: 28, fontSize: 14, fontWeight: 500 }}>Full Name</p>
      </section>

      <section className="shop-sec">
        <div className="wrap" style={{ padding: '0 24px' }}>
          {events.length === 0 ? (
            <div className="grid-4" style={{ gap: 16 }}>
              {[0, 1, 2, 3].map(i => <div key={i} className={`sq ph${i % 4}`} />)}
            </div>
          ) : (
            <EventCarousel events={events} startIndex={2} />
          )}
        </div>
      </section>

      <section className="story-sec grad">
        <div>
          <h2>Use this space to<br />promote your next event.</h2>
          <a href="/about" className="pill line" style={{ marginTop: 28 }}>Our Story</a>
        </div>
      </section>

      <section className="promo-sec grid-2">
        <div className="fill sq ph1" style={{ minHeight: 280 }} />
        <div>
          <p>Use this space to promote your event series, its speakers or its schedule.</p>
          <a href="#events" className="pill dark" style={{ marginTop: 28 }}>See What's On</a>
        </div>
      </section>

      <section className="grid-4">
        {[0, 1, 2, 3].map(i => <div key={i} className={`sq ph${(i + 1) % 4}`} style={{ borderRadius: 0 }} />)}
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <div className="grow">
      <section className="about-hero grad pl">
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h1 className="h-page">Add a headline that tells your event series' story</h1>
        </div>
      </section>

      <section className="about-sec grid-2 pl" style={{ background: '#fff', gap: 80, alignItems: 'center' }}>
        <div>
          <p className="eyebrow">WHO WE ARE</p>
          <h2 className="h-md" style={{ marginBottom: 24 }}>Add a subheading to introduce your story</h2>
          <p className="body-copy">
            This is the space to share why these events happen — how the series started, what it's for, and what makes each gathering worth showing up to.
          </p>
          <p className="body-copy" style={{ marginTop: 16 }}>
            Use this paragraph to go deeper — the people behind it, the format, or a moment that shaped it. Authentic stories build trust.
          </p>
        </div>
        <div className="ph1" style={{ aspectRatio: '4/5', borderRadius: 2 }} />
      </section>

      <section className="about-sec tc" style={{ background: '#f7f8fc' }}>
        <p className="eyebrow" style={{ marginBottom: 40 }}>WHAT WE STAND FOR</p>
        <div className="grid-3" style={{ gap: 40 }}>
          {['Add a Value', 'Add a Value', 'Add a Value'].map((title, i) => (
            <div key={i} style={{ textAlign: 'left' }}>
              <div className="circle grad" style={{ width: 48, height: 48, marginBottom: 20 }} />
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>{title}</p>
              <p className="body-copy" style={{ fontSize: 14 }}>
                Describe what this value means to your events and how it shows up in every gathering you host.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-sec tc" style={{ background: 'var(--dark)', color: '#fff' }}>
        <p className="eyebrow" style={{ marginBottom: 8, opacity: 0.6 }}>THE TEAM</p>
        <h2 className="h-md" style={{ marginBottom: 48 }}>The people behind the events</h2>
        <div className="grid-4" style={{ gap: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i}>
              <div className={`circle ph${i % 4}`} style={{ aspectRatio: '1', marginBottom: 16 }} />
              <p style={{ fontWeight: 600, fontSize: 15 }}>Full Name</p>
              <p className="muted" style={{ marginTop: 4 }}>Job Title</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-sec">
        <h2>Add a call-to-action heading for your next event</h2>
        <p>Use this space to encourage visitors to take the next step — see what's on, save their seat, or sign up.</p>
        <a href="/#events" className="pill light" style={{ marginTop: 36 }}>See What's On</a>
      </section>
    </div>
  );
}

export default function AppIsland({ events = [], member = null, page = 'home' }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <a href="/about" className={page === 'about' ? 'on' : ''}>Our Story</a>
            {member && (
              <div className="member">
                <div className="avatar">{(member.profile?.nickname ?? member.loginEmail ?? '?')[0].toUpperCase()}</div>
                <span className="member-name">{member.profile?.nickname ?? member.loginEmail}</span>
                <form method="POST" action="/api/auth/logout">
                  <button type="submit" className="logout-btn">Log Out</button>
                </form>
              </div>
            )}
          </nav>
          <button className="mobile-menu-btn" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(o => !o)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (<><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>) : (<><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>)}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-menu-panel">
            <a href="/#events" onClick={() => setMenuOpen(false)}>All Events</a>
            <a href="/about" onClick={() => setMenuOpen(false)} className={page === 'about' ? 'on' : ''}>Our Story</a>
            {member && (
              <>
                <div className="hr" />
                <span className="muted">{member.profile?.nickname ?? member.loginEmail}</span>
                <form method="POST" action="/api/auth/logout">
                  <button type="submit" className="logout-btn">Log Out</button>
                </form>
              </>
            )}
          </div>
        )}
      </header>

      {page === 'about' ? <AboutPage /> : <HomePage events={events} />}

      <footer className="footer pl pr">
        <div className="wrap" style={{ padding: 0 }}>
          <nav>
            <p>NAVIGATE</p>
            <a href="/#events">All Events</a>
            <a href="/about">Our Story</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-logo">Logo.</p>
          <p className="footer-copy">© 2035 by {BUSINESS_NAME}. Powered and secured by Wix</p>
        </div>
      </footer>
    </div>
  );
}
