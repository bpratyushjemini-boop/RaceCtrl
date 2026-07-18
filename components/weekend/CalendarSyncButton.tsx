"use client";

import { downloadCalendarIcs } from "@/lib/calendar/ics";

interface SessionEvent {
  label: string;
  date: string;
  time: string;
}

interface CalendarSyncButtonProps {
  raceName: string;
  sessions: SessionEvent[];
}

export function CalendarSyncButton({ raceName, sessions }: CalendarSyncButtonProps) {
  return (
    <button
      onClick={() => downloadCalendarIcs(raceName, sessions)}
      className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/45 px-2.5 py-1 rounded text-[10px] font-bold text-primary uppercase cursor-pointer transition-all tracking-wider active:scale-95 duration-100 select-none"
      title="Download iCalendar file (.ics) to sync with Google, Apple, or Outlook"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>Sync Calendar</span>
    </button>
  );
}
