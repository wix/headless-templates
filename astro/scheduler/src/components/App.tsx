import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BrandingProvider from "./BrandingProvider";
import { WixClientContext } from "./WixClientContext";
import { BookingProvider } from "../hooks/use-booking";
import type { ReactNode } from "react";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { availabilityCalendar, services, bookings } from "@wix/bookings";
import { redirects } from "@wix/redirects";

const queryClient = new QueryClient();

// Example brand configuration
const brandConfig = {
  businessName: "Acme Consulting",
  logoUrl: "", // Using default icon
  primaryColor: "hsl(212, 82%, 45%)",
  secondaryColor: "hsl(277, 75%, 84%)",
  accentColor: "hsl(22, 90%, 57%)",
};

// Create Wix client
const wixClient = createClient({
  modules: { services, availabilityCalendar, bookings, redirects },
  auth: OAuthStrategy({
    clientId: "30e9f47f-67ff-46b9-b9f0-bffcf702080d",
  }),
});

const App = ({ children }: { children?: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrandingProvider initialConfig={brandConfig}>
        <WixClientContext.Provider value={wixClient}>
          <BookingProvider>
            <Toaster />
            <Sonner />
            {children}
          </BookingProvider>
        </WixClientContext.Provider>
      </BrandingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;