"use client";

import React, { useState } from "react";
import { Stethoscope, Send, FileText, Info } from "lucide-react";
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
    } catch (err: any) {
      setError(err.message || "Consultation request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const latest = consultations[0];

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            NASA HRP Grounded RAG Clinical Consultation
          </h3>
        </div>
        <button
          type="button"
          onClick={handleLoadPreset}
          className="text-xs text-cyan-400 hover:underline font-mono"
        >
          Load Region Sample Query ({selectedRegion})
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            rows={2}
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe crew symptoms for the selected anatomical region..."
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-mono">
              Simulated Voice Stress Heuristic:{" "}
              <span className="text-cyan-300 font-bold">
                {voiceStress.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceStress}
              onChange={(e) => setVoiceStress(parseFloat(e.target.value))}
              className="w-28 accent-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Synthesizing..." : "Run RAG Assessment"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200">
          {error}
        </div>
      )}

      {latest && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300">
              REGION: {latest.body_region}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  latest.execution_mode === "ONLINE_GEMINI"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    : latest.execution_mode === "OFFLINE_FALLBACK"
                    ? "bg-amber-950 text-amber-300 border border-amber-700"
                    : "bg-rose-950 text-rose-300 border border-rose-700"
                }`}
              >
                MODE: {latest.execution_mode}
              </span>
              <span className="text-xs font-mono text-slate-300">
                Protocol Retrieval Match:{" "}
                <strong>{Math.round(latest.confidence_score * 100)}%</strong>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {latest.ai_diagnosis}
          </p>

          {latest.citations.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Verified Onboard NASA HRP Citations
              </p>
              {latest.citations.map((cit, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-cyan-300 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      {cit.document_title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 shrink-0">
                      Section / Page {cit.page_number}
                    </span>
                  </div>
                  <p className="text-slate-300 italic text-[11px]">
                    &ldquo;{cit.snippet}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-300/90 font-mono pt-0.5">
                    <Info className="w-3 h-3 shrink-0" />
                    <span>
                      {cit.provenance ||
                        "Illustrative page reference, paraphrased prototype KB based on NASA HRP themes."}
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
