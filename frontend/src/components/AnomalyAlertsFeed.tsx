"use client";

import React from "react";
import { BellRing, Check, BookOpen } from "lucide-react";
import { AnomalyAlert } from "@/types/astrohealth";

interface AnomalyAlertsFeedProps {
  alerts: AnomalyAlert[];
  onAcknowledge: (alertId: string) => Promise<void>;
}

export default function AnomalyAlertsFeed({
  alerts,
  onAcknowledge,
}: AnomalyAlertsFeedProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Proactive Anomaly Micro-Interventions
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {alerts.length} Active
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-lg border border-slate-800/60">
          All rolling 5-packet biometric windows are within nominal crew baseline.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border ${
                alert.severity === "RED"
                  ? "bg-red-950/50 border-red-600"
                  : "bg-amber-950/40 border-amber-600/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mr-2 ${
                      alert.severity === "RED"
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {alert.severity} • {alert.body_region}
                  </span>
                  <h4 className="text-xs font-bold text-white inline">
                    {alert.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  Ack
                </button>
              </div>

              <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                {alert.micro_intervention}
              </p>

              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{alert.citation_source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
