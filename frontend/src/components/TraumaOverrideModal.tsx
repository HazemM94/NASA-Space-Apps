"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, Volume2, VolumeX, X, CheckCircle2 } from "lucide-react";
import { getInstantTraumaProtocols } from "@/lib/apiClient";
import { TraumaProtocol } from "@/types/astrohealth";

interface TraumaOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TraumaOverrideModal({
  isOpen,
  onClose,
}: TraumaOverrideModalProps) {
  const [protocols, setProtocols] = useState<TraumaProtocol[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Zero-latency synchronous read from memory/localStorage/built-in fallback
      const cached = getInstantTraumaProtocols();
      setProtocols(cached);
      setSelectedIdx(0);
      setCompletedSteps({});
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeProtocol = protocols[selectedIdx];

  const speakProtocolAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !activeProtocol) {
      return;
    }
    window.speechSynthesis.cancel();
    const fullText = `${activeProtocol.title}. ${activeProtocol.steps.join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-950 border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
            <div>
              <h2 className="text-xl font-black tracking-wide text-white uppercase">
                TRAUMA OVERRIDE — ZERO-LATENCY EMERGENCY PROTOCOL
              </h2>
              <p className="text-xs text-red-100 font-mono">
                LLM BYPASSED • CACHED ONBOARD CHECKLIST • WORKS OFFLINE & WITHOUT AUTH
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-800 hover:bg-red-900 text-white"
            aria-label="Exit Trauma Override"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-red-300 mb-2">
              Select Emergency Checklist
            </p>
            {protocols.map((proto, idx) => (
              <button
                key={proto.id}
                onClick={() => {
                  stopSpeech();
                  setSelectedIdx(idx);
                  setCompletedSteps({});
                }}
                className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition ${
                  idx === selectedIdx
                    ? "bg-red-900/60 border-red-400 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-red-800"
                }`}
              >
                <div className="text-[10px] font-mono text-red-300">
                  {proto.body_region}
                </div>
                <div>{proto.title}</div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-5">
            {activeProtocol ? (
              <>
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-red-400">
                        CODE: {activeProtocol.code_name}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {activeProtocol.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={isSpeaking ? stopSpeech : speakProtocolAloud}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shrink-0"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Stop Voice Readout
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Read Aloud (Web Speech)
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeProtocol.steps.map((step, sIdx) => {
                      const done = !!completedSteps[sIdx];
                      return (
                        <div
                          key={sIdx}
                          onClick={() =>
                            setCompletedSteps((prev) => ({
                              ...prev,
                              [sIdx]: !prev[sIdx],
                            }))
                          }
                          className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                            done
                              ? "bg-emerald-950/40 border-emerald-600 text-emerald-200"
                              : "bg-slate-950 border-slate-800 text-white hover:border-red-500"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-6 h-6 shrink-0 mt-0.5 ${
                              done ? "text-emerald-400" : "text-slate-600"
                            }`}
                          />
                          <span className="text-base font-medium leading-relaxed">
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>REF: {activeProtocol.nasa_reference}</span>
                  <span>LATENCY: &lt;10ms LOCAL CACHE</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No protocols available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
