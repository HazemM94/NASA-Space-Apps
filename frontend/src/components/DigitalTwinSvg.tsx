"use client";

import React from "react";
import { BodyRegionType, RegionStatusMap, StatusLevelType } from "@/types/astrohealth";

interface DigitalTwinSvgProps {
  regionStatuses: RegionStatusMap;
  selectedRegion: BodyRegionType;
  onSelectRegion: (region: BodyRegionType) => void;
}

const REGION_LABELS: Record<BodyRegionType, string> = {
  BRAIN_NEURO: "Brain & Circadian Neuro",
  OCULAR_EYES: "Ocular / SANS Visual System",
  CARDIOVASCULAR: "Cardiovascular & Cardiopulmonary",
  GASTROINTESTINAL: "Gastrointestinal & Metabolic",
  MUSCULOSKELETAL: "Musculoskeletal & Bone Density",
  SYSTEMIC: "Systemic / Radiation & Thermal",
};

function statusFill(status: StatusLevelType, isSelected: boolean): string {
  if (status === "RED") return isSelected ? "#ef4444" : "#dc2626";
  if (status === "YELLOW") return isSelected ? "#f59e0b" : "#d97706";
  return isSelected ? "#06b6d4" : "#10b981";
}

export default function DigitalTwinSvg({
  regionStatuses,
  selectedRegion,
  onSelectRegion,
}: DigitalTwinSvgProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Personalized 2D Digital Twin
        </h3>
        <span className="text-[11px] font-mono text-cyan-400">
          Click anatomical region to diagnose
        </span>
      </div>

      <svg
        viewBox="0 0 220 400"
        className="w-52 h-80 my-2 select-none"
        aria-label="Astronaut Digital Twin Body Map"
      >
        {/* SYSTEMIC Aura Halo */}
        <rect
          x="15"
          y="10"
          width="190"
          height="380"
          rx="28"
          fill="none"
          stroke={statusFill(regionStatuses.SYSTEMIC, selectedRegion === "SYSTEMIC")}
          strokeWidth={selectedRegion === "SYSTEMIC" ? "4" : "2"}
          strokeDasharray="6 4"
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("SYSTEMIC")}
        />

        {/* BRAIN_NEURO (Head Cranium) */}
        <circle
          cx="110"
          cy="52"
          r="28"
          fill={statusFill(regionStatuses.BRAIN_NEURO, selectedRegion === "BRAIN_NEURO")}
          fillOpacity="0.8"
          stroke="#ffffff"
          strokeWidth={selectedRegion === "BRAIN_NEURO" ? "3" : "1"}
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("BRAIN_NEURO")}
        />

        {/* OCULAR_EYES (Visor / Ocular Band) */}
        <rect
          x="90"
          y="44"
          width="40"
          height="12"
          rx="6"
          fill={statusFill(regionStatuses.OCULAR_EYES, selectedRegion === "OCULAR_EYES")}
          stroke="#0f172a"
          strokeWidth="2"
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("OCULAR_EYES")}
        />

        {/* CARDIOVASCULAR (Thorax / Heart & Lungs) */}
        <rect
          x="75"
          y="92"
          width="70"
          height="68"
          rx="12"
          fill={statusFill(
            regionStatuses.CARDIOVASCULAR,
            selectedRegion === "CARDIOVASCULAR"
          )}
          fillOpacity="0.85"
          stroke="#ffffff"
          strokeWidth={selectedRegion === "CARDIOVASCULAR" ? "3" : "1"}
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("CARDIOVASCULAR")}
        />

        {/* GASTROINTESTINAL (Abdomen) */}
        <rect
          x="78"
          y="168"
          width="64"
          height="56"
          rx="10"
          fill={statusFill(
            regionStatuses.GASTROINTESTINAL,
            selectedRegion === "GASTROINTESTINAL"
          )}
          fillOpacity="0.85"
          stroke="#ffffff"
          strokeWidth={selectedRegion === "GASTROINTESTINAL" ? "3" : "1"}
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("GASTROINTESTINAL")}
        />

        {/* MUSCULOSKELETAL (Arms & Legs Group) */}
        <g
          fill={statusFill(
            regionStatuses.MUSCULOSKELETAL,
            selectedRegion === "MUSCULOSKELETAL"
          )}
          fillOpacity="0.8"
          stroke="#ffffff"
          strokeWidth={selectedRegion === "MUSCULOSKELETAL" ? "2.5" : "1"}
          className="cursor-pointer transition-all"
          onClick={() => onSelectRegion("MUSCULOSKELETAL")}
        >
          {/* Left & Right Arms */}
          <rect x="44" y="96" width="24" height="110" rx="10" />
          <rect x="152" y="96" width="24" height="110" rx="10" />
          {/* Left & Right Legs */}
          <rect x="78" y="232" width="28" height="135" rx="12" />
          <rect x="114" y="232" width="28" height="135" rx="12" />
        </g>
      </svg>

      <div className="w-full grid grid-cols-2 gap-1.5 mt-2">
        {(Object.keys(REGION_LABELS) as BodyRegionType[]).map((region) => {
          const st = regionStatuses[region];
          const active = selectedRegion === region;
          return (
            <button
              key={region}
              type="button"
              onClick={() => onSelectRegion(region)}
              className={`px-2.5 py-1.5 rounded-lg border text-left text-xs flex items-center justify-between transition ${
                active
                  ? "bg-cyan-950/80 border-cyan-400 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <span className="truncate pr-1">{REGION_LABELS[region]}</span>
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  st === "RED"
                    ? "bg-red-500"
                    : st === "YELLOW"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
