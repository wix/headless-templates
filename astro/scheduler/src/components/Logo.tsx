import React from "react";
import { useBrandConfig } from "../lib/brandConfig";
import { Calendar } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className }) => {
  const { businessName, logoUrl } = useBrandConfig();

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${businessName} logo`}
          className={`${sizeClasses[size]}`}
        />
      ) : (
        <Calendar className={`${sizeClasses[size]} text-primary`} />
      )}
      <span
        className={`font-semibold ${size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base"}`}
      >
        {businessName}
      </span>
    </div>
  );
};

export default Logo;
