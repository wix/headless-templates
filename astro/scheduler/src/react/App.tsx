import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
import BrandingProvider from "./components/BrandingProvider";

const queryClient = new QueryClient();

// Example brand configuration
const brandConfig = {
  businessName: "Acme Consulting",
  logoUrl: "", // Using default icon
  primaryColor: "hsl(212, 82%, 45%)",
  secondaryColor: "hsl(277, 75%, 84%)",
  accentColor: "hsl(22, 90%, 57%)",
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrandingProvider initialConfig={brandConfig}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/confirmation" element={<Confirmation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BrandingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
