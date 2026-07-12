import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "structural" | "floating" | "momentary";
  elevation?: "standard" | "elevated";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = "", variant, elevation = "standard", ...props }, ref) => {
    // Resolve variant from explicit variant or elevation mapping
    const resolvedVariant = variant || (elevation === "elevated" ? "floating" : "structural");
    
    let glassClass = "glass-structural";
    if (resolvedVariant === "floating") {
      glassClass = "glass-floating";
    } else if (resolvedVariant === "momentary") {
      glassClass = "glass-momentary";
    }

    return (
      <div
        ref={ref}
        className={`${glassClass} rounded-md text-on-surface ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
