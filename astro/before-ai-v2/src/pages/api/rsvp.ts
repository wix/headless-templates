import type { APIRoute } from "astro";
import { createWixRsvp } from "../../lib/wix-events";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const eventId = getString(body?.eventId);
  const firstName = getString(body?.firstName);
  const lastName = getString(body?.lastName);
  const email = getString(body?.email);

  if (!eventId || !firstName || !lastName || !email) {
    return Response.json(
      { error: "Event, first name, last name, and email are required." },
      { status: 400 },
    );
  }

  try {
    await createWixRsvp({ eventId, firstName, lastName, email });

    return Response.json({ message: "RSVP sent to Wix Events." });
  } catch (error) {
    // Log the real error server-side; the visitor gets a generic message.
    console.error("Failed to create Wix RSVP", error);

    return Response.json(
      { error: "We could not record that RSVP. Please try again." },
      { status: 502 },
    );
  }
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
