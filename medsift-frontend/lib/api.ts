import type {
  TranscribeResponse,
  AnalyzeResponse,
  VisitRecord,
  ClinicalTrial,
  LiteratureResult,
  FeedbackItem,
  FeedbackAnalytics,
  AnalyticsSummary,
} from "@/types";
import { MOCK_VISITS, MOCK_ANALYTICS, MOCK_TRIALS, MOCK_LITERATURE } from "./mockData";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || true; // Enable mock data by default for demo

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    // If backend is unavailable, throw to let caller handle with mock data
    throw error;
  }
}

// ─── Transcribe ───────────────────────────────────────────────────────────────
export async function transcribeAudio(file: File): Promise<TranscribeResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/transcribe`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Analyze ──────────────────────────────────────────────────────────────────
export async function analyzeTranscript(payload: {
  transcript: string;
  visit_date: string;
  visit_type: string;
  tags: string[];
}): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Visits ───────────────────────────────────────────────────────────────────

// Auto-approve mock visits for demo purposes
function initMockApprovals() {
  if (typeof window !== 'undefined' && USE_MOCK_DATA) {
    const approvals = JSON.parse(localStorage.getItem("medsift_approvals") || "[]") as number[];
    const mockIds = MOCK_VISITS.map(v => v.id);
    const newApprovals = [...new Set([...approvals, ...mockIds])];
    localStorage.setItem("medsift_approvals", JSON.stringify(newApprovals));
    // Clear pending for mock data
    localStorage.setItem("medsift_pending", JSON.stringify([]));
  }
}

export async function getVisits(params?: {
  search?: string;
  tag?: string;
  sort?: string;
  page?: number;
}): Promise<VisitRecord[]> {
  if (USE_MOCK_DATA) {
    // Auto-approve mock visits for demo
    initMockApprovals();
    
    let visits = [...MOCK_VISITS];
    
    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      visits = visits.filter(v => 
        v.visit_type.toLowerCase().includes(search) ||
        v.tags?.some(t => t.toLowerCase().includes(search)) ||
        v.patient_summary?.visit_summary?.toLowerCase().includes(search)
      );
    }
    
    // Apply tag filter
    if (params?.tag) {
      visits = visits.filter(v => v.tags?.includes(params.tag!));
    }
    
    // Apply sort
    if (params?.sort === "date") {
      visits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
    } else if (params?.sort === "risk") {
      visits.sort((a, b) => (b.risk_assessment?.risk_score ?? 0) - (a.risk_assessment?.risk_score ?? 0));
    }
    
    return visits;
  }
  
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page) qs.set("page", String(params.page));
  return request<VisitRecord[]>(`/api/visits${qs.toString() ? `?${qs}` : ""}`);
}

export async function getVisit(id: number): Promise<VisitRecord> {
  if (USE_MOCK_DATA) {
    const visit = MOCK_VISITS.find(v => v.id === id);
    if (!visit) throw new Error("Visit not found");
    return visit;
  }
  return request<VisitRecord>(`/api/visits/${id}`);
}

export async function deleteVisit(id: number): Promise<void> {
  await request<void>(`/api/visits/${id}`, { method: "DELETE" });
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
export async function exportPDF(visitId: number): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/export/${visitId}/pdf`);
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

export function downloadPDF(blob: Blob, filename = "after-visit-summary.pdf") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Trials & Literature ──────────────────────────────────────────────────────
export async function getTrials(visitId: number): Promise<ClinicalTrial[]> {
  if (USE_MOCK_DATA) {
    return MOCK_TRIALS;
  }
  return request<ClinicalTrial[]>(`/api/trials/${visitId}`);
}

export async function getLiterature(
  visitId: number,
  refresh = false
): Promise<LiteratureResult[]> {
  if (USE_MOCK_DATA) {
    return MOCK_LITERATURE;
  }
  return request<LiteratureResult[]>(
    `/api/literature/${visitId}${refresh ? "?refresh=true" : ""}`
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export async function submitFeedback(
  payload: Omit<FeedbackItem, "feedback_id" | "timestamp">
): Promise<{ feedback_id: number; message: string }> {
  return request("/api/feedback", { method: "POST", body: JSON.stringify(payload) });
}

export async function getFeedback(visitId: number): Promise<FeedbackItem[]> {
  return request<FeedbackItem[]>(`/api/feedback/${visitId}`);
}

export async function getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
  return request<FeedbackAnalytics>("/api/feedback/analytics");
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getAnalytics(): Promise<AnalyticsSummary> {
  if (USE_MOCK_DATA) {
    return MOCK_ANALYTICS;
  }
  return request<AnalyticsSummary>("/api/analytics");
}

// ─── Grounding (placeholder for future feature) ──────────────────────────────
export async function getGrounding(visitId: number): Promise<any[]> {
  // Placeholder - returns empty array for now
  return [];
}