import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";
import AnimatedContainer from "./AnimatedContainer";

interface PanelProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-down" | "scale-in" | "slide-in";
  delay?: "0" | "100" | "200" | "300" | "400" | "500";
  icon?: ReactNode;
  title?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

const Panel: React.FC<PanelProps> = ({
  children,
  className,
  animation = "fade-up",
  delay = "0",
  icon,
  title,
  emptyMessage,
  isEmpty = false,
}) => {
  if (isEmpty && emptyMessage) {
    return (
      <div className={cn("glass-panel p-6 text-center", className)}>
        {icon && <div className="w-6 h-6 mx-auto mb-2 text-muted-foreground">{icon}</div>}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("glass-panel", className)}>
      <div className="p-6">
        {title && (
          <AnimatedContainer animation={animation} delay={delay}>
            <h3 className="text-base font-medium mb-4">{title}</h3>
          </AnimatedContainer>
        )}
        {children}
      </div>
    </div>
  );
};

export default Panel;