/** Session state banner — matches the Figma flag/session strip above the leaderboard. */

type BannerVariant = "neutral" | "warning" | "danger" | "info";

const VARIANT_STYLES: Record<
  BannerVariant,
  { bg: string; border: string; dotColor: string; textColor: string }
> = {
  neutral: {
    bg: "bg-surface-2/70",
    border: "border-outline/30",
    dotColor: "bg-on-surface-variant",
    textColor: "text-on-surface-variant",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    dotColor: "bg-warning",
    textColor: "text-warning",
  },
  danger: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    dotColor: "bg-primary",
    textColor: "text-primary",
  },
  info: {
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    dotColor: "bg-secondary",
    textColor: "text-secondary",
  },
};

export function FlagBanner({
  variant = "neutral",
  message,
  icon,
}: {
  variant?: BannerVariant;
  message: string;
  /** Optional SVG icon element to show left of message. */
  icon?: React.ReactNode;
}) {
  const s = VARIANT_STYLES[variant];

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 ${s.bg} border-y ${s.border} backdrop-blur-md`}
    >
      {icon ?? (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dotColor} ${variant === "warning" || variant === "info" || variant === "danger" ? "animate-pulse" : ""}`}
        />
      )}
      <span
        className={`text-[11px] font-bold tracking-widest uppercase ${s.textColor}`}
      >
        {message}
      </span>
    </div>
  );
}
