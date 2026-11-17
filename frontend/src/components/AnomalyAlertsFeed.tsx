"use client";

import React from "react";
import { BellRing, Check, AlertOctagon } from "lucide-react";
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
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-3.5 h-3.5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white font-grotesk">
            Proactive Alerts
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/[0.06] text-slate-300 tabular-nums">
          {alerts.length} Active
        </span>
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center">
            <AlertOctagon className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-[11px] text-slate-500 font-mono leading-relaxed max-w-[200px]">
            All biometric windows within nominal crew baseline
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
          {alerts.map((alert) => {
            const isRed = alert.severity === "RED";
            const accentBg = isRed ? "bg-red-500" : "bg-amber-400";
            return (
              <div
                key={alert.id}
                className="relative flex gap-0 overflow-hidden rounded-lg border border-white/[0.06] bg-slate-900/60"
              >
                {/* Left accent bar */}
                <div className={`w-1 shrink-0 ${accentBg}`} style={{ opacity: 0.9 }} />

                <div className="flex-1 p-3 space-y-1.5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isRed
                            ? "bg-red-950/80 text-red-300 border border-red-700/50"
                            : "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {alert.body_region}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-grotesk leading-tight">
                        {alert.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAcknowledge(alert.id)}
                      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/[0.06] text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      <Check className="w-2.5 h-2.5" />
                      Ack
                    </button>
                  </div>

                  {/* Body text */}
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {alert.micro_intervention}
                  </p>

                  {/* Source */}
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 pt-0.5 border-t border-white/[0.04]">
                    <span>Source: AstroHealth</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
