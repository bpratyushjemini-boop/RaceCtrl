"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ApiKey {
  key: string;
  created: string;
  scope: string;
}

export function DevCenter() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("https://api.my-domain.com/v1/f1-receiver");
  const [docTab, setDocTab] = useState<"drivers" | "standings" | "webhooks">("drivers");

  // Load keys on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("racectrl_api_keys");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            setKeys(parsed);
          }, 0);
        } catch (e) {
          console.warn("Failed to load keys", e);
        }
      }
    }
  }, []);

  const generateKey = () => {
    const newKey: ApiKey = {
      key: `rc_live_proj_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      created: new Date().toLocaleDateString(),
      scope: "Read-Only"
    };

    setKeys((prev) => {
      const updated = [newKey, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("racectrl_api_keys", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteKey = (keyString: string) => {
    setKeys((prev) => {
      const updated = prev.filter((k) => k.key !== keyString);
      if (typeof window !== "undefined") {
        localStorage.setItem("racectrl_api_keys", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* API Key Manager Card */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Developer Platform
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              API Keys Coordinator
            </h3>
          </div>

          <button
            onClick={generateKey}
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary-variant transition-all cursor-pointer"
          >
            Generate Pro Key
          </button>
        </div>

        {/* Keys listing */}
        <div className="flex flex-col gap-2 border-t border-outline/10 pt-3 select-none font-mono text-[12px]">
          <span className="text-[9px] font-black text-on-surface-variant/60 uppercase font-mono mb-1">Active Credentials</span>
          {keys.length === 0 ? (
            <p className="text-[12px] italic text-on-surface-variant font-sans py-4 text-center">
              No developer keys registered. Click the button above to generate a client credential token.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {keys.map((k) => (
                <div
                  key={k.key}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2/40 border border-outline/10"
                >
                  <div className="min-w-0">
                    <span className="text-primary font-bold block truncate max-w-[200px] md:max-w-xs">{k.key}</span>
                    <span className="text-[9px] text-on-surface-variant/65 uppercase font-mono block mt-0.5">
                      Created: {k.created} · Scope: {k.scope}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteKey(k.key)}
                    className="h-6 px-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase cursor-pointer hover:bg-red-500/20 transition-all"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Webhooks configuration */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            Automation Webhooks
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Real-time Telemetry Webhooks
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10.5px] font-bold text-on-surface-variant uppercase font-mono">Receiver Endpoint URL:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-mono py-2 px-3 rounded-xl border border-outline/35 focus:outline-none"
            />
            <button
              onClick={() => alert("Simulated: Webhook listener registered successfully.")}
              className="h-9 px-4 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all hover:bg-primary-variant"
            >
              Register
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Structured API Documentation */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex justify-between items-start border-b border-outline/10 pb-2 select-none">
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
              SDK & API
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              Interactive Endpoint Docs
            </h3>
          </div>

          <div className="flex bg-surface-2/60 border border-outline/25 rounded-full p-0.5 gap-0.5">
            {["drivers", "standings", "webhooks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setDocTab(tab as "drivers" | "standings" | "webhooks")}
                className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                  docTab === tab ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Documentation details */}
        {docTab === "drivers" && (
          <div className="flex flex-col gap-3 font-mono text-[12.5px] leading-relaxed">
            <div className="flex gap-2 items-center">
              <span className="bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold">GET</span>
              <span className="text-on-surface">/v1/drivers</span>
            </div>
            <p className="text-[12px] text-on-surface-variant font-sans font-medium">
              Returns list of active drivers, nationality profile details, and constructor assignments.
            </p>
            <pre className="p-3.5 bg-surface-2/40 border border-outline/10 rounded-xl text-[10.5px] text-on-surface-variant/80 overflow-x-auto">
{`{
  "status": "success",
  "data": [
    { "id": "max_verstappen", "code": "VER", "team": "Red Bull" }
  ]
}`}
            </pre>
          </div>
        )}

        {docTab === "standings" && (
          <div className="flex flex-col gap-3 font-mono text-[12.5px] leading-relaxed">
            <div className="flex gap-2 items-center">
              <span className="bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold">GET</span>
              <span className="text-on-surface">/v1/championships/standings</span>
            </div>
            <p className="text-[12px] text-on-surface-variant font-sans font-medium">
              Returns live driver and constructors standing points grids filterable by series parameters.
            </p>
            <pre className="p-3.5 bg-surface-2/40 border border-outline/10 rounded-xl text-[10.5px] text-on-surface-variant/80 overflow-x-auto">
{`{
  "status": "success",
  "championship": "f1",
  "points": [
    { "position": 1, "points": 255, "wins": 7 }
  ]
}`}
            </pre>
          </div>
        )}

        {docTab === "webhooks" && (
          <div className="flex flex-col gap-3 font-mono text-[12.5px] leading-relaxed">
            <div className="flex gap-2 items-center">
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold">POST</span>
              <span className="text-on-surface-variant/60">Webhook payload</span>
            </div>
            <p className="text-[12px] text-on-surface-variant font-sans font-medium">
              Webhook triggers dispatched on track limit warnings, SC deployment phases, and sector fastest-lap indicators.
            </p>
            <pre className="p-3.5 bg-surface-2/40 border border-outline/10 rounded-xl text-[10.5px] text-on-surface-variant/80 overflow-x-auto">
{`{
  "event": "safety_car",
  "round": 12,
  "lap": 18,
  "status": "DEPLOYED"
}`}
            </pre>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
