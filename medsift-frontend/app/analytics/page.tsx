"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── Fully self-contained dummy data (no backend, no risk scoring) ─────────────
const DUMMY = {
  total_visits: 847,

  weekly_visits: [
    { week: "Nov 3",  count: 31 },
    { week: "Nov 10", count: 36 },
    { week: "Nov 17", count: 29 },
    { week: "Nov 24", count: 18 },
    { week: "Dec 1",  count: 38 },
    { week: "Dec 8",  count: 41 },
    { week: "Dec 15", count: 44 },
    { week: "Dec 22", count: 22 },
    { week: "Dec 29", count: 15 },
    { week: "Jan 5",  count: 42 },
    { week: "Jan 12", count: 46 },
    { week: "Jan 19", count: 49 },
  ],

  top_conditions: [
    { condition: "Hypertension",                count: 187 },
    { condition: "Type 2 Diabetes",             count: 143 },
    { condition: "Hyperlipidemia",              count: 128 },
    { condition: "Anxiety / Depression",        count:  95 },
    { condition: "Low Back Pain",               count:  82 },
    { condition: "Upper Respiratory Infection", count:  76 },
    { condition: "Osteoarthritis",              count:  64 },
    { condition: "GERD",                        count:  58 },
  ],

  top_medications: [
    { medication: "Lisinopril",    count: 156 },
    { medication: "Metformin",     count: 134 },
    { medication: "Atorvastatin",  count: 121 },
    { medication: "Omeprazole",    count:  98 },
    { medication: "Amlodipine",    count:  87 },
    { medication: "Levothyroxine", count:  76 },
    { medication: "Sertraline",    count:  68 },
    { medication: "Gabapentin",    count:  54 },
  ],

  visit_types: [
    { type: "Follow-up",          count: 298 },
    { type: "Routine / Wellness", count: 241 },
    { type: "Urgent Care",        count: 163 },
    { type: "New Patient",        count:  87 },
    { type: "Telehealth",         count:  58 },
  ],

  extraction_accuracy: [
    { item_type: "Medications",      accuracy: 95.8, correct: 412, incorrect: 18 },
    { item_type: "Tests Ordered",    accuracy: 92.9, correct: 287, incorrect: 22 },
    { item_type: "Follow-up Plans",  accuracy: 96.1, correct: 341, incorrect: 14 },
    { item_type: "Red Flags",        accuracy: 86.5, correct: 198, incorrect: 31 },
    { item_type: "Lifestyle Advice", accuracy: 92.2, correct: 224, incorrect: 19 },
  ],

  top_boosted_keywords: [
    { keyword: "diabetes management",     positive_count: 45, negative_count: 3, boost_score: 87.5 },
    { keyword: "blood pressure control",  positive_count: 38, negative_count: 5, boost_score: 76.7 },
    { keyword: "medication adherence",    positive_count: 32, negative_count: 2, boost_score: 88.2 },
    { keyword: "lifestyle modifications", positive_count: 28, negative_count: 4, boost_score: 75.0 },
    { keyword: "follow-up care",          positive_count: 25, negative_count: 1, boost_score: 92.3 },
    { keyword: "chronic pain",            positive_count: 21, negative_count: 6, boost_score: 71.4 },
    { keyword: "mental health",           positive_count: 19, negative_count: 2, boost_score: 86.4 },
    { keyword: "preventive screening",    positive_count: 17, negative_count: 1, boost_score: 89.5 },
  ],
};

const PALETTE = ["#0ea5e9","#0284c7","#38bdf8","#7dd3fc","#0369a1","#bae6fd","#075985","#e0f2fe"];

function StatCard({ label, value, sub, color = "text-[#0ea5e9]" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief load
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
    </div>
  );

  const d = DUMMY;
  const avgAccuracy = (d.extraction_accuracy.reduce((s, r) => s + r.accuracy, 0) / d.extraction_accuracy.length).toFixed(1);
  const peakWeek    = d.weekly_visits.reduce((a, b) => b.count > a.count ? b : a);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Aggregated insights · Nov 2024 – Jan 2025</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
          Demo data
        </span>
      </div>

      {/* ── KPI stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Visits"    value={d.total_visits.toLocaleString()} sub="Nov 2024 – Jan 2025" />
        <StatCard label="Avg AI Accuracy" value={`${avgAccuracy}%`} sub="across extraction types" color="text-teal-600" />
        <StatCard label="Top Condition"   value="Hypertension" sub="187 visits" color="text-blue-700" />
        <StatCard label="Peak Week"       value={peakWeek.week} sub={`${peakWeek.count} visits`} color="text-violet-600" />
      </div>

      {/* ── Row 1: Visits Over Time + Visit Types ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Line chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Visits Over Time</CardTitle>
            <p className="text-xs text-gray-500">Weekly volume, Nov 2024 – Jan 2025</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={d.weekly_visits} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Line
                  type="monotone" dataKey="count" name="Visits"
                  stroke="#0ea5e9" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0ea5e9" }} activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visit types donut */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Visit Types</CardTitle>
            <p className="text-xs text-gray-500">Distribution by category</p>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={d.visit_types} dataKey="count" nameKey="type"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {d.visit_types.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {d.visit_types.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="text-gray-600 flex-1 truncate">{v.type}</span>
                  <span className="font-semibold text-gray-900">{v.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Top Conditions + Top Medications ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Top Conditions */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Top Conditions</CardTitle>
            <p className="text-xs text-gray-500">By frequency across all visits</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.top_conditions} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fill: "#374151" }}
                  width={118} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="Visits" radius={[0, 4, 4, 0]}>
                  {d.top_conditions.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Medications */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Top Medications</CardTitle>
            <p className="text-xs text-gray-500">Most frequently prescribed</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.top_medications} margin={{ left: -10, right: 10, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="medication" tick={{ fontSize: 9, fill: "#6b7280" }}
                  tickLine={false} angle={-35} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="Prescriptions" radius={[4, 4, 0, 0]}>
                  {d.top_medications.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Extraction Accuracy ── */}
      <Card className="border shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">AI Extraction Accuracy by Category</CardTitle>
          <p className="text-xs text-gray-500">Based on clinician feedback — correct vs. flagged extractions</p>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={d.extraction_accuracy} margin={{ left: -10, right: 10, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="item_type" tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false} angle={-20} textAnchor="end" interval={0} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]}>
                  {d.extraction_accuracy.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {d.extraction_accuracy.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{r.item_type}</span>
                    <span className="font-bold" style={{ color: PALETTE[i % PALETTE.length] }}>
                      {r.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${r.accuracy}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {r.correct} correct · {r.incorrect} flagged
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Boosted Keywords Table ── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">Top Boosted Keywords (Learning Loop)</CardTitle>
          <p className="text-xs text-gray-500">
            Keywords with high boost scores are automatically prioritised in future literature searches.
          </p>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-gray-500">
                <th className="pb-3 pr-4 font-medium">Keyword</th>
                <th className="pb-3 pr-4 font-medium">Positive</th>
                <th className="pb-3 pr-4 font-medium">Negative</th>
                <th className="pb-3 font-medium">Boost Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {d.top_boosted_keywords.map((kw, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900">{kw.keyword}</td>
                  <td className="py-3 pr-4 text-green-600 font-medium">{kw.positive_count}</td>
                  <td className="py-3 pr-4 text-red-500 font-medium">{kw.negative_count}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 rounded-full bg-gray-100 w-32 overflow-hidden">
                        <div className="h-full bg-[#0ea5e9] rounded-full"
                          style={{ width: `${kw.boost_score}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12">
                        {kw.boost_score.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}