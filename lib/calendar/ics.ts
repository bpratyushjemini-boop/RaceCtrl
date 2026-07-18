"use client";

interface SessionEvent {
  label: string;
  date: string;
  time: string;
}

export function downloadCalendarIcs(raceName: string, sessions: SessionEvent[]) {
  if (typeof window === "undefined") return;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RaceCtrl//Formula 1 Calendar Sync//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  sessions.forEach((s) => {
    try {
      // Date formatting for .ics: YYYYMMDDTHHMMSSZ
      // Clean up inputs (date: "2026-03-14", time: "15:00:00Z")
      const rawDateStr = `${s.date}T${s.time.includes("Z") ? s.time : s.time + "Z"}`;
      const startDate = new Date(rawDateStr);
      
      if (isNaN(startDate.getTime())) return;

      const formatICSDate = (d: Date) => {
        return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const startStr = formatICSDate(startDate);
      // Assume 90 minutes duration for all sessions
      const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
      const endStr = formatICSDate(endDate);

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:session-${s.label.toLowerCase().replace(/\s+/g, "-")}-${startDate.getTime()}@racectrl.com`);
      lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
      lines.push(`DTSTART:${startStr}`);
      lines.push(`DTEND:${endStr}`);
      lines.push(`SUMMARY:F1 ${raceName} - ${s.label}`);
      lines.push(`DESCRIPTION:Formula 1 weekend session tracker for ${s.label}. Sync automatically with RaceCtrl.`);
      lines.push(`LOCATION:${raceName}`);
      lines.push("END:VEVENT");
    } catch (e) {
      console.error("Failed to build event details for ICS:", e);
    }
  });

  lines.push("END:VCALENDAR");

  try {
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const sanitizedName = raceName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    link.download = `f1_${sanitizedName}_schedule.ics`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to trigger ICS download:", err);
  }
}
