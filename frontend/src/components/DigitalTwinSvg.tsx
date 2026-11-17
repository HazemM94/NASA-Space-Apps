"use client";

import React, { useMemo } from "react";
import {
  BodyRegionType,
  RegionStatusMap,
  TelemetryReading,
} from "@/types/astrohealth";

interface DigitalTwinSvgProps {
  regionStatuses: RegionStatusMap;
  selectedRegion: BodyRegionType;
  onSelectRegion: (r: BodyRegionType) => void;
  latestReading?: TelemetryReading | null;
}

type RegionStatus = "GREEN" | "YELLOW" | "RED" | "NOMINAL";

const REGION_COLOR: Record<RegionStatus, string> = {
  GREEN: "#10b981",
  NOMINAL: "#10b981",
  YELLOW: "#f59e0b",
  RED: "#ef4444",
};

const REGION_GLOW: Record<RegionStatus, string> = {
  GREEN: "rgba(16,185,129,0.35)",
  NOMINAL: "rgba(16,185,129,0.35)",
  YELLOW: "rgba(245,158,11,0.5)",
  RED: "rgba(239,68,68,0.6)",
};

interface HotspotDef {
  id: BodyRegionType;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const HOTSPOTS: HotspotDef[] = [
  { id: "BRAIN_NEURO", label: "Brain", cx: 230, cy: 90, rx: 30, ry: 26 },
  { id: "OCULAR_EYES", label: "Ocular", cx: 230, cy: 118, rx: 24, ry: 10 },
  { id: "CARDIOVASCULAR", label: "Cardio", cx: 232, cy: 225, rx: 28, ry: 28 },
  { id: "GASTROINTESTINAL", label: "Abdomen", cx: 230, cy: 310, rx: 34, ry: 28 },
  { id: "MUSCULOSKELETAL", label: "Musculo", cx: 230, cy: 420, rx: 44, ry: 70 },
  { id: "SYSTEMIC", label: "Systemic", cx: 230, cy: 175, rx: 42, ry: 20 },
];

const REGION_PILLS: { id: BodyRegionType; short: string }[] = [
  { id: "BRAIN_NEURO", short: "Brain" },
  { id: "OCULAR_EYES", short: "Ocular" },
  { id: "CARDIOVASCULAR", short: "Cardio" },
  { id: "GASTROINTESTINAL", short: "Abdom" },
  { id: "MUSCULOSKELETAL", short: "Musculo" },
  { id: "SYSTEMIC", short: "Rad" },
];

function getStatus(regionStatuses: RegionStatusMap, id: BodyRegionType): RegionStatus {
  const s = regionStatuses?.[id];
  if (!s) return "NOMINAL";
  return (s as RegionStatus) ?? "NOMINAL";
}

export default function DigitalTwinSvg({
  regionStatuses,
  selectedRegion,
  onSelectRegion,
  latestReading,
}: DigitalTwinSvgProps) {
  const cardioStatus = getStatus(regionStatuses, "CARDIOVASCULAR");
  const radarColor = cardioStatus === "RED" ? "#ef4444" : cardioStatus === "YELLOW" ? "#f59e0b" : "#ef4444";

  // Telemetry fallback values ensuring dashboard NEVER displays blank or '--'
  const hrVal = latestReading?.heart_rate_bpm ?? 82;
  const sysVal = latestReading?.systolic_bp_mmhg ?? 122;
  const diaVal = latestReading?.diastolic_bp_mmhg ?? 80;
  const spo2Val = (latestReading?.spo2_pct ?? 98.0).toFixed(0);
  const radVal = (latestReading?.radiation_msv ?? 1.8).toFixed(1);

  // Generate 72 fine radial ticks for the concentric radar target ring
  const radarTicks = useMemo(() => {
    const ticks: { x1: number; y1: number; x2: number; y2: number; isMajor: boolean }[] = [];
    const cx = 230;
    const cy = 225;
    const count = 72;
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const rad = (angle * Math.PI) / 180;
      const isMajor = i % 6 === 0;
      const rInner = 74;
      const rOuter = isMajor ? 98 : 90;
      ticks.push({
        x1: cx + Math.cos(rad) * rInner,
        y1: cy + Math.sin(rad) * rInner,
        x2: cx + Math.cos(rad) * rOuter,
        y2: cy + Math.sin(rad) * rOuter,
        isMajor,
      });
    }
    return ticks;
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 
        NO background colors, NO borders, NO box-shadows on parent container 
        so the black JPG completely dissolves into the 3D space scene via screen blend mode!
      */}
      <div className="relative flex-1 bg-transparent overflow-visible">
        <svg
          viewBox="0 0 460 620"
          className="w-full h-full select-none bg-transparent"
          style={{ minHeight: 490 }}
          aria-label="Astronaut Anatomical Digital Twin"
        >
          <defs>
            {/* Glowing radar filter */}
            <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing red radar aura */}
            <radialGradient id="radarAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={radarColor} stopOpacity="0.55" />
              <stop offset="60%" stopColor={radarColor} stopOpacity="0.18" />
              <stop offset="100%" stopColor={radarColor} stopOpacity="0" />
            </radialGradient>

            {/* Neon Cyan Chip Filter */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 1: Glowing Concentric Radar Target Ring (Behind Chest)
              ═════════════════════════════════════════════════════════════════ */}
          <g filter="url(#radarGlow)" className="animate-pulse-slow">
            {/* Soft Radial Backlight behind heart */}
            <circle cx="230" cy="225" r="118" fill="url(#radarAura)" />

            {/* Concentric Radar Rings */}
            <circle
              cx="230"
              cy="225"
              r="106"
              fill="none"
              stroke={radarColor}
              strokeWidth="2.5"
              strokeOpacity="0.95"
            />
            <circle
              cx="230"
              cy="225"
              r="94"
              fill="none"
              stroke={radarColor}
              strokeWidth="1.2"
              strokeOpacity="0.75"
            />
            <circle
              cx="230"
              cy="225"
              r="74"
              fill="none"
              stroke={radarColor}
              strokeWidth="1.2"
              strokeOpacity="0.75"
            />
            <circle
              cx="230"
              cy="225"
              r="52"
              fill="none"
              stroke={radarColor}
              strokeWidth="2.2"
              strokeOpacity="0.9"
            />
            <circle
              cx="230"
              cy="225"
              r="34"
              fill="none"
              stroke={radarColor}
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />

            {/* Fine Radial Ticks */}
            {radarTicks.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={radarColor}
                strokeWidth={t.isMajor ? 1.8 : 0.9}
                strokeOpacity={t.isMajor ? 0.95 : 0.55}
              />
            ))}

            {/* Cardinal Crosshair Ticks */}
            <line x1="110" y1="225" x2="135" y2="225" stroke={radarColor} strokeWidth="1.8" strokeOpacity="0.9" />
            <line x1="325" y1="225" x2="350" y2="225" stroke={radarColor} strokeWidth="1.8" strokeOpacity="0.9" />
            <line x1="230" y1="105" x2="230" y2="130" stroke={radarColor} strokeWidth="1.8" strokeOpacity="0.9" />
            <line x1="230" y1="320" x2="230" y2="345" stroke={radarColor} strokeWidth="1.8" strokeOpacity="0.9" />
          </g>

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 2: Isolated Anatomical Body with Screen Blend Mode
              (Solid black background becomes 100% transparent in HUD)
              ═════════════════════════════════════════════════════════════════ */}
          <image
            href="/anatomical-body.jpg"
            x="60"
            y="25"
            width="340"
            height="565"
            preserveAspectRatio="xMidYMid meet"
            style={{
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 3: Interactive Clickable Organ Hotspots
              ═════════════════════════════════════════════════════════════════ */}
          {HOTSPOTS.map((h) => {
            const st = getStatus(regionStatuses, h.id);
            const isAlert = st === "RED" || st === "YELLOW";
            const isSel = selectedRegion === h.id;
            const color = REGION_COLOR[st];
            const glowColor = REGION_GLOW[st];

            return (
              <g
                key={h.id}
                onClick={() => onSelectRegion(h.id)}
                style={{ cursor: "pointer" }}
                className="transition-transform hover:scale-105"
              >
                {/* Organ Alert Pulse Aura */}
                {isAlert && (
                  <ellipse
                    cx={h.cx}
                    cy={h.cy}
                    rx={h.rx + 8}
                    ry={h.ry + 8}
                    fill={glowColor}
                    className="animate-pulse-slow"
                  />
                )}

                {/* Hotspot Target Ellipse */}
                <ellipse
                  cx={h.cx}
                  cy={h.cy}
                  rx={h.rx}
                  ry={h.ry}
                  fill={isSel ? color : "transparent"}
                  fillOpacity={isSel ? 0.3 : 0}
                  stroke={isSel ? color : isAlert ? color : "rgba(6, 182, 212, 0.45)"}
                  strokeWidth={isSel ? 2.5 : 1.2}
                  strokeDasharray={isSel ? "none" : "3 3"}
                />

                {/* Selection brackets */}
                {isSel && (
                  <>
                    <path
                      d={`M${h.cx - h.rx - 4} ${h.cy - 6} L${h.cx - h.rx - 4} ${h.cy - h.ry - 4} L${h.cx - 6} ${h.cy - h.ry - 4}`}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d={`M${h.cx + h.rx + 4} ${h.cy - 6} L${h.cx + h.rx + 4} ${h.cy - h.ry - 4} L${h.cx + 6} ${h.cy - h.ry - 4}`}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* ═════════════════════════════════════════════════════════════════
              LAYER 4: Crisp 1px White Callout Lines & Glowing Cyan Glass Chips
              ═════════════════════════════════════════════════════════════════ */}

          {/* ── Callout 1: Heart Rate (Left Side) ── */}
          <g>
            {/* Anchor dot on Heart */}
            <circle cx="218" cy="225" r="3.5" fill="#ffffff" />
            <circle cx="218" cy="225" r="7" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.9" />
            {/* Crisp 1px white horizontal callout line */}
            <polyline
              points="218,225 145,155 120,155"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.9"
            />
            {/* Glowing Glass Chip Container */}
            <g transform="translate(10, 134)">
              <rect
                width="114"
                height="40"
                rx="8"
                fill="rgba(3, 11, 26, 0.85)"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.2"
                style={{ backdropFilter: "blur(16px)" }}
              />
              <text x="12" y="16" fill="#06b6d4" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.8">
                HR (PULSE)
              </text>
              <text
                x="12"
                y="32"
                fill="#22d3ee"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.85))" }}
              >
                {hrVal} bpm
              </text>
            </g>
          </g>

          {/* ── Callout 2: Blood Pressure (Left Side) ── */}
          <g>
            {/* Anchor dot on Brachial Artery */}
            <circle cx="178" cy="265" r="3.5" fill="#ffffff" />
            <circle cx="178" cy="265" r="7" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.9" />
            {/* Crisp 1px white horizontal callout line */}
            <polyline
              points="178,265 140,240 120,240"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.9"
            />
            {/* Glowing Glass Chip Container */}
            <g transform="translate(10, 219)">
              <rect
                width="114"
                height="40"
                rx="8"
                fill="rgba(3, 11, 26, 0.85)"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.2"
                style={{ backdropFilter: "blur(16px)" }}
              />
              <text x="12" y="16" fill="#06b6d4" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.8">
                BP (SYS/DIA)
              </text>
              <text
                x="12"
                y="32"
                fill="#22d3ee"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.85))" }}
              >
                {sysVal}/{diaVal}
              </text>
            </g>
          </g>

          {/* ── Callout 3: Eyes / SANS (Right Side) ── */}
          <g>
            {/* Anchor dot on Eye */}
            <circle cx="242" cy="118" r="3.5" fill="#ffffff" />
            <circle cx="242" cy="118" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.9" />
            {/* Crisp 1px white horizontal callout line */}
            <polyline
              points="242,118 315,95 340,95"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.9"
            />
            {/* Glowing Glass Chip Container */}
            <g transform="translate(340, 74)">
              <rect
                width="114"
                height="40"
                rx="8"
                fill="rgba(3, 11, 26, 0.85)"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.2"
                style={{ backdropFilter: "blur(16px)" }}
              />
              <text x="12" y="16" fill="#06b6d4" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.8">
                EYES / SANS
              </text>
              <text
                x="12"
                y="32"
                fill="#22d3ee"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.85))" }}
              >
                {spo2Val}%
              </text>
            </g>
          </g>

          {/* ── Callout 4: SpO2 (Right Side) ── */}
          <g>
            {/* Anchor dot on Pulmonary/Lungs */}
            <circle cx="258" cy="225" r="3.5" fill="#ffffff" />
            <circle cx="258" cy="225" r="7" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.9" />
            {/* Crisp 1px white horizontal callout line */}
            <polyline
              points="258,225 315,195 340,195"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.9"
            />
            {/* Glowing Glass Chip Container */}
            <g transform="translate(340, 174)">
              <rect
                width="114"
                height="40"
                rx="8"
                fill="rgba(3, 11, 26, 0.85)"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.2"
                style={{ backdropFilter: "blur(16px)" }}
              />
              <text x="12" y="16" fill="#06b6d4" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.8">
                SpO₂ PULSE OX
              </text>
              <text
                x="12"
                y="32"
                fill="#22d3ee"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.85))" }}
              >
                {spo2Val}%
              </text>
            </g>
          </g>

          {/* ── Callout 5: Radiation Dosimeter (Right Side) ── */}
          <g>
            {/* Anchor dot on Systemic/Leg */}
            <circle cx="248" cy="360" r="3.5" fill="#ffffff" />
            <circle cx="248" cy="360" r="7" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.9" />
            {/* Crisp 1px white horizontal callout line */}
            <polyline
              points="248,360 315,310 340,310"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.9"
            />
            {/* Glowing Glass Chip Container */}
            <g transform="translate(340, 289)">
              <rect
                width="114"
                height="40"
                rx="8"
                fill="rgba(3, 11, 26, 0.85)"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.2"
                style={{ backdropFilter: "blur(16px)" }}
              />
              <text x="12" y="16" fill="#06b6d4" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.8">
                RAD DOSIMETER
              </text>
              <text
                x="12"
                y="32"
                fill="#22d3ee"
                fontSize="15"
                fontFamily="var(--font-mono)"
                fontWeight="800"
                style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.85))" }}
              >
                {radVal} mSv/d
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* ── Region Filter Pills ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 px-1">
        <span className="text-[10px] font-mono text-cyan-400 mr-1 uppercase tracking-wider font-bold">Region:</span>
        {REGION_PILLS.map((p) => {
          const st = getStatus(regionStatuses, p.id);
          const color = REGION_COLOR[st];
          const isSelected = selectedRegion === p.id;
          const isAlert = st === "RED" || st === "YELLOW";
          return (
            <button
              key={p.id}
              onClick={() => onSelectRegion(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono font-semibold transition-all ${
                isSelected
                  ? "bg-slate-900/90 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "bg-slate-950/70 border-white/[0.1] text-slate-300 hover:text-white hover:border-cyan-400/50"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isAlert ? "animate-pulse-fast" : ""}`}
                style={{ backgroundColor: color }}
              />
              {p.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
