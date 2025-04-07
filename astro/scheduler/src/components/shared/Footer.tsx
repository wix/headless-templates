import React from "react";
import Logo from "../Logo";
import { useBrandConfig } from "../../lib/brandConfig";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const { businessName } = useBrandConfig();
  
  return (
    <footer className={`py-8 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 ${className}`}>
      <div className="max-w-7xl mx-auto text-center">
        <Logo size="sm" className="mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;