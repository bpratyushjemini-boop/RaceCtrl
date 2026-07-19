"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "inactive";
  action: string;
}

const DEFAULT_TASKS: AutomationTask[] = [
  { id: "daily_brief", name: "Daily Paddock Briefing Digest", schedule: "Every morning @ 08:00 UTC", status: "active", action: "Email Brief & Discord Webhook" },
  { id: "race_alerts", name: "Safety Car & Red Flag Webhooks", schedule: "Real-time during active sessions", status: "active", action: "Trigger Registered Webhooks" },
  { id: "post_race_telemetry", name: "Post-Session Telemetry Report", schedule: "10 mins after checkered flag", status: "inactive", action: "Export CSV and send to Slack" }
];

export function AutomationEngine() {
  const [tasks, setTasks] = useState<AutomationTask[]>(DEFAULT_TASKS);

  // Load automation tasks from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("racectrl_automation_tasks");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            setTasks(parsed);
          }, 0);
        } catch (e) {
          console.warn("Failed to load tasks", e);
        }
      }
    }
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status: (t.status === "active" ? "inactive" : "active") as "active" | "inactive" } : t));
      if (typeof window !== "undefined") {
        localStorage.setItem("racectrl_automation_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const createTask = () => {
    const newTask: AutomationTask = {
      id: `task_${Date.now()}`,
      name: "Custom Triggered Pacing Report",
      schedule: "Every Sunday @ 20:00 UTC",
      status: "active",
      action: "Export visual PDF report"
    };

    setTasks((prev) => {
      const updated = [...prev, newTask];
      if (typeof window !== "undefined") {
        localStorage.setItem("racectrl_automation_tasks", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Process Scheduler
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              Automation Engine Rules
            </h3>
          </div>

          <button
            onClick={createTask}
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary-variant transition-all cursor-pointer"
          >
            Create Task Rule
          </button>
        </div>

        {/* Task lists */}
        <div className="flex flex-col gap-2.5 border-t border-outline/10 pt-3 select-none">
          <span className="text-[9px] font-black text-on-surface-variant/60 uppercase font-mono mb-1">Scheduled Processes</span>
          <div className="flex flex-col gap-2.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2/40 border border-outline/10 text-[12.5px]"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-on-surface truncate block">{t.name}</span>
                  <span className="text-[9.5px] text-on-surface-variant font-mono font-bold uppercase mt-0.5 block truncate">
                    Cron: {t.schedule} · Action: {t.action}
                  </span>
                </div>
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`h-7 px-3.5 rounded-xl border text-[10.5px] font-black uppercase transition-all cursor-pointer ${
                    t.status === "active"
                      ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20"
                      : "bg-surface-2 border-outline/20 text-on-surface-variant/50 hover:bg-surface-3"
                  }`}
                >
                  {t.status === "active" ? "ACTIVE" : "PAUSED"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
