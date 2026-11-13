export type RoleType = "ASTRONAUT" | "CMO" | "FLIGHT_SURGEON";
export type StatusLevelType = "GREEN" | "YELLOW" | "RED";
export type SeverityType = "YELLOW" | "RED";
export type ExecutionModeType =
  | "ONLINE_GEMINI"
  | "OFFLINE_FALLBACK"
  | "DETERMINISTIC_REFUSAL";

export type BodyRegionType =
  | "BRAIN_NEURO"
  | "CARDIOVASCULAR"
  | "MUSCULOSKELETAL"
  | "OCULAR_EYES"
  | "GASTROINTESTINAL"
  | "SYSTEMIC";

export type ScenarioType =
  | "NOMINAL_BASELINE"
  | "SANS_OCULAR_AND_RADIATION_SPIKE"
  | "CIRCADIAN_FATIGUE_DRIFT"
  | "CARDIO_HYPERTENSION"
  | "STOP";

export type TaskCategoryType =
  | "MEDICATION"
  | "EXERCISE"
  | "NUTRITION"
  | "HABITAT_ADJUSTMENT";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: RoleType;
  baseline_hr_bpm: number;
  baseline_spo2_pct: number;
  baseline_sys_bp: number;
  baseline_dia_bp: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface HealthCheckResponse {
  status: string;
  ai_provider_mode: ExecutionModeType;
  live_model_verified: boolean | null;
  model_detail: string;
  kb_chunks_loaded: number;
}

export interface TelemetryReading {
  id: string;
  user_id: string;
  recorded_at: string;
  heart_rate_bpm: number;
  spo2_pct: number;
  systolic_bp_mmhg: number;
  diastolic_bp_mmhg: number;
  core_temp_c: number;
  radiation_msv: number;
  sleep_score: number;
  eeg_fatigue_index: number;
  status_level: StatusLevelType;
}

export interface AnomalyAlert {
  id: string;
  user_id: string;
  telemetry_id: string | null;
  rule_id: string;
  body_region: BodyRegionType;
  severity: SeverityType;
  title: string;
  micro_intervention: string;
  citation_source: string;
  is_acknowledged: boolean;
  created_at: string;
}

export type RegionStatusMap = Record<BodyRegionType, StatusLevelType>;

export interface LatestTelemetrySummary {
  user_id: string;
  overall_status: StatusLevelType;
  region_statuses: RegionStatusMap;
  readings: TelemetryReading[];
  active_alerts: AnomalyAlert[];
}

export interface TelemetryWsFrame {
  type: "telemetry";
  reading: TelemetryReading;
  overall_status: StatusLevelType;
  region_statuses: RegionStatusMap;
  alerts: AnomalyAlert[];
}

export interface CitationItem {
  document_title: string;
  page_number: number;
  snippet: string;
  provenance?: string;
}

export interface TreatmentTask {
  id: string;
  countermeasure_id: string;
  task_type: TaskCategoryType;
  title: string;
  instructions: string;
  scheduled_for: string;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface DiagnosticConsultation {
  id: string;
  user_id: string;
  body_region: BodyRegionType;
  symptom_query: string;
  voice_stress_score: number | null;
  ai_diagnosis: string;
  confidence_score: number;
  execution_mode: ExecutionModeType;
  citations: CitationItem[];
  generated_tasks: TreatmentTask[];
  created_at: string;
}

export type ConsultationResponse = DiagnosticConsultation;

export interface TraumaProtocol {
  id: string;
  code_name: string;
  title: string;
  body_region: string;
  steps: string[];
  nasa_reference: string;
}

export interface SyncReport {
  id: string;
  user_id: string;
  generated_by: string;
  integrity_hmac: string;
  summary: {
    astronaut_id: string;
    astronaut_name: string;
    overall_status?: StatusLevelType;
    telemetry_samples_count: number;
    active_anomalies_count: number;
    active_alerts?: Array<{
      rule_id: string;
      severity: string;
      title: string;
      created_at: string;
    }>;
    consultations_count: number;
    recent_consultations?: Array<{
      body_region: string;
      execution_mode: string;
      ai_diagnosis: string;
      citation_titles: string[];
    }>;
    pending_tasks_count: number;
    snapshot_utc: string;
  };
  sync_status: string;
  created_at: string;
}

export interface SyncReportVerifyResponse {
  report_id: string;
  verified: boolean;
  stored_hmac: string;
  computed_hmac: string;
  algorithm: string;
}
