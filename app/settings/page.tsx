export const revalidate = 300;

export default function SettingsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <h1 className="text-[22px] font-semibold tracking-tight text-text">Settings</h1>
      <p className="text-[15px] text-text-dim">
        This section will contain app settings and personalization options.
      </p>
    </div>
  );
}
