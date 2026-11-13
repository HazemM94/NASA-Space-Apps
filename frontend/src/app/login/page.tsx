"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Rocket, UserCheck } from "lucide-react";
import { apiClient, setStoredAuth, prefetchTraumaProtocols } from "@/lib/apiClient";

const DEMO_ACCOUNTS = [
  {
    label: "Cmdr. Mark Watney (Astronaut)",
    email: "mark.watney@nasa.gov",
    role: "ASTRONAUT",
  },
  {
    label: "Dr. Melissa Lewis (Crew Medical Officer)",
    email: "cmo.lewis@nasa.gov",
    role: "CMO",
  },
  {
    label: "Dr. Elena Cruz (Flight Surgeon - Earth)",
    email: "surgeon.cruz@nasa.gov",
    role: "FLIGHT_SURGEON",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mark.watney@nasa.gov");
  const [password, setPassword] = useState("MarsMission2026!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.login(email, password);
      setStoredAuth(res);
      await prefetchTraumaProtocols();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="bg-amber-950/90 border-b border-amber-700 px-4 py-2 text-center text-xs font-mono text-amber-200 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          CLINICAL DECISION-SUPPORT PROTOTYPE — SYNTHETIC DEMO DATA ONLY — NOT A
          CERTIFIED MEDICAL DEVICE
        </span>
      </div>

      <div className="max-w-md w-full mx-auto my-auto p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              AstroHealth AI
            </h1>
            <p className="text-xs text-slate-400">
              Autonomous Deep-Space Medical Telemetry & RAG Console
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Quick-Select Synthetic Crew Profile
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => {
                  setEmail(acct.email);
                  setPassword("MarsMission2026!");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition ${
                  email === acct.email
                    ? "bg-cyan-950/70 border-cyan-500 text-cyan-200"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  {acct.label}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {acct.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Crew Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mission Passkey
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
          >
            {loading ? "Initializing Onboard Console..." : "Authenticate Crew Console"}
          </button>
        </form>
      </div>

      <footer className="py-3 text-center text-xs text-slate-500 font-mono">
        NASA Space Apps 2026 Prototype • Edge-First Medical Decision Support
      </footer>
    </div>
  );
}
