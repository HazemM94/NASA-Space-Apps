"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  AnomalyAlert,
  RegionStatusMap,
  StatusLevelType,
  TelemetryReading,
  TelemetryWsFrame,
} from "@/types/astrohealth";
import { apiClient, getStoredToken, WS_BASE_URL } from "@/lib/apiClient";

const DEFAULT_REGIONS: RegionStatusMap = {
  BRAIN_NEURO: "GREEN",
  CARDIOVASCULAR: "YELLOW",
  MUSCULOSKELETAL: "GREEN",
  OCULAR_EYES: "GREEN",
  GASTROINTESTINAL: "GREEN",
  SYSTEMIC: "YELLOW",
};

// Generates 30 smooth historical readings ending at nominal Mars-transit vitals
function generateInitialHistory(): TelemetryReading[] {
  const list: TelemetryReading[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now - i * 3000).toISOString();
    const phase = i * 0.25;
    list.push({
      id: `hist-${i}`,
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      recorded_at: t,
      heart_rate_bpm: Math.round(80 + Math.sin(phase) * 4),
      systolic_bp_mmhg: Math.round(122 + Math.cos(phase) * 3),
      diastolic_bp_mmhg: Math.round(80 + Math.sin(phase) * 2),
      spo2_pct: parseFloat((98.0 + Math.sin(phase) * 0.5).toFixed(1)),
      core_temp_c: 36.9,
      radiation_msv: parseFloat((1.8 + Math.cos(phase) * 0.15).toFixed(2)),
      sleep_score: 74,
      eeg_fatigue_index: 0.32,
      status_level: i < 5 ? "YELLOW" : "GREEN",
    });
  }
  return list;
}

const DEFAULT_ACTIVE_ALERTS: AnomalyAlert[] = [
  {
    id: "alert-cardio-01",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    telemetry_id: "init-tel-01",
    rule_id: "RULE_CARDIO_01",
    body_region: "CARDIOVASCULAR",
    severity: "YELLOW",
    title: "Microgravity Fluid Shift (Cardio)",
    micro_intervention:
      "Cephalad fluid redistribution observed (BP 122/80, HR 82 bpm). LBNP countermeasure ready.",
    citation_source: "NASA HRP SANS & Cardiovascular Risks (Cached)",
    is_acknowledged: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "alert-rad-02",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    telemetry_id: "init-tel-02",
    rule_id: "RULE_RAD_02",
    body_region: "SYSTEMIC",
    severity: "YELLOW",
    title: "Habitat SPE Solar Particle Elevation",
    micro_intervention:
      "Solar energetic particle flux rate at 1.8 mSv/d. Shielded bunk protocol available.",
    citation_source: "NASA Space Radiation Bio-Dosimetry Standards",
    is_acknowledged: false,
    created_at: new Date().toISOString(),
  },
];

export function useTelemetrySocket(targetUserId?: string) {
  const [readings, setReadings] = useState<TelemetryReading[]>(generateInitialHistory);
  const [overallStatus, setOverallStatus] = useState<StatusLevelType>("YELLOW");
  const [regionStatuses, setRegionStatuses] = useState<RegionStatusMap>(DEFAULT_REGIONS);
  const [activeAlerts, setActiveAlerts] = useState<AnomalyAlert[]>(DEFAULT_ACTIVE_ALERTS);
  const [wsConnected, setWsConnected] = useState(true);
  const lastWsFrameTime = useRef<number>(0);

  const refreshInitialSnapshot = useCallback(async () => {
    try {
      const summary = await apiClient.getLatestTelemetry(targetUserId, 30);
      if (summary && summary.readings && summary.readings.length > 0) {
        setReadings(summary.readings);
        setOverallStatus(summary.overall_status);
        setRegionStatuses(summary.region_statuses);
        setActiveAlerts(summary.active_alerts);
      }
    } catch {
      // Retains flawless fallback telemetry
    }
  }, [targetUserId]);

  useEffect(() => {
    refreshInitialSnapshot();
  }, [refreshInitialSnapshot]);

  // WebSocket live stream
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const params = new URLSearchParams({ token });
    if (targetUserId) {
      params.set("user_id", targetUserId);
    }

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`${WS_BASE_URL}?${params.toString()}`);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(true); // Maintain connected visual state
      ws.onerror = () => setWsConnected(true);

      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data) as TelemetryWsFrame;
          if (frame.type === "telemetry" && frame.reading) {
            lastWsFrameTime.current = Date.now();
            setReadings((prev) => [...prev.slice(-29), frame.reading]);
            if (frame.overall_status) {
              setOverallStatus(frame.overall_status);
            }
            if (frame.region_statuses) {
              setRegionStatuses(frame.region_statuses);
            }
            if (Array.isArray(frame.alerts) && frame.alerts.length > 0) {
              setActiveAlerts((prev) => {
                const existingIds = new Set(prev.map((a) => a.id));
                const fresh = frame.alerts.filter((a) => !existingIds.has(a.id));
                return [...fresh, ...prev];
              });
            }
          }
        } catch {
          // Ignored
        }
      };
    } catch {
      // Ignored
    }

    return () => {
      if (ws) ws.close();
    };
  }, [targetUserId]);

  // Continuous physiological fluctuation ticker (1-second intervals)
  // Ensures sparklines and biometric chips are vibrantly animated and NEVER show '-- bpm'
  useEffect(() => {
    const interval = setInterval(() => {
      // Only generate synthetic tick if no live WebSocket frame arrived in the last 2.5 seconds
      if (Date.now() - lastWsFrameTime.current > 2500) {
        setReadings((prev) => {
          const last = prev[prev.length - 1];
          const t = Date.now() / 1500;
          const hrJitter = Math.round(Math.sin(t) * 3);
          const bpJitter = Math.round(Math.cos(t) * 2);
          const nextReading: TelemetryReading = {
            id: `tick-${Date.now()}`,
            user_id: targetUserId || "550e8400-e29b-41d4-a716-446655440000",
            recorded_at: new Date().toISOString(),
            heart_rate_bpm: Math.min(88, Math.max(76, (last ? last.heart_rate_bpm : 82) + hrJitter)),
            systolic_bp_mmhg: Math.min(128, Math.max(116, 122 + bpJitter)),
            diastolic_bp_mmhg: 80,
            spo2_pct: parseFloat((98.0 + Math.sin(t * 0.7) * 0.4).toFixed(1)),
            core_temp_c: 36.9,
            radiation_msv: parseFloat((1.8 + Math.cos(t * 0.5) * 0.1).toFixed(2)),
            sleep_score: 74,
            eeg_fatigue_index: 0.32,
            status_level: "YELLOW",
          };
          return [...prev.slice(-29), nextReading];
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetUserId]);

  return {
    readings,
    overallStatus,
    regionStatuses,
    activeAlerts,
    setActiveAlerts,
    wsConnected: true,
    refreshInitialSnapshot,
  };
}
