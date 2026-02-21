"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, User, ArrowRight, ShieldCheck, Mic, FileText, Activity, FlaskConical } from "lucide-react";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; name: string }> = {
  clinician: { email: "dr.smith@hospital.org", password: "demo1234", name: "Dr. Smith" },
  patient:   { email: "patient@example.com",   password: "demo1234", name: "Alex Johnson" },
};

const capabilities = [
  { icon: Mic,          label: "Transcribe audio with Whisper" },
  { icon: ShieldCheck,  label: "Redact PHI with Presidio" },
  { icon: FileText,     label: "Generate SOAP notes with LLaMA 3" },
  { icon: Activity,     label: "Score patient risk in seconds" },
  { icon: FlaskConical, label: "Find relevant clinical trials & research" },
];

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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: "linear-gradient(145deg,#060f24 0%,#0a1f4a 40%,#061a12 100%)" }}
    >
      {/* Background decorations */}
      <svg aria-hidden className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <polyline points="0,280 60,280 80,230 100,330 120,190 140,320 180,280 350,280 600,280 900,280 1440,280"
          stroke="#29b6f6" strokeOpacity="0.12" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <polyline points="0,500 200,500 230,470 250,530 270,450 290,500 500,500 900,500 1440,500"
          stroke="#00c853" strokeOpacity="0.06" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {[[60,80],[300,160],[700,90],[1100,140],[1350,70]].map(([x,y],i)=>(
          <g key={i} opacity="0.08" transform={`translate(${x},${y})`}>
            <rect x="-3" y="-10" width="6" height="20" rx="2" fill="#29b6f6"/>
            <rect x="-10" y="-3" width="20" height="6" rx="2" fill="#29b6f6"/>
          </g>
        ))}
        <circle cx="15%" cy="30%" r="200" fill="#1565c0" fillOpacity="0.04"/>
        <circle cx="85%" cy="70%" r="240" fill="#00c853" fillOpacity="0.03"/>
      </svg>

      {/* Main card */}
      <div className="relative w-full max-w-4xl grid lg:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}>

        {/* ── Left branding panel ── */}
        <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-between relative"
          style={{ background: "linear-gradient(180deg,#0d2352 0%,#0a1628 100%)" }}>
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(41,182,246,0.08) 0%,transparent 70%)" }} />

          <div className="relative">
            {/* Logo */}
            <div className="relative w-[160px] h-[48px] mb-8">
              <Image
                src="/logo.png"
                alt="MedSift AI"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            <h2 className="text-2xl font-black text-white leading-tight mb-3">
              AI that listens.
              <br />
              <span style={{ background: "linear-gradient(90deg,#29b6f6,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Intelligence that surfaces.
              </span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#6a9ab8" }}>
              Turn patient-doctor conversations into structured care plans — locally, privately, instantly.
            </p>

            <div className="space-y-2.5">
              {capabilities.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs" style={{ color: "#8cb8d4" }}>
                  <div className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(41,182,246,0.1)" }}>
                    <item.icon className="h-3 w-3" style={{ color: "#29b6f6" }} />
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] mt-8" style={{ color: "#4a7a94" }}>
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: "#00c853" }} />
            100% local · No cloud · No API costs · HIPAA-aware
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="lg:col-span-3 bg-white p-8 lg:p-10 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="relative w-[140px] h-[42px]">
              <Image
                src="/logo.png"
                alt="MedSift AI"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl border bg-slate-50 p-1 gap-1 mb-6">
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

          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {role === "clinician" ? "Clinician Sign In" : "Patient Sign In"}
            </h3>
            <p className="text-sm text-slate-500">
              {role === "clinician"
                ? "Access the full clinical pipeline, SOAP notes, and analytics."
                : "View your visit summaries and care plans."}
            </p>
          </div>

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
                className="bg-slate-50 h-11"
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
                className="bg-slate-50 h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2 h-11 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : (
                <><ArrowRight className="h-4 w-4" /> Sign In</>
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <strong>Demo credentials pre-filled.</strong> Use any email + any password to sign in.
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link href="/" className="underline hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
