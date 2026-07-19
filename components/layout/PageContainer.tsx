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
    <div className={`mx-auto w-full max-w-5xl px-4 sm:px-5 md:px-6 flex flex-col ${gapClasses[gap]} pb-12 ${className}`}>
      {children}
    </div>
  );
}
