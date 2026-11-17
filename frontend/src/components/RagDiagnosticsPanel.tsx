"use client";

import React, { useState } from "react";
import { Stethoscope, Send, FileText, Info, ChevronRight } from "lucide-react";
import { BodyRegionType, DiagnosticConsultation } from "@/types/astrohealth";

interface RagDiagnosticsPanelProps {
  selectedRegion: BodyRegionType;
  consultations: DiagnosticConsultation[];
  onSubmitConsultation: (
    region: BodyRegionType,
    query: string,
    voiceStress: number
  ) => Promise<void>;
}

const CANNED_DEMO_QUERIES: Record<BodyRegionType, string> = {
  OCULAR_EYES:
    "My eyes feel blurry when reading panels over the past 4 days with mild retro-orbital headache.",
  BRAIN_NEURO:
    "Experiencing fragmented sleep below 6 hours, daytime drowsiness, and cognitive fatigue.",
  SYSTEMIC:
    "Habitat radiation dosimeter spiked above 1.8 mSv/day with mild nausea and systemic fatigue.",
  CARDIOVASCULAR:
    "Noticeable resting palpitations and elevated blood pressure after microgravity fluid shift.",
  MUSCULOSKELETAL:
    "Lower back stiffness and leg muscle soreness after resistive exercise session.",
  GASTROINTESTINAL:
    "Mild appetite reduction and slower gastric motility during transit.",
};

const REGION_LABEL: Record<BodyRegionType, string> = {
  OCULAR_EYES: "Ocular",
  BRAIN_NEURO: "Brain",
  SYSTEMIC: "Systemic",
  CARDIOVASCULAR: "Cardio",
  MUSCULOSKELETAL: "Musculo",
  GASTROINTESTINAL: "GI",
};

export default function RagDiagnosticsPanel({
  selectedRegion,
  consultations,
  onSubmitConsultation,
}: RagDiagnosticsPanelProps) {
  const [query, setQuery] = useState(CANNED_DEMO_QUERIES[selectedRegion]);
  const [voiceStress, setVoiceStress] = useState<number>(0.35);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadPreset = () => {
    setQuery(CANNED_DEMO_QUERIES[selectedRegion]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmitConsultation(selectedRegion, query, voiceStress);
    } catch (err: unknown) {
      setError((err as Error).message || "Consultation request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const latest = consultations[0];

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-white font-grotesk">
            Clinical Consultation
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300">
            {REGION_LABEL[selectedRegion]}
          </span>
          <button
            type="button"
            onClick={handleLoadPreset}
            className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            Load sample
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">
            Symptom
          </label>
          <textarea
            rows={2}
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Symptom text the sympton from..."
            className="w-full p-2.5 rounded-lg bg-slate-950/80 border border-white/[0.08] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none font-grotesk"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-[10px] font-mono text-slate-400 shrink-0">
              Voice stress
            </label>
            <div className="flex-1 relative">
              <div className="h-0.5 rounded-full bg-slate-800 relative">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                  style={{ width: `${voiceStress * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceStress}
                onChange={(e) => setVoiceStress(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-4 -top-1.5"
              />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 tabular-nums w-8 text-right">
              {(voiceStress * 100).toFixed(0)}%
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {submitting ? (
              <span className="animate-pulse-slow">Synthesizing...</span>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Run Assessment
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-700/50 text-xs text-red-200 font-mono">
          {error}
        </div>
      )}

      {/* Result card */}
      {latest && (
        <div className="rounded-xl bg-slate-950/70 border border-white/[0.06] overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  latest.execution_mode === "ONLINE_GEMINI"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/40"
                    : latest.execution_mode === "OFFLINE_FALLBACK"
                    ? "bg-amber-950/80 text-amber-300 border border-amber-700/40"
                    : "bg-rose-950/80 text-rose-300 border border-rose-700/40"
                }`}
              >
                MODE: {latest.execution_mode === "ONLINE_GEMINI" ? "ONLINE" : "OFFLINE"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Protocol Retrieval Match{" "}
                <span className="text-cyan-300 font-semibold">
                  {Math.round(latest.confidence_score * 100)}%
                </span>
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </div>

          {/* AI summary */}
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-slate-200 leading-relaxed">
              {latest.ai_diagnosis}
            </p>
          </div>

          {/* Citations */}
          {latest.citations.length > 0 && (
            <div className="px-3 pb-3 space-y-2">
              {latest.citations.map((cit, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.05] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-cyan-300 truncate">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cit.document_title}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                      Section {cit.page_number}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-snug">
                    &ldquo;{cit.snippet}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400/80 font-mono pt-0.5">
                    <Info className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">
                      {cit.provenance || "Illustrative paraphrased KB"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
