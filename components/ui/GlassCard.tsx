import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "structural" | "content" | "floating" | "momentary";
  elevation?: "standard" | "elevated";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = "", variant, elevation = "standard", ...props }, ref) => {
    // Resolve variant: explicit variant > elevation mapping > default "content"
    const resolvedVariant = variant || (elevation === "elevated" ? "floating" : "content");
    
    const glassClassMap = {
      structural: "glass-structural",
      content: "glass-content",
      floating: "glass-floating",
      momentary: "glass-momentary",
    } as const;

    const glassClass = glassClassMap[resolvedVariant];

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
