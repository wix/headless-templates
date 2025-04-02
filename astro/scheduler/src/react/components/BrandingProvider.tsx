import React, { useState, useEffect } from "react";
import {
  BrandConfigContext,
  BrandConfig,
  defaultBrandConfig,
} from "../lib/brandConfig";

interface BrandingProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<BrandConfig>;
}

const BrandingProvider: React.FC<BrandingProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    ...defaultBrandConfig,
    ...initialConfig,
  });

  // Apply CSS variables for colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary-color", brandConfig.primaryColor);
    root.style.setProperty("--secondary-color", brandConfig.secondaryColor);
    root.style.setProperty("--accent-color", brandConfig.accentColor);
  }, [brandConfig]);

  return (
    <BrandConfigContext.Provider value={brandConfig}>
      {children}
    </BrandConfigContext.Provider>
  );
};

export default BrandingProvider;
