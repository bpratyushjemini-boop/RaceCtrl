"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface DataPack {
  id: string;
  name: string;
  desc: string;
  size: string;
}

const PACKS: DataPack[] = [
  { id: "drivers", name: "Driver Profiles & Bio Database", desc: "Full statistics records for grid entrants since 1950", size: "12.4 MB" },
  { id: "circuits", name: "Circuit Details & SVG Vector Maps", desc: "Aerodynamic layout telemetry path files", size: "44.8 MB" },
  { id: "archives", name: "Season History Standings Archive", desc: "Detailed points classification arrays back to 1950", size: "86.2 MB" }
];

export function DownloadManager() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>([]);

  const handleDownload = (packId: string) => {
    if (downloadingId) return;
    setDownloadingId(packId);
    setDownloadProgress((prev) => ({ ...prev, [packId]: 0 }));

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setDownloadProgress((prev) => ({ ...prev, [packId]: current }));
      if (current >= 100) {
        clearInterval(interval);
        setDownloadedPacks((prev) => [...prev, packId]);
        setDownloadingId(null);
      }
    }, 200);
  };

  const handleDelete = (packId: string) => {
    setDownloadedPacks((prev) => prev.filter((id) => id !== packId));
    setDownloadProgress((prev) => {
      const copy = { ...prev };
      delete copy[packId];
      return copy;
    });
  };

  const totalUsed = downloadedPacks.reduce((acc, id) => {
    const pack = PACKS.find((p) => p.id === id);
    if (pack) {
      const sizeVal = parseFloat(pack.size);
      return acc + sizeVal;
    }
    return acc;
  }, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex items-center justify-between border-b border-outline/10 pb-2">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Offline Cache
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              F1 Database Packs
            </h3>
          </div>
          <span className="text-[9px] font-mono text-on-surface-variant font-bold uppercase bg-surface-2 px-2.5 py-0.5 rounded border border-outline/10 select-none">
            TOTAL OFFLINE SPACE: {totalUsed.toFixed(1)} MB
          </span>
        </div>

        <div className="flex flex-col gap-3 mt-1.5">
          {PACKS.map((pack) => {
            const progress = downloadProgress[pack.id] ?? 0;
            const isDownloaded = downloadedPacks.includes(pack.id);
            const isCurrentlyDownloading = downloadingId === pack.id;

            return (
              <div key={pack.id} className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface-2/30 border border-outline/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[13px] font-black text-on-surface uppercase">{pack.name}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-none font-medium">{pack.desc}</p>
                    <span className="text-[10px] font-mono text-primary font-bold mt-1.5 block uppercase">PACK SIZE: {pack.size}</span>
                  </div>

                  {isDownloaded ? (
                    <button
                      onClick={() => handleDelete(pack.id)}
                      className="h-8 px-3 border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  ) : isCurrentlyDownloading ? (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full border border-primary/20 bg-primary/5 text-primary font-mono text-[9px] font-black leading-none select-none animate-pulse">
                      {progress}%
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(pack.id)}
                      disabled={downloadingId !== null}
                      className="h-8 px-3 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      Download
                    </button>
                  )}
                </div>

                {isCurrentlyDownloading && (
                  <div className="h-1 w-full bg-outline/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
