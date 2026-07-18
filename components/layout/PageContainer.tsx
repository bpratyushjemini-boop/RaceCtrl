import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  gap?: "none" | "sm" | "md" | "lg";
}

export function PageContainer({ children, className = "", gap = "md" }: PageContainerProps) {
  const gapClasses = {
    none: "",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={`mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8 flex flex-col ${gapClasses[gap]} pb-12 ${className}`}>
      {children}
    </div>
  );
}
