"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TelemetryCharts from "@/components/TelemetryCharts";
import DigitalTwinSvg from "@/components/DigitalTwinSvg";
import AnomalyAlertsFeed from "@/components/AnomalyAlertsFeed";
import RagDiagnosticsPanel from "@/components/RagDiagnosticsPanel";
import CountermeasureList from "@/components/CountermeasureList";
import MissionSyncPanel from "@/components/MissionSyncPanel";
import TraumaOverrideModal from "@/components/TraumaOverrideModal";
import { useTelemetrySocket } from "@/hooks/useTelemetrySocket";
import {
  apiClient,
  clearStoredAuth,
  getStoredToken,
  prefetchTraumaProtocols,
} from "@/lib/apiClient";
import {
  BodyRegionType,
  DiagnosticConsultation,
  ExecutionModeType,
  ScenarioType,
  SyncReport,
  TreatmentTask,
  UserProfile,
} from "@/types/astrohealth";

export default function MissionControlDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [aiMode, setAiMode] = useState<ExecutionModeType>("OFFLINE_FALLBACK");
  const [selectedRegion, setSelectedRegion] =
    useState<BodyRegionType>("OCULAR_EYES");
  const [consultations, setConsultations] = useState<DiagnosticConsultation[]>(
    []
  );
  const [tasks, setTasks] = useState<TreatmentTask[]>([]);
  const [reports, setReports] = useState<SyncReport[]>([]);
  const [traumaOpen, setTraumaOpen] = useState(false);

  const {
    readings,
    overallStatus,
    regionStatuses,
    activeAlerts,
    setActiveAlerts,
    wsConnected,
    refreshInitialSnapshot,
  } = useTelemetrySocket();

  const loadClinicalRecords = useCallback(async () => {
    try {
      const [health, consultList, taskList, reportList] = await Promise.all([
        apiClient.getHealth(false),
        apiClient.listConsultations(),
        apiClient.listTasks(),
        apiClient.listSyncReports(),
      ]);
      setAiMode(health.ai_provider_mode);
      setConsultations(consultList);
      setTasks(taskList);
      setReports(reportList);
    } catch {
      // Handled gracefully
    }
  }, []);

  useEffect(() => {
    prefetchTraumaProtocols();
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const rawUser = window.localStorage.getItem("astrohealth_user_profile");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        // Ignore parse error
      }
    }
    loadClinicalRecords();
  }, [router, loadClinicalRecords]);

  const handleTriggerScenario = async (scenario: ScenarioType) => {
    await apiClient.simulateScenario(scenario, user?.id, 1.0);
    await refreshInitialSnapshot();
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await apiClient.acknowledgeAlert(alertId);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    await refreshInitialSnapshot();
  };

  const handleSubmitConsultation = async (
    region: BodyRegionType,
    symptomQuery: string,
    voiceStress: number
  ) => {
    const created = await apiClient.createConsultation({
      body_region: region,
      symptom_query: symptomQuery,
      voice_stress_score: voiceStress,
    });
    setAiMode(created.execution_mode);
    setConsultations((prev) => [created, ...prev]);
    if (created.generated_tasks.length > 0) {
      setTasks((prev) => [...created.generated_tasks, ...prev]);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await apiClient.completeTask(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t))
    );
  };

  const handleGenerateReport = async () => {
    const created = await apiClient.createSyncReport(user?.id);
    setReports((prev) => [created, ...prev]);
  };

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={user}
        overallStatus={overallStatus}
        wsConnected={wsConnected}
        aiMode={aiMode}
        onTriggerScenario={handleTriggerScenario}
        onOpenTraumaModal={() => setTraumaOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D SVG Digital Twin & Proactive Anomaly Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <DigitalTwinSvg
            regionStatuses={regionStatuses}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
          <AnomalyAlertsFeed
            alerts={activeAlerts}
            onAcknowledge={handleAcknowledgeAlert}
          />
        </div>

        {/* Right Column: Live Telemetry Charts, RAG Diagnostics, Tasks & Earth Sync (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <TelemetryCharts readings={readings} />
          <RagDiagnosticsPanel
            selectedRegion={selectedRegion}
            consultations={consultations}
            onSubmitConsultation={handleSubmitConsultation}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CountermeasureList
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
            />
            <MissionSyncPanel
              reports={reports}
              onGenerateReport={handleGenerateReport}
              onVerifyReport={(id) => apiClient.verifySyncReport(id)}
              onTamperReport={(id) =>
                apiClient.tamperSyncReportDemo(id).then(() => undefined)
              }
            />
          </div>
        </div>
      </main>

      <TraumaOverrideModal
        isOpen={traumaOpen}
        onClose={() => setTraumaOpen(false)}
      />
    </div>
  );
}
