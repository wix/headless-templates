import { type FormEvent, useEffect, useState } from "react";
import type { StoryEvent } from "../lib/types";

type XpDesktopProps = {
  events: StoryEvent[];
};

type RsvpStatus = {
  tone: "idle" | "pending" | "success" | "error";
  message: string;
};

export function XpDesktop({ events }: XpDesktopProps) {
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(
    events[0] ?? null,
  );
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(events.length > 0);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>({
    tone: "idle",
    message: "",
  });

  const openEvent = (event: StoryEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
    setIsRsvpOpen(false);
  };

  const openRsvp = (event: StoryEvent | null = selectedEvent) => {
    if (!event) {
      return;
    }

    setSelectedEvent(event);
    setRsvpStatus({ tone: "idle", message: "" });
    setIsRsvpOpen(true);
  };

  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedEvent) {
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setRsvpStatus({
        tone: "error",
        message: "Type your first name, last name, and email before finishing.",
      });
      return;
    }

    setRsvpStatus({ tone: "pending", message: "Dialing Wix Events..." });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          firstName,
          lastName,
          email,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "RSVP failed.");
      }

      setRsvpStatus({
        tone: "success",
        message: result.message || "RSVP saved.",
      });
    } catch (error) {
      console.error("RSVP request failed", error);
      setRsvpStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not record that RSVP. Please try again.",
      });
    }
  };

  return (
    <main className="xp-screen">
      <section className="desktop-icons" aria-label="Desktop shortcuts">
        {events.slice(0, 3).map((event) => (
          <button
            className="desktop-icon"
            key={event.id}
            onClick={() => openEvent(event)}
          >
            <span>{event.icon}</span>
            <small>{event.title}</small>
          </button>
        ))}
        <button className="desktop-icon" onClick={() => setIsHelpOpen(true)}>
          <span>❔</span>
          <small>ReadMe.txt</small>
        </button>
      </section>

      <section
        className="xp-window main-window"
        aria-labelledby="main-window-title"
      >
        <div className="xp-titlebar">
          <span id="main-window-title">Code Before AI - Event Explorer</span>
          <div className="window-actions" aria-hidden="true">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </div>
        </div>
        <div className="xp-menubar" aria-hidden="true">
          <span>File</span>
          <span>Events</span>
          <span>Stories</span>
          <span>Help</span>
        </div>
        <div className="xp-toolbar">
          <button onClick={() => setIsHelpOpen(true)}>About</button>
          <button onClick={() => openRsvp()} disabled={!selectedEvent}>
            RSVP Wizard
          </button>
          <button onClick={() => setIsStartOpen((value) => !value)}>
            Start Menu
          </button>
        </div>
        <div className="xp-window-body explorer-layout">
          <aside className="folder-pane">
            <h2>Event Folders</h2>
            <p className="folder active">
              📁 All Stories ({events.length})
            </p>
          </aside>
          <section className="event-grid" aria-label="Upcoming events">
            {events.length === 0 ? (
              <p className="empty-state">
                No upcoming events are published on this site yet. Add an RSVP
                event in the Wix dashboard and it will show up here.
              </p>
            ) : (
              events.map((event) => (
                <article className="xp-card" key={event.id}>
                  <button
                    className="event-image"
                    onClick={() => openEvent(event)}
                  >
                    <span>{event.icon}</span>
                  </button>
                  <div className="event-copy">
                    <p className="file-label">{event.status}</p>
                    <h2>{event.title}</h2>
                    {event.summary ? <p>{event.summary}</p> : null}
                    <dl>
                      <div>
                        <dt>Date</dt>
                        <dd>{event.date}</dd>
                      </div>
                      <div>
                        <dt>Venue</dt>
                        <dd>{event.venue}</dd>
                      </div>
                    </dl>
                    <div className="button-row">
                      <button onClick={() => openEvent(event)}>Open</button>
                      <button onClick={() => openRsvp(event)}>RSVP</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </section>

      {isDetailsOpen && selectedEvent ? (
        <section
          className="xp-window floating-window details-window"
          aria-label="Event details"
        >
          <div className="xp-titlebar">
            <span>{selectedEvent.title}.exe</span>
            <div className="window-actions">
              <button
                aria-label="Close details window"
                onClick={() => setIsDetailsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="xp-window-body">
            <div className="dialog-icon">{selectedEvent.icon}</div>
            <div>
              <p className="file-label">Opening story archive</p>
              <h2>{selectedEvent.title}</h2>
              {selectedEvent.summary ? <p>{selectedEvent.summary}</p> : null}
              <div className="details-list">
                <span>{selectedEvent.date}</span>
                <span>{selectedEvent.time}</span>
                <span>{selectedEvent.venue}</span>
              </div>
              <div className="button-row right">
                <button onClick={() => openRsvp()}>Run RSVP Wizard</button>
                {selectedEvent.eventPageUrl ? (
                  <a className="xp-link-button" href={selectedEvent.eventPageUrl}>
                    Wix Event Page
                  </a>
                ) : null}
                <button onClick={() => setIsDetailsOpen(false)}>OK</button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isRsvpOpen && selectedEvent ? (
        <section
          className="xp-window floating-window rsvp-window"
          aria-label="RSVP wizard"
        >
          <div className="xp-titlebar">
            <span>RSVP Wizard</span>
            <div className="window-actions">
              <button
                aria-label="Close RSVP wizard"
                onClick={() => setIsRsvpOpen(false)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="xp-window-body wizard-body">
            <div className="wizard-sidebar">
              <span>✓</span>
              <p>Wix RSVP</p>
            </div>
            <form className="xp-form" onSubmit={submitRsvp}>
              <h2>Reserve a chair and a story</h2>
              <p className="selected-rsvp-event">{selectedEvent.title}</p>
              <label>
                First name
                <input
                  autoComplete="given-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Ada"
                  value={firstName}
                />
              </label>
              <label>
                Last name
                <input
                  autoComplete="family-name"
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Lovelace"
                  value={lastName}
                />
              </label>
              <label>
                Email
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ada@example.com"
                  type="email"
                  value={email}
                />
              </label>
              {rsvpStatus.message ? (
                <p className={`rsvp-status ${rsvpStatus.tone}`}>
                  {rsvpStatus.message}
                </p>
              ) : null}
              <div className="button-row right">
                <button type="button" onClick={() => setIsRsvpOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={rsvpStatus.tone === "pending"}>
                  {rsvpStatus.tone === "pending" ? "Sending..." : "Finish"}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {isHelpOpen ? (
        <aside className="xp-popup" role="note">
          <div className="popup-title">
            <strong>Windows XP vibe enabled</strong>
            <button aria-label="Close note" onClick={() => setIsHelpOpen(false)}>
              ×
            </button>
          </div>
          <p>
            Double-click the memories. Hear programmers explain how they coded
            before AI autocomplete, instant answers, and deploy buttons with
            manners.
          </p>
        </aside>
      ) : null}

      {isStartOpen ? (
        <section className="start-menu" aria-label="Start menu">
          <div className="start-user">👴 Code Before AI</div>
          <button
            onClick={() => selectedEvent && openEvent(selectedEvent)}
            disabled={!selectedEvent}
          >
            Recent Story
          </button>
          <button onClick={() => openRsvp()} disabled={!selectedEvent}>
            RSVP Wizard
          </button>
          <button onClick={() => setIsHelpOpen(true)}>Help and Support</button>
          <button onClick={() => setIsStartOpen(false)}>Log Off</button>
        </section>
      ) : null}

      <footer className="xp-taskbar">
        <button
          className="start-button"
          onClick={() => setIsStartOpen((value) => !value)}
        >
          start
        </button>
        <button className="task-button active">Code Before AI</button>
        {isDetailsOpen && selectedEvent ? (
          <button className="task-button" onClick={() => setIsDetailsOpen(true)}>
            {selectedEvent.title}
          </button>
        ) : null}
        {isRsvpOpen ? (
          <button className="task-button" onClick={() => setIsRsvpOpen(true)}>
            RSVP Wizard
          </button>
        ) : null}
        <div className="tray">
          <span aria-hidden="true">🔊</span>
          <span aria-hidden="true">LAN</span>
          <TrayClock />
        </div>
      </footer>
    </main>
  );
}

/**
 * The taskbar clock. Rendered empty on the server and filled in after
 * hydration — a server-rendered time would be the pod's clock, not the
 * visitor's, and would mismatch on hydration.
 */
function TrayClock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );

    tick();
    const timer = window.setInterval(tick, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  return <time suppressHydrationWarning>{now}</time>;
}
