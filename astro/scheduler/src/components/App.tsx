import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";
import { TooltipProvider } from "./ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BrandingProvider from "./BrandingProvider";
import type { ReactNode } from "react";
import { availabilityCalendar, services } from "@wix/bookings";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { WixClientContext } from "./WixClientContext";

const queryClient = new QueryClient();

// Example brand configuration
const brandConfig = {
  businessName: "Acme Consulting",
  logoUrl: "", // Using default icon
  primaryColor: "hsl(212, 82%, 45%)",
  secondaryColor: "hsl(277, 75%, 84%)",
  accentColor: "hsl(22, 90%, 57%)",
};

const App = ({ children }: { children?: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrandingProvider initialConfig={brandConfig}>
        <Toaster />
        <Sonner />
        {children}
      </BrandingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
