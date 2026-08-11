import React from 'react';
import { BUSINESS_NAME } from '../utils/constants';

export default function EventConfirmation({ event }) {
  return (
    <div className="app">
      <header className="header">
        <div className="site-header-inner">
          <a href="/" className="logo">
            <div className="logo-dot" />
            <span>{BUSINESS_NAME}</span>
          </a>
        </div>
      </header>
      <section className="grow tc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ maxWidth: 480 }}>
          <p className="eyebrow">YOU'RE ALL SET</p>
          <h1 className="h-md" style={{ marginBottom: 16 }}>
            {event ? `See you at ${event.title}` : 'Thank you for your order'}
          </h1>
          <p className="body-copy">A confirmation email with all the details was sent to you.</p>
          <a href="/" className="pill dark" style={{ marginTop: 32 }}>See What's On</a>
        </div>
      </section>
    </div>
  );
}
