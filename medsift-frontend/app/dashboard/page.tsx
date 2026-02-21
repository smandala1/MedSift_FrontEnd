"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getVisits, getAnalytics } from "@/lib/api";
import {
  Plus, Activity, FileText, BarChart3, BookOpen,
  Calendar, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2,
  Mic, Clock, Pill, FlaskConical, Bell
} from "lucide-react";
import type { VisitRecord, AnalyticsSummary, AuthUser } from "@/types";
import { toast } from "sonner";

const RISK_COLOR: Record<string, string> = {
  low: "text-green-600 bg-green-100",
  medium: "text-amber-600 bg-amber-100",
  high: "text-red-600 bg-red-100",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored) as AuthUser;
    setUser(u);

    // Load approval state
    const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
    const approved = JSON.parse(localStorage.getItem("medsift_approvals") || "[]") as number[];
    setPendingIds(pending);
    setApprovedIds(approved);

    async function load() {
      try {
        const [v, a] = await Promise.all([
          getVisits({ sort: "date" }),
          getAnalytics().catch(() => null),
        ]);
        setVisits(v);
        setAnalytics(a);
      } catch {
        // no-op — visits may be empty on first run
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const isClinician = user?.role === "clinician";

  // For patients: only show approved visits (or visits not in pending = old visits treated as approved)
  const visibleVisits = isClinician
    ? visits
    : visits.filter(v => approvedIds.includes(v.id) || !pendingIds.includes(v.id));

  const recentVisits = visibleVisits.slice(0, 5);
  const highRiskCount = visits.filter(v => v.risk_assessment?.risk_level === "high").length;

  const approveVisit = (visitId: number) => {
    const newApproved = [...approvedIds, visitId];
    const newPending = pendingIds.filter(id => id !== visitId);
    setApprovedIds(newApproved);
    setPendingIds(newPending);
    localStorage.setItem("medsift_approvals", JSON.stringify(newApproved));
    localStorage.setItem("medsift_pending", JSON.stringify(newPending));
    toast.success("Visit approved — now visible in patient portal");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {loading ? "Loading…" : `Welcome back, ${user?.name?.split(" ")[0] ?? "User"}`}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {isClinician ? "Here's your clinical overview." : "Here's your health summary."}
        </p>
      </div>

      {/* Pending approvals banner (clinician only) */}
      {isClinician && pendingIds.length > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-300">
          <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              {pendingIds.length} visit{pendingIds.length > 1 ? "s" : ""} awaiting your approval
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Review and approve these summaries before patients can view them in their portal.
            </p>
          </div>
          <Link href="/visits">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5">
              Review <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {/* New Recording — clinician only */}
        {isClinician && (
          <Link href="/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer bg-primary text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Plus className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">New Recording</p>
                  <p className="text-xs text-white/70">Upload audio</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Live Recording — clinician only */}
        {isClinician && (
          <Link href="/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Mic className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-red-700">Live Record</p>
                  <p className="text-xs text-red-500">Record consultation</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/visits">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-sm">{isClinician ? "Visits" : "My Visits"}</p>
                <p className="text-xs text-muted-foreground">View history</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {isClinician && (
          <Link href="/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-teal-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Analytics</p>
                  <p className="text-xs text-muted-foreground">Insights & trends</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main: recent visits */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">
              {isClinician ? "Recent Visits" : "My Recent Visits"}
            </h2>
            <Link href="/visits" className="text-xs text-primary hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : recentVisits.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                {isClinician ? (
                  <>
                    <p className="text-muted-foreground text-sm mb-4">No visits yet.</p>
                    <Link href="/upload"><Button size="sm">Upload First Recording</Button></Link>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm mb-2">No approved visit summaries yet.</p>
                    <p className="text-xs text-muted-foreground">Your clinician will approve your summaries before they appear here.</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentVisits.map(visit => {
                const isPending = pendingIds.includes(visit.id);
                const firstMed = visit.patient_summary?.medications?.[0];
                const summary = visit.patient_summary?.visit_summary;

                return (
                  <Card key={visit.id} className={`transition-shadow cursor-pointer ${isPending ? "border-amber-300 bg-amber-50/50" : "hover:shadow-sm"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm capitalize">{visit.visit_type}</p>
                              {isPending && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[10px]">
                                  Pending Approval
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(visit.visit_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {visit.risk_assessment && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_COLOR[visit.risk_assessment.risk_level]}`}>
                              {visit.risk_assessment.risk_level.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Summary snippet */}
                      {summary && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 ml-12">{summary}</p>
                      )}

                      {/* Medications snippet */}
                      {firstMed && (
                        <div className="ml-12 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Pill className="h-3 w-3 text-blue-500" />
                          <span>{firstMed.name} {firstMed.dose}</span>
                          {(visit.patient_summary?.medications?.length ?? 0) > 1 && (
                            <span className="text-muted-foreground/60">+{(visit.patient_summary?.medications?.length ?? 1) - 1} more</span>
                          )}
                        </div>
                      )}

                      {/* Approve button for clinician */}
                      {isClinician && isPending && (
                        <div className="mt-3 ml-12 flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => { e.preventDefault(); approveVisit(visit.id); }}
                          >
                            <CheckCircle2 className="h-3 w-3" /> Approve & Release to Patient
                          </Button>
                          <Link href={`/visits/${visit.id}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              Review <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Navigate for non-pending */}
                      {!isPending && (
                        <Link href={`/visits/${visit.id}`} className="ml-12 mt-1 block">
                          <span className="text-xs text-primary hover:underline flex items-center gap-1">
                            View details <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: stats */}
        <div className="space-y-4">
          {analytics && (
            <>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Overview</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total visits</span>
                    <span className="font-bold">{analytics.total_visits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg risk score</span>
                    <span className="font-bold">{analytics.avg_risk_score?.toFixed(0) ?? "—"}/100</span>
                  </div>
                  {(analytics.extraction_accuracy_rate ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extraction accuracy</span>
                      <span className="font-bold text-green-600">{((analytics.extraction_accuracy_rate ?? 0) * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {isClinician && pendingIds.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Awaiting approval</span>
                      <span className="font-bold text-amber-600">{pendingIds.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Risk distribution */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Risk Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {(["low", "medium", "high"] as const).map(level => {
                    const count = analytics.risk_distribution[level] ?? 0;
                    const pct = analytics.total_visits > 0 ? (count / analytics.total_visits) * 100 : 0;
                    return (
                      <div key={level}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize text-muted-foreground">{level}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: level === "high" ? "#dc2626" : level === "medium" ? "#d97706" : "#16a34a"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}

          {/* Alerts */}
          {highRiskCount > 0 && isClinician && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">{highRiskCount} high-risk visit{highRiskCount > 1 ? "s" : ""}</p>
                  <p className="text-xs text-red-600 mt-0.5">Review red flags and action items.</p>
                  <Link href="/visits" className="text-xs text-red-700 underline mt-1 block">Review visits →</Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning loop status (clinician only) */}
          {analytics?.top_boosted_keywords && analytics.top_boosted_keywords.length > 0 && isClinician && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700">Learning loop active</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {analytics.top_boosted_keywords.length} keywords boosted from feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top conditions */}
          {analytics?.top_conditions && analytics.top_conditions.length > 0 && isClinician && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Top Conditions</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {analytics.top_conditions.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">{c.condition}</span>
                    <Badge variant="outline" className="text-xs ml-2">{c.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
