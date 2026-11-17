"use client";

import React, { useState } from "react";
import { Radio, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { SyncReport, SyncReportVerifyResponse } from "@/types/astrohealth";

interface MissionSyncPanelProps {
  reports: SyncReport[];
  onGenerateReport: () => Promise<void>;
  onVerifyReport: (reportId: string) => Promise<SyncReportVerifyResponse>;
  onTamperReport: (reportId: string) => Promise<void>;
}

export default function MissionSyncPanel({
  reports,
  onGenerateReport,
  onVerifyReport,
  onTamperReport,
}: MissionSyncPanelProps) {
  const [verifications, setVerifications] = useState<
    Record<string, SyncReportVerifyResponse>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerateReport();
    } finally {
      setGenerating(false);
    }
  };

  const handleVerify = async (reportId: string) => {
    setBusyId(reportId);
    try {
      const res = await onVerifyReport(reportId);
      setVerifications((prev) => ({ ...prev, [reportId]: res }));
    } finally {
      setBusyId(null);
    }
  };

  const handleTamper = async (reportId: string) => {
    setBusyId(reportId);
    try {
      await onTamperReport(reportId);
      const res = await onVerifyReport(reportId);
      setVerifications((prev) => ({ ...prev, [reportId]: res }));
    } finally {
      setBusyId(null);
    }
  };

  const latestReport = reports[0];
  const latestVerify = latestReport ? verifications[latestReport.id] : null;
  const isVerified = latestVerify?.verified === true;
  const isTampered = latestVerify?.verified === false;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Radio className="w-3.5 h-3.5 text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white font-grotesk">
          Earth Mission Sync
        </h3>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/[0.08] text-xs font-mono text-slate-200 hover:text-white transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Radio className="w-3 h-3" />
          )}
          Generate Signed Digest
        </button>

        {latestReport && (
          <button
            type="button"
            onClick={() => handleVerify(latestReport.id)}
            disabled={busyId === latestReport.id}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/[0.08] text-xs font-mono text-slate-200 hover:text-white transition-colors disabled:opacity-50"
          >
            {busyId === latestReport.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ShieldCheck className="w-3 h-3" />
            )}
            Verify HMAC
          </button>
        )}
      </div>

      {/* Integrity badge */}
      <div className="flex justify-center pt-1">
        {!latestVerify ? (
          /* Idle ring */
          <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex flex-col items-center justify-center gap-0.5">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            <span className="text-[8px] font-mono text-slate-700 text-center leading-tight">
              PENDING
            </span>
          </div>
        ) : isVerified ? (
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-emerald-950/40 flex flex-col items-center justify-center gap-0.5 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[8px] font-mono text-emerald-300 text-center leading-tight">
              INTEGRITY<br />VERIFIED
            </span>
          </div>
        ) : isTampered ? (
          <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-red-950/40 flex flex-col items-center justify-center gap-0.5 shadow-[0_0_16px_rgba(239,68,68,0.35)] animate-pulse-slow">
            <ShieldX className="w-5 h-5 text-red-400" />
            <span className="text-[8px] font-mono text-red-300 text-center leading-tight">
              TAMPER<br />DETECTED
            </span>
          </div>
        ) : null}
      </div>

      {/* Report digest preview */}
      {latestReport && (
        <div className="mt-auto pt-2 border-t border-white/[0.05]">
          <p className="text-[9px] font-mono text-slate-600 truncate">
            ID: {latestReport.id.slice(0, 16)}…
          </p>
          {latestReport.integrity_hmac && (
            <p className="text-[9px] font-mono text-slate-700 truncate">
              HMAC: {latestReport.integrity_hmac.slice(0, 20)}…
            </p>
          )}
          <button
            type="button"
            onClick={() => handleTamper(latestReport.id)}
            disabled={busyId !== null}
            className="mt-1.5 text-[9px] font-mono text-red-700 hover:text-red-500 transition-colors disabled:opacity-30"
          >
            [tamper-demo]
          </button>
        </div>
      )}
    </div>
  );
}
