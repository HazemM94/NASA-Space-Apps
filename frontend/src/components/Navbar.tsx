"use client";

import React from "react";
import {
  ShieldAlert,
  AlertOctagon,
  Wifi,
  WifiOff,
  LogOut,
  Sliders,
} from "lucide-react";
import {
  ExecutionModeType,
  ScenarioType,
  StatusLevelType,
  UserProfile,
} from "@/types/astrohealth";

interface NavbarProps {
  user: UserProfile | null;
  overallStatus: StatusLevelType;
  wsConnected: boolean;
  aiMode: ExecutionModeType;
  onTriggerScenario: (scenario: ScenarioType) => Promise<void>;
  onOpenTraumaModal: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  overallStatus,
  wsConnected,
  aiMode,
  onTriggerScenario,
  onOpenTraumaModal,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      {/* Persistent Regulatory Medical Prototype Disclaimer Banner */}
      <div className="bg-amber-950/90 border-b border-amber-700/80 px-4 py-1.5 text-center text-[11px] font-mono text-amber-200 flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          CLINICAL DECISION-SUPPORT PROTOTYPE — SYNTHETIC DEMO DATA ONLY — NOT A
          CERTIFIED MEDICAL DEVICE
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
              overallStatus === "RED"
                ? "bg-red-600 text-white animate-pulse"
                : overallStatus === "YELLOW"
                ? "bg-amber-400 text-slate-950"
                : "bg-emerald-500 text-slate-950"
            }`}
          >
            STATUS: {overallStatus}
          </span>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              AstroHealth AI Console
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {user ? `${user.full_name} [${user.role}]` : "Unauthenticated"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* WebSocket Stream Status */}
          <span
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
              wsConnected
                ? "bg-slate-900 border-emerald-700 text-emerald-300"
                : "bg-slate-900 border-rose-700 text-rose-300"
            }`}
          >
            {wsConnected ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            {wsConnected ? "TELEMETRY LIVE (2s)" : "WS OFFLINE"}
          </span>

          {/* AI Engine Mode Badge */}
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
            AI: {aiMode}
          </span>

          {/* Golden Scenario Injector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <select
              aria-label="Inject Golden Spaceflight Scenario"
              defaultValue="NOMINAL_BASELINE"
              onChange={(e) =>
                onTriggerScenario(e.target.value as ScenarioType)
              }
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            >
              <option value="NOMINAL_BASELINE" className="bg-slate-900">
                Scenario: Nominal Baseline (GREEN)
              </option>
              <option
                value="SANS_OCULAR_AND_RADIATION_SPIKE"
                className="bg-slate-900"
              >
                Scenario: SANS + Radiation Spike (4 YELLOW)
              </option>
              <option value="CIRCADIAN_FATIGUE_DRIFT" className="bg-slate-900">
                Scenario: Circadian Fatigue Drift (3 YELLOW)
              </option>
              <option value="CARDIO_HYPERTENSION" className="bg-slate-900">
                Scenario: Cardio Hypertension (RED Escalation)
              </option>
              <option value="STOP" className="bg-slate-900">
                Scenario: Pause Simulator (STOP)
              </option>
            </select>
          </div>

          {/* Persistent Zero-Latency Red Button */}
          <button
            type="button"
            onClick={onOpenTraumaModal}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-red-900/50"
          >
            <AlertOctagon className="w-4 h-4" />
            TRAUMA OVERRIDE
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
