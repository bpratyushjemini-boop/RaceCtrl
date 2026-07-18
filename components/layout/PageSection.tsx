import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  action,
  children,
  className = "",
}: PageSectionProps) {
  return (
    <section className={`flex flex-col gap-3.5 ${className}`}>
      {(title || description || action) && (
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </section>
  );
}
