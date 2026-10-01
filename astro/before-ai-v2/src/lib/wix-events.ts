import { auth } from "@wix/essentials";
import { rsvpV2, wixEventsV2 } from "@wix/events";
import type { StoryEvent } from "./types";

type WixEvent = wixEventsV2.Event;

type RsvpInput = {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
};

// Purely decorative — Wix Events has no per-event icon, so the desktop
// metaphor assigns one from this list by position.
const eventIcons = ["💾", "🖥", "📘", "💿", "☎", "🧰", "🪟", "⌨"];

/**
 * Upcoming events, newest first. Published events are public, so this is a
 * plain visitor-scoped read — `@wix/astro` authenticates it automatically
 * (no client, no API key). An empty list is a legitimate result: a site with
 * no upcoming events renders the empty state rather than invented ones.
 */
export async function loadStoryEvents(): Promise<StoryEvent[]> {
  try {
    const result = await wixEventsV2
      .queryEvents({ fields: ["DETAILS", "REGISTRATION", "URLS"] })
      .in("status", ["UPCOMING", "STARTED"])
      .ascending("dateAndTimeSettings.startDate")
      .limit(12)
      .find();

    return result.items
      .map(mapWixEvent)
      .filter((event): event is StoryEvent => event !== null);
  } catch (error) {
    console.error("Failed to load Wix Events", error);
    return [];
  }
}

/**
 * Creating an RSVP is a privileged write, so it runs elevated. This only ever
 * executes inside the /api/rsvp endpoint (server-side) — never in the browser.
 */
export async function createWixRsvp({
  eventId,
  firstName,
  lastName,
  email,
}: RsvpInput) {
  // The generated type marks additionalGuestDetails as required, but Wix rejects
  // those fields when the event form does not include additional guests.
  const rsvp = {
    eventId,
    email,
    firstName,
    lastName,
    status: "YES",
  } as unknown as Parameters<typeof rsvpV2.createRsvp>[0];

  await auth.elevate(rsvpV2.createRsvp)(rsvp);
}

function mapWixEvent(event: WixEvent, index: number): StoryEvent | null {
  if (!event._id || !event.title) {
    return null;
  }

  const formatted = event.dateAndTimeSettings?.formatted;

  return {
    id: event._id,
    title: event.title,
    date:
      formatted?.startDate || formatDate(event.dateAndTimeSettings?.startDate),
    time:
      formatted?.startTime || formatTime(event.dateAndTimeSettings?.startDate),
    venue: formatVenue(event),
    icon: eventIcons[index % eventIcons.length],
    status: formatStatus(event),
    summary: event.shortDescription?.trim() || "",
    eventPageUrl: event.eventPageUrl ?? undefined,
  };
}

function formatVenue(event: WixEvent) {
  const location = event.location;

  if (!location) {
    return "Venue TBA";
  }

  if (location.name) {
    return location.name;
  }

  if (location.locationTbd) {
    return "Venue TBA";
  }

  if (location.type === "ONLINE") {
    return "Online";
  }

  const address = location.address;
  const parts = [address?.addressLine1, address?.city, address?.country].filter(
    Boolean,
  );

  return parts.join(", ") || "Venue TBA";
}

function formatStatus(event: WixEvent) {
  const rsvps = event.summaries?.rsvps;

  if (rsvps?.yesCount !== undefined) {
    return `${rsvps.yesCount} RSVP${rsvps.yesCount === 1 ? "" : "s"}`;
  }

  if (event.registration?.status) {
    return event.registration.status.replaceAll("_", " ").toLowerCase();
  }

  return event.status?.toLowerCase() || "open";
}

// Wix returns pre-formatted date strings in the site's locale; these only run
// when a site has formatting disabled, and follow the visitor's own locale.
function formatDate(date?: Date | string | null) {
  if (!date) {
    return "Date TBA";
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
    new Date(date),
  );
}

function formatTime(date?: Date | string | null) {
  if (!date) {
    return "Time TBA";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
