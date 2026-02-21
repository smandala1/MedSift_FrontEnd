"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalytics, getFeedbackAnalytics } from "@/lib/api";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { toast } from "sonner";
import type { AnalyticsSummary, FeedbackAnalytics } from "@/types";

const RISK_COLORS = { low: "#16a34a", medium: "#d97706", high: "#dc2626" };
const CHART_COLORS = ["#1565c0", "#0d9488", "#0288d1", "#00c853", "#7b1fa2", "#e65100"];

function StatCard({ label, value, sub, color = "text-primary" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [a, fa] = await Promise.all([
          getAnalytics(),
          getFeedbackAnalytics().catch(() => null),
        ]);
        setAnalytics(a);
        setFeedbackAnalytics(fa);
      } catch {
        // backend not running — show empty state silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  if (!analytics) return (
    <div className="text-center py-24 text-muted-foreground">
      <p>No analytics data available yet.</p>
      <p className="text-sm mt-2">Process some visits first.</p>
    </div>
  );

  const riskData = [
    { name: "Low", value: analytics.risk_distribution.low, fill: RISK_COLORS.low },
    { name: "Medium", value: analytics.risk_distribution.medium, fill: RISK_COLORS.medium },
    { name: "High", value: analytics.risk_distribution.high, fill: RISK_COLORS.high },
  ];

  const accuracyByType = feedbackAnalytics
    ? Object.entries(feedbackAnalytics.accuracy_by_item_type).map(([type, rate]) => ({
        type: type.replace("_", " "),
        accuracy: Math.round(rate * 100),
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Aggregated insights across all visits and feedback.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Visits" value={analytics.total_visits} />
        <StatCard
          label="Avg Risk Score"
          value={analytics.avg_risk_score?.toFixed(0) ?? "—"}
          color={analytics.avg_risk_score > 60 ? "text-red-600" : analytics.avg_risk_score > 30 ? "text-amber-600" : "text-green-600"}
        />
        {feedbackAnalytics && (
          <>
            <StatCard
              label="Extraction Accuracy"
              value={`${(feedbackAnalytics.extraction_accuracy_rate * 100).toFixed(0)}%`}
              sub={`${feedbackAnalytics.total_feedback_count} feedback items`}
              color="text-primary"
            />
            <StatCard
              label="Literature Relevance"
              value={`${(feedbackAnalytics.literature_relevance_rate * 100).toFixed(0)}%`}
              color="text-teal-600"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Distribution Donut */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Risk Level Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Conditions */}
        {analytics.top_conditions?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Top Conditions</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.top_conditions.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="condition" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Visits over time */}
        {analytics.visits_over_time?.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Visits Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={analytics.visits_over_time}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Extraction accuracy by type */}
        {accuracyByType.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Extraction Accuracy by Item Type</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={accuracyByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {accuracyByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Boosted keywords table */}
      {analytics.top_boosted_keywords?.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-sm">🚀 Top Boosted Keywords (Learning Loop)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="pb-2 pr-4">Keyword</th>
                    <th className="pb-2 pr-4">👍 Positive</th>
                    <th className="pb-2 pr-4">👎 Negative</th>
                    <th className="pb-2">Boost Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analytics.top_boosted_keywords.map((kw, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 font-medium">{kw.keyword}</td>
                      <td className="py-2 pr-4 text-green-600">{kw.positive_count}</td>
                      <td className="py-2 pr-4 text-red-500">{kw.negative_count}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary/20 w-24 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(kw.boost_score * 100).toFixed(0)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{(kw.boost_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Keywords with high boost scores are automatically prioritised in future literature searches for similar patient conditions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top-rated papers */}
      {(feedbackAnalytics?.most_relevant_papers?.length ?? 0) > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-sm">⭐ Most Relevant Papers (from Feedback)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {feedbackAnalytics?.most_relevant_papers?.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b last:border-0 text-sm">
                <span className="flex-1 font-medium">{p.title}</span>
                <span className="text-green-600 font-semibold shrink-0">{p.positive_votes}/{p.total_votes} 👍</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
