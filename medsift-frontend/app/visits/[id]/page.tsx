"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  getVisit, submitFeedback, exportPDF, downloadPDF, getLiterature, getTrials
} from "@/lib/api";
import {
  ArrowLeft, Download, BookOpen, CheckCircle2, XCircle,
  ThumbsUp, ThumbsDown, AlertTriangle, Calendar, Clock,
  ShieldCheck, Bell
} from "lucide-react";
import { toast } from "sonner";
import type { VisitRecord, LiteratureResult, ClinicalTrial, AuthUser } from "@/types";

const RISK_COLOR: Record<string, string> = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  high: "text-red-600 bg-red-50 border-red-200",
};

function EmptyField({ label }: { label: string }) {
  return (
    <p>
      <strong>{label}:</strong>{" "}
      <span className="text-red-500 italic font-medium border border-red-200 bg-red-50 rounded px-1.5 py-0.5 text-xs">
        Not provided
      </span>
    </p>
  );
}

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const visitId = Number(id);
  const [visit, setVisit] = useState<VisitRecord | null>(null);
  const [literature, setLiterature] = useState<LiteratureResult[]>([]);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"patient" | "soap" | "risk" | "research" | "transcript">("patient");
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect" | "relevant" | "not_relevant">>({});
  const [exportLoading, setExportLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    if (stored) setUser(JSON.parse(stored));

    // Load approval status
    const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
    const approved = JSON.parse(localStorage.getItem("medsift_approvals") || "[]") as number[];
    setIsPending(pending.includes(visitId));
    // Treat old visits (not in pending and not in approved) as approved by default
    setIsApproved(approved.includes(visitId) || !pending.includes(visitId));

    async function load() {
      try {
        const [v, lit, tri] = await Promise.all([
          getVisit(visitId),
          getLiterature(visitId).catch(() => []),
          getTrials(visitId).catch(() => []),
        ]);
        setVisit(v);
        setLiterature(lit);
        setTrials(tri);
      } catch {
        router.push("/visits");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [visitId, router]);

  const isClinician = user?.role === "clinician";

  const approveVisit = () => {
    const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
    const approved = JSON.parse(localStorage.getItem("medsift_approvals") || "[]") as number[];
    const newApproved = [...approved, visitId];
    const newPending = pending.filter(id => id !== visitId);
    localStorage.setItem("medsift_approvals", JSON.stringify(newApproved));
    localStorage.setItem("medsift_pending", JSON.stringify(newPending));
    setIsApproved(true);
    setIsPending(false);
    toast.success("Visit approved — now visible in patient portal");
  };

  const sendFeedback = async (
    key: string,
    itemType: string,
    itemValue: string,
    rating: string,
    feedbackType: "extraction_accuracy" | "literature_relevance",
    paperUrl?: string
  ) => {
    setFeedback(f => ({ ...f, [key]: rating as never }));
    try {
      await submitFeedback({ visit_id: visitId, feedback_type: feedbackType, item_type: itemType, item_value: itemValue, rating: rating as never, paper_url: paperUrl });
      toast.success("Feedback recorded");
    } catch {
      toast.error("Feedback failed");
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const blob = await exportPDF(visitId);
      downloadPDF(blob, `visit-${visitId}-summary.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!visit) return null;

  const riskStyle = RISK_COLOR[visit.risk_assessment?.risk_level ?? "low"];
  const tabs = [
    { key: "patient", label: "Patient Summary" },
    { key: "soap", label: "SOAP Note" },
    { key: "risk", label: "Risk Assessment" },
    { key: "research", label: "Research" },
    { key: "transcript", label: "Transcript" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <Link href="/visits">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold capitalize">{visit.visit_type}</h1>
              {isPending && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending Approval</Badge>
              )}
              {isApproved && !isPending && (
                <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Approved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
                {new Date(visit.visit_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {visit.audio_duration_seconds && (
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{(visit.audio_duration_seconds/60).toFixed(1)} min</span>
              )}
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {visit.tags?.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {visit.risk_assessment && (
            <div className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${riskStyle}`}>
              Risk {visit.risk_assessment.risk_score}/100 · {visit.risk_assessment.risk_level.toUpperCase()}
            </div>
          )}
          {/* Patient: prominent Save PDF button */}
          {!isClinician && (
            <Button onClick={handleExport} disabled={exportLoading} className="gap-2 bg-primary text-white">
              <Download className="h-4 w-4" />{exportLoading ? "Generating…" : "Save My Summary (PDF)"}
            </Button>
          )}
          {/* Clinician: PDF + Research buttons */}
          {isClinician && (
            <>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exportLoading} className="gap-1.5">
                <Download className="h-4 w-4" />{exportLoading ? "…" : "PDF"}
              </Button>
              <Link href={`/literature/${visitId}`}>
                <Button size="sm" className="gap-1.5"><BookOpen className="h-4 w-4" /> Research</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Clinician approval banner */}
      {isClinician && isPending && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-300">
          <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">This visit needs your approval</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Review the summary below, then approve to make it visible in the patient portal.
            </p>
          </div>
          <Button onClick={approveVisit} className="bg-green-600 hover:bg-green-700 text-white gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4" /> Approve &amp; Release
          </Button>
        </div>
      )}

      {/* Patient: not yet approved notice */}
      {!isClinician && isPending && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border bg-blue-50 border-blue-200">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800">Summary under review</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Your clinician is reviewing this visit summary. It will be fully available once approved.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px shrink-0 transition-colors ${
              activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Patient Summary ───────────────────────────────────── */}
      {activeTab === "patient" && visit.patient_summary && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Visit Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed">{visit.patient_summary.visit_summary}</p></CardContent>
          </Card>

          {/* Medications with feedback */}
          {(visit.patient_summary.medications?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">💊 Medications</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {visit.patient_summary.medications?.map((med, i) => {
                  const key = `med-${i}`;
                  return (
                    <div key={i} className="py-3 flex items-start justify-between gap-3">
                      <div className="text-sm flex-1">
                        <p className="font-semibold">{med.name} <span className="font-normal text-muted-foreground">· {med.dose} · {med.frequency}</span></p>
                        {med.instructions && <p className="text-muted-foreground text-xs mt-0.5">{med.instructions}</p>}
                        {med.evidence && <p className="text-xs text-blue-600 italic mt-1">"{med.evidence}"</p>}
                      </div>
                      {isClinician && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => sendFeedback(key, "medication", `${med.name} ${med.dose}`, "correct", "extraction_accuracy")}
                            className={`p-1.5 rounded-lg border transition-colors ${feedback[key] === "correct" ? "bg-green-100 border-green-400 text-green-600" : "hover:bg-green-50 text-muted-foreground"}`}
                            title="Mark as correct"><CheckCircle2 className="h-4 w-4" /></button>
                          <button onClick={() => sendFeedback(key, "medication", `${med.name} ${med.dose}`, "incorrect", "extraction_accuracy")}
                            className={`p-1.5 rounded-lg border transition-colors ${feedback[key] === "incorrect" ? "bg-red-100 border-red-400 text-red-600" : "hover:bg-red-50 text-muted-foreground"}`}
                            title="Mark as incorrect"><XCircle className="h-4 w-4" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Tests */}
          {(visit.patient_summary.tests_ordered?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">🔬 Tests Ordered</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {visit.patient_summary.tests_ordered?.map((t, i) => {
                  const key = `test-${i}`;
                  return (
                    <div key={i} className="flex items-start justify-between border rounded-lg p-3">
                      <div className="text-sm">
                        <p className="font-semibold">{t.test_name}</p>
                        <p className="text-muted-foreground text-xs">{t.instructions} · {t.timeline}</p>
                      </div>
                      {isClinician && (
                        <div className="flex gap-1">
                          <button onClick={() => sendFeedback(key, "test_ordered", t.test_name, "correct", "extraction_accuracy")}
                            className={`p-1.5 rounded-lg border ${feedback[key] === "correct" ? "bg-green-100 border-green-400 text-green-600" : "text-muted-foreground hover:bg-green-50"}`}>
                            <CheckCircle2 className="h-4 w-4" /></button>
                          <button onClick={() => sendFeedback(key, "test_ordered", t.test_name, "incorrect", "extraction_accuracy")}
                            className={`p-1.5 rounded-lg border ${feedback[key] === "incorrect" ? "bg-red-100 border-red-400 text-red-600" : "text-muted-foreground hover:bg-red-50"}`}>
                            <XCircle className="h-4 w-4" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Follow-up checklist */}
          {(visit.patient_summary.follow_up_plan?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">📅 Follow-up Plan</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {visit.patient_summary.follow_up_plan?.map((fu, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <span>{fu.action}</span>
                      {fu.date_or_timeline && <span className="text-muted-foreground ml-2">· {fu.date_or_timeline}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Red flags */}
          {(visit.patient_summary.red_flags_for_patient?.length ?? 0) > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> When to Seek Urgent Care</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {visit.patient_summary.red_flags_for_patient?.map((rf, i) => (
                  <p key={i} className="text-sm text-red-700">• {rf.warning}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Q&A */}
          {(visit.patient_summary.questions_and_answers?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">💬 Questions & Answers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {visit.patient_summary.questions_and_answers?.map((qa, i) => (
                  <div key={i} className="border rounded-lg p-3 text-sm">
                    <p className="font-semibold text-primary">Q: {qa.question}</p>
                    <p className="mt-1 text-muted-foreground">A: {qa.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Patient PDF save button at bottom */}
          {!isClinician && (
            <div className="pt-2">
              <Button onClick={handleExport} disabled={exportLoading} size="lg" className="w-full gap-2 bg-primary text-white">
                <Download className="h-5 w-5" />
                {exportLoading ? "Generating PDF…" : "Download My Visit Summary (PDF)"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">Save a copy of your visit summary for your records.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SOAP Note ─────────────────────────────────────────── */}
      {activeTab === "soap" && visit.clinician_note && (
        <div className="space-y-4">
          {(["subjective", "objective", "assessment", "plan"] as const).map(section => {
            const data = visit.clinician_note!.soap_note[section];

            // Define expected fields per section
            const sectionFields: { label: string; val: string | undefined | null }[] = {
              subjective: [
                { label: "CC", val: data.chief_complaint },
                { label: "HPI", val: data.history_of_present_illness },
                { label: "ROS", val: data.review_of_systems },
              ],
              objective: [
                { label: "Vitals", val: data.vitals },
                { label: "PE", val: data.physical_exam_findings },
              ],
              assessment: [
                { label: "Diagnoses", val: data.diagnoses?.join(", ") },
                { label: "Impression", val: data.clinical_impression },
              ],
              plan: [
                { label: "Follow-up", val: data.follow_up },
                { label: "Education", val: data.patient_education },
              ],
            }[section];

            const hasAnyContent = sectionFields.some(f => f.val && f.val.trim() !== "");

            return (
              <Card key={section} className={!hasAnyContent ? "border-red-200 bg-red-50/30" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    {section === "subjective" ? "S — Subjective" : section === "objective" ? "O — Objective" : section === "assessment" ? "A — Assessment" : "P — Plan"}
                    {!hasAnyContent && (
                      <span className="text-red-500 text-[10px] font-bold normal-case tracking-normal border border-red-300 bg-red-100 rounded px-1.5">
                        No data extracted
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {sectionFields.map(({ label, val }) =>
                    val ? (
                      <p key={label}><strong>{label}:</strong> {val}</p>
                    ) : (
                      <EmptyField key={label} label={label} />
                    )
                  )}
                  {data.evidence && data.evidence.length > 0 && (
                    <div className="text-xs text-blue-600 italic border-t pt-2 space-y-0.5">
                      {data.evidence.slice(0, 3).map((e, i) => <p key={i}>"{e}"</p>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {(visit.clinician_note.problem_list?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Problem List</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {visit.clinician_note.problem_list?.map((p, i) => <Badge key={i} variant="secondary">{p}</Badge>)}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Risk Assessment ───────────────────────────────────── */}
      {activeTab === "risk" && visit.risk_assessment && (
        <div className="space-y-4">
          <Card className={`border ${riskStyle}`}>
            <CardContent className="pt-6 flex items-center gap-6">
              <div className="text-center min-w-[80px]">
                <div className="text-6xl font-black" style={{ color: visit.risk_assessment.risk_level === "high" ? "#dc2626" : visit.risk_assessment.risk_level === "medium" ? "#d97706" : "#16a34a" }}>
                  {visit.risk_assessment.risk_score}
                </div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
              <Separator orientation="vertical" className="h-16" />
              <div>
                <p className="text-xl font-bold capitalize" style={{ color: visit.risk_assessment.risk_level === "high" ? "#dc2626" : visit.risk_assessment.risk_level === "medium" ? "#d97706" : "#16a34a" }}>
                  {visit.risk_assessment.risk_level} Risk
                </p>
                <p className="text-sm text-muted-foreground">{visit.risk_assessment.total_factors_detected} factors detected</p>
                <p className="text-xs text-muted-foreground mt-1">⚠️ Not a medical diagnosis — highlights only what was discussed.</p>
              </div>
            </CardContent>
          </Card>

          {(visit.risk_assessment.red_flags?.length ?? 0) > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">🚨 Red Flags</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {visit.risk_assessment.red_flags?.map((rf, i) => (
                  <div key={i} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <p className="text-sm font-semibold text-red-700">{rf.flag}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rf.recommended_action}</p>
                    {rf.evidence && <p className="text-xs text-blue-600 italic mt-1">"{rf.evidence}"</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Factor Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {visit.risk_assessment.risk_factors?.map((rf, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex-1">{rf.factor}</span>
                  <Badge variant="outline" className="shrink-0">+{rf.points} pts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Research ─────────────────────────────────────────── */}
      {activeTab === "research" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-sm mb-3">📚 Published Research</h2>
            {literature.length === 0 ? (
              <p className="text-sm text-muted-foreground">No papers found. <Link href={`/literature/${visitId}`} className="text-primary underline">Refresh search →</Link></p>
            ) : (
              <div className="space-y-3">
                {literature.slice(0, 5).map((p, i) => {
                  const key = `paper-${p.paper_id}`;
                  return (
                    <Card key={i} className="p-4">
                      <p className="font-semibold text-sm leading-snug mb-1">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{p.title}</a>
                      </p>
                      <p className="text-xs text-muted-foreground">{p.authors.slice(0,2).join(", ")} · {p.year} · {p.journal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.citation_count} citations</p>
                      {isClinician && (
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => sendFeedback(key, "paper", p.title, "relevant", "literature_relevance", p.url)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${feedback[key] === "relevant" ? "bg-green-100 border-green-400 text-green-700" : "text-muted-foreground hover:bg-green-50"}`}>
                            <ThumbsUp className="h-3 w-3" /> Relevant</button>
                          <button onClick={() => sendFeedback(key, "paper", p.title, "not_relevant", "literature_relevance", p.url)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors ${feedback[key] === "not_relevant" ? "bg-red-100 border-red-400 text-red-700" : "text-muted-foreground hover:bg-red-50"}`}>
                            <ThumbsDown className="h-3 w-3" /> Not relevant</button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-sm mb-3">🔬 Clinical Trials</h2>
            {trials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trials found.</p>
            ) : (
              <div className="space-y-3">
                {trials.map((t, i) => (
                  <Card key={i} className="p-4">
                    <p className="font-semibold text-sm leading-snug mb-1">
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{t.brief_title}</a>
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] mb-2">{t.status}</Badge>
                    <p className="text-xs text-muted-foreground">{t.conditions?.slice(0,3).join(", ")}</p>
                    {t.why_it_matches && <p className="text-xs text-blue-600 mt-1">{t.why_it_matches}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Transcript ───────────────────────────────────────── */}
      {activeTab === "transcript" && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground max-h-[60vh] overflow-y-auto">
              {visit.raw_transcript || "No transcript available."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
