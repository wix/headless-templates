import { createContext } from "react";
import { availabilityCalendar, services, bookings } from "@wix/bookings";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { redirects } from "@wix/redirects";

const wixClient = createClient({
  modules: { services, availabilityCalendar, bookings, redirects },
  auth: OAuthStrategy({
    clientId: "30e9f47f-67ff-46b9-b9f0-bffcf702080d",
  }),
});

export const WixClientContext = createContext(wixClient);
