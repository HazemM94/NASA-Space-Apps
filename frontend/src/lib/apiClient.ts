import {
  ConsultationResponse,
  DiagnosticConsultation,
  HealthCheckResponse,
  LatestTelemetrySummary,
  LoginResponse,
  ScenarioType,
  SyncReport,
  SyncReportVerifyResponse,
  TraumaProtocol,
  TreatmentTask,
  BodyRegionType,
} from "@/types/astrohealth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";
export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_WS_BASE_URL ||
  "ws://localhost:8000/ws/telemetry";

const TOKEN_STORAGE_KEY = "astrohealth_jwt_token";
const USER_STORAGE_KEY = "astrohealth_user_profile";
const TRAUMA_CACHE_KEY = "astrohealth_trauma_protocols_cache_v2";

const BUILTIN_TRAUMA_FALLBACK: TraumaProtocol[] = [
  {
    id: "e55e8400-e29b-41d4-a716-446655440555",
    code_name: "ACUTE_HEMORRHAGE_MICROGRAVITY",
    title: "Acute External Hemorrhage & Microgravity Restraint Stabilization",
    body_region: "CARDIOVASCULAR",
    steps: [
      "STEP 1: Secure patient and responder to the habitat restraint grid before intervention to prevent microgravity recoil.",
      "STEP 2: Apply direct, continuous manual pressure over the bleeding site using sterile gauze for a minimum of 3 minutes.",
      "STEP 3: If severe extremity bleeding continues, apply an arterial tourniquet proximal to the wound and record the exact UTC time.",
      "STEP 4: Continuously monitor heart rate, blood pressure, and SpO2 while alerting the Crew Medical Officer.",
    ],
    nasa_reference:
      "NASA ISS Integrated Medical Group (IMG) First-Aid Stabilization Checklist (Illustrative Prototype Summary)",
  },
  {
    id: "e55e8400-e29b-41d4-a716-446655440556",
    code_name: "ACUTE_HYPOXIA_CABIN_DEPRESSURIZATION",
    title: "Acute Cabin Depressurization & Supplemental Oxygen Protocol",
    body_region: "BRAIN_NEURO",
    steps: [
      "STEP 1: Don emergency portable 100% oxygen mask immediately and verify facepiece seal.",
      "STEP 2: Seal affected module hatch and verify cabin total pressure and oxygen partial pressure gauges.",
      "STEP 3: Exhale normally during any rapid pressure transition; never hold breath during decompression.",
      "STEP 4: Maintain continuous pulse oximetry (SpO2) monitoring and restrict physical exertion.",
    ],
    nasa_reference:
      "NASA Spaceflight Medical Operations Emergency Depressurization Procedure (Illustrative Prototype Summary)",
  },
  {
    id: "e55e8400-e29b-41d4-a716-446655440557",
    code_name: "OCULAR_CONTAMINANT_IRRIGATION",
    title: "Acute Ocular Particulate or Chemical Irritation Washout",
    body_region: "OCULAR_EYES",
    steps: [
      "STEP 1: Don protective breathing apparatus if airborne habitat contaminant is suspected.",
      "STEP 2: Position zero-gravity sealed ocular irrigation eyewear over the affected eye(s).",
      "STEP 3: Flush continuously with sterile isotonic saline for 15 minutes from nasal to temporal corner.",
      "STEP 4: Avoid rubbing the eye and perform visual acuity and pH verification with the Crew Medical Officer.",
    ],
    nasa_reference:
      "NASA Crew Health Care System (CHeCS) Ocular Washout Protocol (Illustrative Prototype Summary)",
  },
];

let memoryTraumaCache: TraumaProtocol[] = BUILTIN_TRAUMA_FALLBACK;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredAuth(data: LoginResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        errorMessage = `[${errBody.error.code}] ${errBody.error.message}`;
      }
    } catch {
      // Fallback to status text
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * Synchronously returns cached Trauma Override protocols in <1ms so emergency
 * checklists never wait on network I/O or fail on expired JWTs.
 */
export function getInstantTraumaProtocols(): TraumaProtocol[] {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(TRAUMA_CACHE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as TraumaProtocol[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryTraumaCache = parsed;
          return parsed;
        }
      } catch {
        // Ignore corrupt localStorage
      }
    }
  }
  return memoryTraumaCache;
}

/**
 * Prefetches Trauma Protocols from static public fallback JSON first, then refreshes
 * from the public backend endpoint `/api/v1/trauma-protocols`.
 */
export async function prefetchTraumaProtocols(): Promise<TraumaProtocol[]> {
  if (typeof window !== "undefined") {
    try {
      const staticRes = await fetch("/trauma_protocols.fallback.json");
      if (staticRes.ok) {
        const staticData = (await staticRes.json()) as TraumaProtocol[];
        if (Array.isArray(staticData) && staticData.length > 0) {
          memoryTraumaCache = staticData;
          window.localStorage.setItem(TRAUMA_CACHE_KEY, JSON.stringify(staticData));
        }
      }
    } catch {
      // Static file optional if built-in fallback is present
    }
  }

  try {
    const liveData = await request<TraumaProtocol[]>(
      "/trauma-protocols",
      { method: "GET" },
      false
    );
    if (Array.isArray(liveData) && liveData.length > 0) {
      memoryTraumaCache = liveData;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TRAUMA_CACHE_KEY, JSON.stringify(liveData));
      }
    }
  } catch {
    // Offline mode: silently retain cached / fallback protocols
  }

  return memoryTraumaCache;
}

export const apiClient = {
  getHealth: (liveCheck = false) =>
    request<HealthCheckResponse>(
      `/health?live_check=${liveCheck ? "true" : "false"}`,
      { method: "GET" },
      false
    ),

  login: (email: string, password: string) =>
    request<LoginResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    ),

  getLatestTelemetry: (userId?: string, limit = 30) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (userId) query.set("user_id", userId);
    return request<LatestTelemetrySummary>(`/telemetry/latest?${query.toString()}`);
  },

  simulateScenario: (
    scenario: ScenarioType,
    targetUserId?: string,
    timeCompression = 1.0
  ) =>
    request<{
      target_user_id: string;
      active_scenario: ScenarioType;
      status_level: string;
      alerts_triggered: number;
    }>("/telemetry/simulate-scenario", {
      method: "POST",
      body: JSON.stringify({
        scenario,
        target_user_id: targetUserId,
        time_compression: timeCompression,
      }),
    }),

  acknowledgeAlert: (alertId: string) =>
    request<{ id: string; is_acknowledged: boolean }>(
      `/alerts/${alertId}/acknowledge`,
      { method: "PATCH" }
    ),

  createConsultation: (payload: {
    target_user_id?: string;
    body_region: BodyRegionType;
    symptom_query: string;
    voice_stress_score: number | null;
  }) =>
    request<DiagnosticConsultation>("/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listConsultations: (userId?: string) => {
    const q = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return request<DiagnosticConsultation[]>(`/consultations${q}`);
  },

  listTasks: (userId?: string) => {
    const q = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return request<TreatmentTask[]>(`/tasks${q}`);
  },

  completeTask: (taskId: string) =>
    request<{ id: string; is_completed: boolean; completed_at: string }>(
      `/tasks/${taskId}/complete`,
      { method: "PATCH" }
    ),

  createSyncReport: (targetUserId?: string) =>
    request<SyncReport>("/reports/sync", {
      method: "POST",
      body: JSON.stringify({ target_user_id: targetUserId }),
    }),

  listSyncReports: (userId?: string) => {
    const q = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return request<SyncReport[]>(`/reports${q}`);
  },

  verifySyncReport: (reportId: string) =>
    request<SyncReportVerifyResponse>(`/reports/${reportId}/verify`),

  tamperSyncReportDemo: (reportId: string) =>
    request<{ report_id: string; tampered: boolean }>(
      `/reports/${reportId}/tamper-demo`,
      { method: "POST" }
    ),
};
