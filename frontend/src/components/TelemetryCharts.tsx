"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Shield, Moon, HeartPulse } from "lucide-react";
import { TelemetryReading } from "@/types/astrohealth";

interface TelemetryChartsProps {
  readings: TelemetryReading[];
}

export default function TelemetryCharts({ readings }: TelemetryChartsProps) {
  const latest = readings[readings.length - 1];

  const chartData = readings.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    hr: r.heart_rate_bpm,
    sys: r.systolic_bp_mmhg,
    dia: r.diastolic_bp_mmhg,
    spo2: r.spo2_pct,
    rad: r.radiation_msv,
    sleep: r.sleep_score,
    fatigue: Math.round(r.eeg_fatigue_index * 100),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Heart Rate & BP</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {latest ? `${latest.heart_rate_bpm} BPM` : "--"}{" "}
            <span className="text-xs text-slate-400">
              ({latest ? `${latest.systolic_bp_mmhg}/${latest.diastolic_bp_mmhg}` : "--"})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SpO2 & Core Temp</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {latest ? `${latest.spo2_pct.toFixed(1)}%` : "--"}{" "}
            <span className="text-xs text-slate-400">
              ({latest ? `${latest.core_temp_c.toFixed(1)}°C` : "--"})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Shielded Habitat Dosimeter</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {latest ? `${latest.radiation_msv.toFixed(2)} mSv/d` : "--"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sleep & fNIRS Fatigue</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1 text-lg font-bold text-white font-mono">
            {latest ? `Sleep ${latest.sleep_score}` : "--"}{" "}
            <span className="text-xs text-slate-400">
              (Fatigue {latest ? `${Math.round(latest.eeg_fatigue_index * 100)}%` : "--"})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 h-56">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Cardiovascular Stream (HR & Systolic BP)
          </h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[40, 200]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="hr"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Heart Rate (BPM)"
              />
              <Line
                type="monotone"
                dataKey="sys"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Systolic BP (mmHg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 h-56">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Circadian Sleep Score & Cognitive Fatigue (%)
          </h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="Actiwatch Sleep Score"
              />
              <Line
                type="monotone"
                dataKey="fatigue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name="fNIRS Fatigue (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
