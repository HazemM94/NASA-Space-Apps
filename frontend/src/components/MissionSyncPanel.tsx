"use client";

import React, { useState } from "react";
import { Radio, ShieldCheck, ShieldX, Bug } from "lucide-react";
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

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Asynchronous Earth Mission Control Sync (HMAC-SHA256)
          </h3>
        </div>
        <button
          type="button"
          onClick={onGenerateReport}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
        >
          Generate Signed Digest
        </button>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-slate-400 p-3 bg-slate-950 rounded-lg border border-slate-800">
          No asynchronous Mission Control digests queued yet.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {reports.map((rep) => {
            const v = verifications[rep.id];
            return (
              <div
                key={rep.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">
                    {rep.summary.astronaut_name} • Status:{" "}
                    {rep.summary.overall_status || "NOMINAL"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => handleVerify(rep.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px]"
                    >
                      Verify HMAC
                    </button>
                    <button
                      type="button"
                      disabled={busyId === rep.id}
                      onClick={() => handleTamper(rep.id)}
                      className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-mono text-[11px] flex items-center gap-1"
                      title="Dev-only demo: mutates summary_json without updating HMAC"
                    >
                      <Bug className="w-3 h-3" />
                      Tamper Demo
                    </button>
                  </div>
                </div>

                <div className="font-mono text-[10px] text-slate-400 break-all">
                  HMAC-SHA256: {rep.integrity_hmac}
                </div>

                {v && (
                  <div
                    className={`p-2 rounded border flex items-center gap-2 font-mono text-[11px] ${
                      v.verified
                        ? "bg-emerald-950/60 border-emerald-600 text-emerald-200"
                        : "bg-red-950/70 border-red-600 text-red-200"
                    }`}
                  >
                    {v.verified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          INTEGRITY VERIFIED (HMAC-SHA256 match confirmed)
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldX className="w-4 h-4 text-red-400 shrink-0" />
                        <span>
                          TAMPER DETECTED! Stored HMAC does not match canonical
                          payload.
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
