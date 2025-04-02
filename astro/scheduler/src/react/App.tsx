// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import Schedule from "./pages/Schedule";
// import Confirmation from "./pages/Confirmation";
// import NotFound from "./pages/NotFound";
// import BrandingProvider from "./components/BrandingProvider";

// const queryClient = new QueryClient();

// // Example brand configuration
// const brandConfig = {
//   businessName: "Acme Consulting",
//   logoUrl: "", // Using default icon
//   primaryColor: "hsl(212, 82%, 45%)",
//   secondaryColor: "hsl(277, 75%, 84%)",
//   accentColor: "hsl(22, 90%, 57%)",
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <BrandingProvider initialConfig={brandConfig}>
//         <Toaster />
//         <Sonner />
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Index />} />
//             <Route path="/schedule" element={<Schedule />} />
//             <Route path="/confirmation" element={<Confirmation />} />
//             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </BrandingProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}

export default App;
