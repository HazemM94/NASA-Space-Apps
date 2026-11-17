"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { HeartPulse, Moon, Shield } from "lucide-react";
import { TelemetryReading } from "@/types/astrohealth";

interface TelemetryChartsProps {
  readings: TelemetryReading[];
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0a1628",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#e2e8f0",
  fontFamily: "var(--font-mono)",
};

export default function TelemetryCharts({ readings }: TelemetryChartsProps) {
  const chartData = readings.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    hr: r.heart_rate_bpm,
    sys: r.systolic_bp_mmhg,
    sleep: r.sleep_score,
    fatigue: Math.round(r.eeg_fatigue_index * 100),
    rad: parseFloat(r.radiation_msv.toFixed(2)),
  }));

  const charts = [
    {
      title: "Heart Rate and BP",
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" />,
      lines: [
        { key: "hr",  color: "#ef4444", name: "HR (bpm)", gradient: "hrGrad"  },
        { key: "sys", color: "#06b6d4", name: "Sys BP",   gradient: "sysGrad" },
      ],
      domain: [40, 200] as [number, number],
    },
    {
      title: "Sleep and Fatigue",
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      lines: [
        { key: "sleep",   color: "#818cf8", name: "Sleep Score", gradient: "sleepGrad"   },
        { key: "fatigue", color: "#f59e0b", name: "Fatigue %",   gradient: "fatigueGrad" },
      ],
      domain: [0, 100] as [number, number],
    },
    {
      title: "Radiation",
      icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
      lines: [
        { key: "rad", color: "#f59e0b", name: "mSv/d", gradient: "radGrad" },
      ],
      domain: [0, 4] as [number, number],
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {charts.map((chart) => (
        <div
          key={chart.title}
          className="glass-panel rounded-xl p-3 flex flex-col gap-2"
        >
          {/* Chart header */}
          <div className="flex items-center gap-1.5">
            {chart.icon}
            <h4 className="text-[11px] font-semibold text-slate-300 font-grotesk">
              {chart.title}
            </h4>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2">
            {chart.lines.map((l) => (
              <div key={l.key} className="flex items-center gap-1">
                <span
                  className="w-3 h-0.5 rounded"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-[9px] font-mono text-slate-500">
                  {l.name}
                </span>
              </div>
            ))}
          </div>

          {/* Area chart */}
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -32, bottom: 0 }}>
                <defs>
                  {chart.lines.map((l) => (
                    <linearGradient
                      key={l.gradient}
                      id={l.gradient}
                      x1="0" y1="0" x2="0" y2="1"
                    >
                      <stop offset="5%"  stopColor={l.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={l.color} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={chart.domain} stroke="transparent" tick={{ fill: "#475569", fontSize: 9 }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: "#94a3b8" }}
                  labelStyle={{ color: "#64748b", fontSize: 9 }}
                />
                {chart.lines.map((l) => (
                  <Area
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={l.color}
                    strokeWidth={1.5}
                    fill={`url(#${l.gradient})`}
                    dot={false}
                    isAnimationActive={false}
                    name={l.name}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
