"use client";

import { useEffect, useState, useCallback } from "react";
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
  CARDIOVASCULAR: "GREEN",
  MUSCULOSKELETAL: "GREEN",
  OCULAR_EYES: "GREEN",
  GASTROINTESTINAL: "GREEN",
  SYSTEMIC: "GREEN",
};

export function useTelemetrySocket(targetUserId?: string) {
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [overallStatus, setOverallStatus] = useState<StatusLevelType>("GREEN");
  const [regionStatuses, setRegionStatuses] =
    useState<RegionStatusMap>(DEFAULT_REGIONS);
  const [activeAlerts, setActiveAlerts] = useState<AnomalyAlert[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const refreshInitialSnapshot = useCallback(async () => {
    try {
      const summary = await apiClient.getLatestTelemetry(targetUserId, 30);
      setReadings(summary.readings);
      setOverallStatus(summary.overall_status);
      setRegionStatuses(summary.region_statuses);
      setActiveAlerts(summary.active_alerts);
    } catch {
      // Handled by caller or auth redirect
    }
  }, [targetUserId]);

  useEffect(() => {
    refreshInitialSnapshot();
  }, [refreshInitialSnapshot]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const params = new URLSearchParams({ token });
    if (targetUserId) {
      params.set("user_id", targetUserId);
    }

    const ws = new WebSocket(`${WS_BASE_URL}?${params.toString()}`);

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data) as TelemetryWsFrame;
        if (frame.type === "telemetry" && frame.reading) {
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
        // Ignore malformed frame
      }
    };

    return () => {
      ws.close();
    };
  }, [targetUserId]);

  return {
    readings,
    overallStatus,
    regionStatuses,
    activeAlerts,
    setActiveAlerts,
    wsConnected,
    refreshInitialSnapshot,
  };
}
