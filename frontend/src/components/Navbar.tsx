"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  LogOut,
  ChevronDown,
  Wifi,
  WifiOff,
  Cpu,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ExecutionModeType,
  ScenarioType,
  UserProfile,
  StatusLevelType,
} from "@/types/astrohealth";

type OverallStatusType = StatusLevelType;

interface NavbarProps {
  user: UserProfile | null;
  crew: UserProfile[];
  overallStatus: OverallStatusType;
  wsConnected: boolean;
  aiMode: ExecutionModeType;
  onTriggerScenario: (scenario: ScenarioType) => void;
  onSelectCrew: (member: UserProfile) => void;
  onOpenAddAstronaut: () => void;
  onOpenTraumaModal: () => void;
  onLogout: () => void;
}

const SCENARIOS: { value: ScenarioType; label: string }[] = [
  { value: "NOMINAL_BASELINE", label: "NOMINAL — All Systems Green" },
  { value: "CARDIO_HYPERTENSION", label: "CARDIAC — Hypertension Alert" },
  { value: "SANS_OCULAR_AND_RADIATION_SPIKE", label: "RADIATION — SPE + SANS Spike" },
  { value: "CIRCADIAN_FATIGUE_DRIFT", label: "NEURO — Circadian Fatigue Drift" },
  { value: "STOP", label: "STOP — Halt Simulation" },
];

const STATUS_CONFIG: Record<OverallStatusType, { label: string; dot: string; ring: string }> = {
  GREEN: { label: "GREEN", dot: "bg-emerald-400", ring: "border-emerald-500/50 text-emerald-300" },
  YELLOW: { label: "YELLOW", dot: "bg-amber-400", ring: "border-amber-500/50 text-amber-300" },
  RED: { label: "RED", dot: "bg-red-400", ring: "border-red-500/50 text-red-300" },
};

export default function Navbar({
  user,
  crew,
  overallStatus,
  wsConnected,
  aiMode,
  onTriggerScenario,
  onSelectCrew,
  onOpenAddAstronaut,
  onOpenTraumaModal,
  onLogout,
}: NavbarProps) {
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [crewOpen, setCrewOpen] = useState(false);
  const crewDropdownRef = useRef<HTMLDivElement>(null);
  const scenarioDropdownRef = useRef<HTMLDivElement>(null);

  const cfg = STATUS_CONFIG[overallStatus] ?? STATUS_CONFIG.GREEN;
  const aiOnline = aiMode === "ONLINE_GEMINI";

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        crewDropdownRef.current &&
        !crewDropdownRef.current.contains(event.target as Node)
      ) {
        setCrewOpen(false);
      }
      if (
        scenarioDropdownRef.current &&
        !scenarioDropdownRef.current.contains(event.target as Node)
      ) {
        setScenarioOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex flex-col">
      {/* Main nav HUD */}
      <div className="flex flex-wrap items-center justify-between px-5 py-2.5 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06] gap-3">
        {/* Left: Logo + status badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* SVG logo mark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <circle cx="14" cy="14" r="13" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" />
              <circle cx="14" cy="14" r="8" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" />
              <path d="M14 4 L14 7 M14 21 L14 24 M4 14 L7 14 M21 14 L24 14" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
              <circle cx="14" cy="14" r="3" fill="#06b6d4" fillOpacity="0.8" />
              <ellipse cx="14" cy="14" rx="8" ry="3" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.4" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-white font-grotesk">
              AstroHealth <span className="text-cyan-400">AI</span>
            </span>
          </div>

          {/* Status pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${cfg.ring} bg-slate-950/60`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-status-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
            </span>
            STATUS: {cfg.label}
          </div>

          {/* Telemetry pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${wsConnected ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20" : "border-slate-700 text-slate-400 bg-slate-900/40"}`}>
            {wsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{wsConnected ? "TELEMETRY LIVE" : "TELEMETRY OFFLINE"}</span>
          </div>

          {/* AI mode pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${aiOnline ? "border-cyan-500/40 text-cyan-300 bg-cyan-950/20" : "border-amber-600/40 text-amber-300 bg-amber-950/20"}`}>
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">AI: {aiOnline ? "ONLINE" : "OFFLINE"}</span>
          </div>
        </div>

        {/* Center/Right: Crew Switcher + Add Astronaut Button */}
        <div className="flex items-center gap-2.5">
          {/* Crew Switcher */}
          <div className="relative" ref={crewDropdownRef}>
            <button
              onClick={() => setCrewOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/[0.1] hover:border-cyan-500/40 text-xs font-mono text-slate-200 transition-all shadow-sm"
              title="Switch Active Astronaut"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex items-center gap-1.5 text-left">
                <span className="font-semibold text-white font-grotesk max-w-[130px] truncate">
                  {user ? user.full_name : "Selecting Crew..."}
                </span>
                {user && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 hidden md:inline">
                    {user.role}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${crewOpen ? "rotate-180" : ""}`} />
            </button>

            {crewOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 glass-panel rounded-xl overflow-hidden z-50 shadow-2xl border border-white/[0.12] animate-float-up">
                <div className="px-3.5 py-2 border-b border-white/[0.06] bg-slate-950/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    Onboard Crew Manifest ({crew.length})
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
                  {crew.map((member) => {
                    const isActive = user?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => {
                          onSelectCrew(member);
                          setCrewOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-white/[0.06] transition-colors ${
                          isActive ? "bg-cyan-950/30 text-white" : "text-slate-300"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold font-grotesk truncate text-white">
                              {member.full_name}
                            </span>
                            {isActive && (
                              <UserCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {member.role} &bull; Base HR {member.baseline_hr_bpm} &bull; BP {member.baseline_sys_bp}/{member.baseline_dia_bp}
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                          isActive
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {isActive ? "ACTIVE" : "SELECT"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Glowing Cyan "+ Add Astronaut" Button */}
          <button
            onClick={onOpenAddAstronaut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/50 bg-cyan-950/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold font-grotesk tracking-wide transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] group"
          >
            <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>+ Add Astronaut</span>
          </button>
        </div>

        {/* Far Right: Scenario + Trauma + Logout */}
        <div className="flex items-center gap-2.5">
          {/* Scenario dropdown */}
          <div className="relative" ref={scenarioDropdownRef}>
            <button
              onClick={() => setScenarioOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-xs font-mono text-slate-300 transition-colors"
            >
              <span>Scenario</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${scenarioOpen ? "rotate-180" : ""}`} />
            </button>
            {scenarioOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 glass-panel rounded-xl overflow-hidden z-50 shadow-2xl border border-white/[0.12] animate-float-up">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      onTriggerScenario(s.value);
                      setScenarioOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-mono text-slate-200 hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trauma override button */}
          <button
            onClick={onOpenTraumaModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 border border-red-400/30 text-white text-xs font-bold tracking-wide transition-all shadow-[0_0_16px_rgba(239,68,68,0.35)] hover:shadow-[0_0_24px_rgba(239,68,68,0.5)]"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TRAUMA OVERRIDE</span>
          </button>

          {/* Logout icon */}
          <button
            onClick={onLogout}
            title="Reset Session"
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
