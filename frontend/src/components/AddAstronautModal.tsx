"use client";

import React, { useState } from "react";
import { X, UserPlus, Heart, Activity, Shield, Sparkles, Loader2 } from "lucide-react";
import { CreateAstronautPayload, RoleType, UserProfile } from "@/types/astrohealth";

interface AddAstronautModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAstronautCreated: (newProfile: UserProfile) => void;
  createAstronautFn: (payload: CreateAstronautPayload) => Promise<{ user: UserProfile }>;
}

export default function AddAstronautModal({
  isOpen,
  onClose,
  onAstronautCreated,
  createAstronautFn,
}: AddAstronautModalProps) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleType>("ASTRONAUT");
  const [hrBpm, setHrBpm] = useState(64);
  const [spo2Pct, setSpo2Pct] = useState(98.5);
  const [sysBp, setSysBp] = useState(118);
  const [diaBp, setDiaBp] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter a callsign or full name.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await createAstronautFn({
        full_name: fullName.trim(),
        role,
        baseline_hr_bpm: hrBpm,
        baseline_spo2_pct: spo2Pct,
        baseline_sys_bp: sysBp,
        baseline_dia_bp: diaBp,
      });
      onAstronautCreated(res.user);
      onClose();
      // Reset form
      setFullName("");
      setRole("ASTRONAUT");
      setHrBpm(64);
      setSpo2Pct(98.5);
      setSysBp(118);
      setDiaBp(75);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to enroll astronaut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-panel max-w-lg w-full rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)] space-y-5 animate-float-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold tracking-widest text-white font-grotesk">
                ENROLL ASTRONAUT
              </h2>
            </div>
            <p className="text-[11px] font-mono text-cyan-400/80 tracking-wide">
              BIO-TELEMETRY MATRIX &bull; ONBOARD CREW ONBOARDING
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-600/50 text-xs text-red-200 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Callsign / Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Callsign / Full Name</span>
              <span className="text-slate-500 text-[10px]">e.g. Major Alex Vance</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter astronaut name or callsign..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-white/[0.1] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-grotesk transition-colors shadow-inner"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider block">
              Mission Role & Permissions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "ASTRONAUT", label: "Astronaut", desc: "Crew / Specialist" },
                  { id: "CMO", label: "CMO", desc: "Medical Officer" },
                  { id: "FLIGHT_SURGEON", label: "Surgeon", desc: "Flight Surgeon" },
                ] as const
              ).map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "bg-slate-900/60 border-white/[0.06] text-slate-400 hover:border-white/[0.15] hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold font-grotesk">{r.label}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Biometric Baseline */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Initial Biometric Baseline (Resting)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* HR */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Resting HR
                  </span>
                  <span className="text-white font-bold">{hrBpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="110"
                  step="1"
                  value={hrBpm}
                  onChange={(e) => setHrBpm(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* SpO2 */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" /> Baseline SpO₂
                  </span>
                  <span className="text-white font-bold">{spo2Pct.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="92.0"
                  max="100.0"
                  step="0.1"
                  value={spo2Pct}
                  onChange={(e) => setSpo2Pct(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Systolic BP */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Systolic BP</span>
                  <span className="text-white font-bold">{sysBp} mmHg</span>
                </div>
                <input
                  type="range"
                  min="95"
                  max="150"
                  step="1"
                  value={sysBp}
                  onChange={(e) => setSysBp(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Diastolic BP */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Diastolic BP</span>
                  <span className="text-white font-bold">{diaBp} mmHg</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={diaBp}
                  onChange={(e) => setDiaBp(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-grotesk tracking-wider transition-all shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ENROLLING CREW...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  ENROLL ASTRONAUT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
