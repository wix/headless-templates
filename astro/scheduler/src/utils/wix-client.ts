import { availabilityCalendar, services, bookings } from "@wix/bookings";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { redirects } from "@wix/redirects";

// Create a reusable Wix client for both server and client-side
export function createWixClient() {
  return createClient({
    modules: { services, availabilityCalendar, bookings, redirects },
    auth: OAuthStrategy({
      clientId: "30e9f47f-67ff-46b9-b9f0-bffcf702080d",
    }),
  });
}
