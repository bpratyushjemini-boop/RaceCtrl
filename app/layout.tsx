import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RaceCtrl",
    template: "%s · RaceCtrl",
  },
  description: "A precision Formula 1 companion for race weekends, standings, timing, and personal driver tracking.",
  applicationName: "RaceCtrl",
  appleWebApp: {
    capable: true,
    title: "RaceCtrl",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080809",
  viewportFit: "cover",
};


import { SettingsProvider } from "@/lib/settings-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { OfflineOverlay } from "@/components/ui/OfflineOverlay";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <SettingsProvider>
          <AuthProvider>
            <OfflineOverlay />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}