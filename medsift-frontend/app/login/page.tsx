"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stethoscope, User, ArrowRight, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; name: string }> = {
  clinician: { email: "dr.smith@hospital.org", password: "demo1234", name: "Dr. Smith" },
  patient:   { email: "patient@example.com",   password: "demo1234", name: "Alex Johnson" },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<UserRole>((params.get("role") as UserRole) ?? "clinician");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill demo credentials when role changes
  useEffect(() => {
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
  }, [role]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulated auth — accept any email/password (hackathon demo)
    setTimeout(() => {
      const name = email.includes("dr.") || role === "clinician"
        ? "Dr. " + email.split("@")[0].replace("dr.", "").replace(".", " ")
        : email.split("@")[0].replace(".", " ");

      const user = { name, email, role };
      localStorage.setItem("medsift_user", JSON.stringify(user));
      toast.success(`Welcome, ${user.name}!`);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* ── Left panel: branding ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between text-white p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#0a1628 0%,#0d2352 55%,#0a2a1a 100%)" }}>
        {/* Healthcare SVG bg elements */}
        <svg aria-hidden className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <polyline points="0,280 60,280 80,230 100,330 120,190 140,320 180,280 350,280 600,280" stroke="#29b6f6" strokeOpacity="0.18" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {[[40,60],[200,140],[80,350],[300,420],[440,100],[500,320]].map(([x,y],i)=>(
            <g key={i} opacity="0.1" transform={`translate(${x},${y})`}>
              <rect x="-3" y="-10" width="6" height="20" rx="2" fill="#29b6f6"/>
              <rect x="-10" y="-3" width="20" height="6" rx="2" fill="#29b6f6"/>
            </g>
          ))}
          <ellipse cx="80%" cy="20%" rx="180" ry="180" fill="#00c853" fillOpacity="0.04"/>
          <ellipse cx="10%" cy="70%" rx="140" ry="140" fill="#1565c0" fillOpacity="0.06"/>
        </svg>
        {/* Inline SVG wordmark — no white box */}
        <div className="relative flex items-center gap-2">
          <svg viewBox="0 0 56 56" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#29b6f6"/><stop offset="100%" stopColor="#1565c0"/></linearGradient>
              <linearGradient id="lf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#26c6da"/><stop offset="100%" stopColor="#00c853"/></linearGradient>
            </defs>
            <rect x="4" y="10" width="12" height="36" rx="3" fill="url(#lc)" opacity="0.9"/>
            <rect x="0" y="22" width="20" height="12" rx="3" fill="url(#lc)" opacity="0.9"/>
            <polygon points="12,12 34,12 28,28 18,28" fill="url(#lf)" opacity="0.9"/>
            <rect x="18" y="28" width="10" height="10" rx="2" fill="url(#lf)" opacity="0.9"/>
            <rect x="22" y="4"  width="6" height="6" rx="1.5" fill="#00c853" opacity="0.9"/>
            <rect x="30" y="2"  width="4" height="4" rx="1"   fill="#29b6f6" opacity="0.8"/>
            <polyline points="0,48 8,48 11,42 14,52 17,38 20,48 38,48 52,48" stroke="#29b6f6" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
          <span className="font-black italic text-2xl tracking-tight">
            <span style={{background:"linear-gradient(90deg,#29b6f6,#1565c0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Med</span>
            <span style={{background:"linear-gradient(90deg,#43a047,#00c853)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Sift</span>
          </span>
          <span className="font-black text-white px-2 py-0.5 rounded-lg text-sm" style={{background:"#1a237e"}}>AI</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-black leading-tight">
            AI that listens.<br />
            <span className="gradient-text">Intelligence that surfaces.</span>
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-sm">
            Turn patient-doctor conversations into structured care plans, SOAP notes,
            and clinical research — locally, privately, instantly.
          </p>

          <div className="space-y-3 pt-4">
            {[
              { icon: "🎙️", label: "Transcribe audio with Whisper" },
              { icon: "🛡️", label: "Redact PHI with Presidio" },
              { icon: "📋", label: "Generate SOAP notes with LLaMA 3" },
              { icon: "⚡", label: "Score patient risk in seconds" },
              { icon: "📚", label: "Find relevant clinical trials & research" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
          100% local · No cloud · No API costs · HIPAA-aware
        </div>
      </div>

      {/* ── Right panel: login form ───────────────────────────── */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <span className="font-black italic text-2xl tracking-tight">
              <span style={{background:"linear-gradient(90deg,#29b6f6,#1565c0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Med</span>
              <span style={{background:"linear-gradient(90deg,#43a047,#00c853)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Sift</span>
            </span>
            <span className="font-black text-white px-2 py-0.5 rounded-lg text-sm" style={{background:"#1a237e"}}>AI</span>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl border bg-white p-1 gap-1 shadow-sm">
            <button
              onClick={() => setRole("clinician")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === "clinician"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="h-4 w-4" /> Clinician
            </button>
            <button
              onClick={() => setRole("patient")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === "patient"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" /> Patient
            </button>
          </div>

          <Card className="shadow-md border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {role === "clinician" ? "Clinician Sign In" : "Patient Sign In"}
              </CardTitle>
              <CardDescription>
                {role === "clinician"
                  ? "Access the full clinical pipeline, SOAP notes, and analytics."
                  : "View your visit summaries and care plans."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-slate-50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 mt-2"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : (
                    <><ArrowRight className="h-4 w-4" /> Sign In</>
                  )}
                </Button>
              </form>

              {/* Demo hint */}
              <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                <strong>Demo credentials pre-filled.</strong> Use any email + any password to sign in.
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="underline hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
