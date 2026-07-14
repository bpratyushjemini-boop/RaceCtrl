import { NextResponse } from "next/server";
import { getRaceSchedule } from "@/lib/api/f1";
import { normalizeSessionCategory } from "@/lib/notifications/preferences";

export async function GET(request: Request) {
  try {
    // 1. Verify CRON_SECRET authorization value if configured
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(request.url);
    const clientSecret = searchParams.get("secret") || request.headers.get("Authorization")?.replace("Bearer ", "");

    if (cronSecret && clientSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Load real RaceCtrl session schedule data
    const schedule = await getRaceSchedule();
    const now = Date.now();

    // 3. Determine sessions entering the configured reminder windows (15, 30, or 60 minutes from now)
    // We allow a small tolerance window (e.g. +/- 5 minutes) to account for cron scheduling variances
    const reminderWindows = [15, 30, 60]; // in minutes
    const toleranceMs = 5 * 60 * 1000; // 5 minutes tolerance

    const incomingAlerts: Array<{
      round: number;
      raceName: string;
      sessionLabel: string;
      sessionCategory: string;
      startTime: string;
      leadTimeMinutes: number;
      tag: string;
    }> = [];

    for (const race of schedule) {
      for (const session of race.sessions) {
        const sessionTime = new Date(`${session.date}T${session.time}`).getTime();
        const diffMs = sessionTime - now;

        // Only look at future sessions
        if (diffMs > 0) {
          for (const minutes of reminderWindows) {
            const targetWindowMs = minutes * 60 * 1000;
            // Check if the session falls within targetWindowMs +/- toleranceMs
            if (Math.abs(diffMs - targetWindowMs) <= toleranceMs) {
              incomingAlerts.push({
                round: race.round,
                raceName: race.raceName,
                sessionLabel: session.label,
                sessionCategory: normalizeSessionCategory(session.label),
                startTime: new Date(sessionTime).toISOString(),
                leadTimeMinutes: minutes,
                // Deterministic deduplication tag/ID
                tag: `race-${race.round}-${session.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${minutes}m`,
              });
            }
          }
        }
      }
    }

    // 4. Report results honestly
    // RaceCtrl currently has no database or push server configured in Next.js to deliver VAPID notifications.
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      matchedSessions: incomingAlerts,
      note: "Durable database subscription store and push relay integration are required to deliver these alerts to clients.",
      productionReady: false,
    });
  } catch (err) {
    console.error("Session reminders cron failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
