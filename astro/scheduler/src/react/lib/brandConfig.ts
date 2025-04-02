
import { createContext, useContext } from "react";

export type BrandConfig = {
  businessName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

// Default branding configuration
export const defaultBrandConfig: BrandConfig = {
  businessName: "Scheduler",
  logoUrl: "/logo.svg", // Default logo path
  primaryColor: "hsl(212, 82%, 45%)", // Primary blue
  secondaryColor: "hsl(277, 75%, 84%)", // Soft purple
  accentColor: "hsl(22, 90%, 57%)", // Warm orange
};

export const BrandConfigContext = createContext<BrandConfig>(defaultBrandConfig);

export const useBrandConfig = () => useContext(BrandConfigContext);
