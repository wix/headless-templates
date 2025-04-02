
import React from "react";
import { cn } from "@/lib/utils";

type AnimationVariant = "fade-up" | "scale-in" | "slide-in-right" | "fade-in";

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: AnimationVariant;
  delay?: "100" | "200" | "300" | "400" | "500";
  className?: string;
  id?: string; // Added id prop to fix the error
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = "fade-up",
  delay,
  className,
  id,
}) => {
  return (
    <div
      id={id}
      className={cn(
        `animate-${animation}`,
        delay && `delay-${delay}`,
        "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
