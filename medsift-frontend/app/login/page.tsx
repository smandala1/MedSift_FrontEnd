"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope, User, ArrowRight, ShieldCheck,
  Eye, EyeOff, CheckSquare, Square, MessageSquare,
} from "lucide-react";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string; name: string }> = {
  clinician: { email: "dr.smith@hospital.org", password: "demo1234", name: "Dr. Smith" },
  patient:   { email: "patient@example.com",   password: "demo1234", name: "Alex Johnson" },
};

// Role-specific photo panel content
const PANEL_CONTENT: Record<UserRole, { photo: string; headline: string; tagline: string; badge: string }> = {
  clinician: {
    photo:    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    headline: "Better clinical intelligence, faster.",
    tagline:  "Turn patient-doctor conversations into structured SOAP notes, care plans, and risk scores — in seconds.",
    badge:    "Used at Hacklytics 2026 · Georgia Tech",
  },
  patient: {
    photo:    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&q=80",
    headline: "Your health, clearly explained.",
    tagline:  "Access your visit summaries, medication history, and follow-up reminders — all in one place.",
    badge:    "Private · Secure · Always yours",
  },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [role, setRole] = useState<UserRole>((params.get("role") as UserRole) ?? "clinician");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // shared fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  // sign-up extras
  const [name, setName]               = useState("");
  const [dob, setDob]                 = useState("");
  const [phone, setPhone]             = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [smsConsent, setSmsConsent]   = useState(false);

  const [loading, setLoading] = useState(false);

  // Pre-fill demo credentials on role/mode change
  useEffect(() => {
    if (mode === "signin") {
      setEmail(DEMO_ACCOUNTS[role].email);
      setPassword(DEMO_ACCOUNTS[role].password);
    } else {
      setEmail(""); setPassword(""); setName(""); setDob(""); setPhone(""); setConfirmPass("");
    }
  }, [role, mode]);

  // Clinicians always sign-in
  useEffect(() => {
    if (role === "clinician") setMode("signin");
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && password !== confirmPass) {
      toast.error("Passwords do not match"); return;
    }
    setLoading(true);
    setTimeout(() => {
      // Use demo account name if the email matches a known demo account
      const demoMatch = Object.values(DEMO_ACCOUNTS).find(
        d => d.email.toLowerCase() === email.toLowerCase()
      );
      const resolvedName = mode === "signup"
        ? name.trim() || email.split("@")[0]
        : demoMatch
          ? demoMatch.name
          : role === "clinician"
            ? "Dr. " + email.split("@")[0].replace("dr.", "").replace(/\./g, " ").trim()
            : email.split("@")[0].replace(/\./g, " ").trim();

      const userPayload: Record<string, unknown> = { name: resolvedName, email, role };
      if (mode === "signup" && phone) userPayload.phone = phone;
      if (mode === "signup") userPayload.sms_consent = smsConsent;
      localStorage.setItem("medsift_user", JSON.stringify(userPayload));
      toast.success(mode === "signup" ? `Account created! Welcome, ${resolvedName}!` : `Welcome back, ${resolvedName}!`);
      router.push("/dashboard");
    }, 800);
  };

  const handleGoogle = () => {
    toast.info("Google sign-in is not available in demo mode.", { description: "Use the email form to log in." });
  };

  const isPatient  = role === "patient";
  const showSignup = isPatient && mode === "signup";
  const panel      = PANEL_CONTENT[role];

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── LEFT: form panel ── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-12 relative z-10 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <svg viewBox="0 0 60 60" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#29b6f6"/><stop offset="100%" stopColor="#1565c0"/></linearGradient>
                <linearGradient id="lf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#26c6da"/><stop offset="100%" stopColor="#00c853"/></linearGradient>
              </defs>
              <rect x="5"  y="12" width="14" height="38" rx="4" fill="url(#lc)" opacity="0.95"/>
              <rect x="0"  y="24" width="24" height="14" rx="4" fill="url(#lc)" opacity="0.95"/>
              <polygon points="14,14 38,14 31,32 21,32" fill="url(#lf)" opacity="0.95"/>
              <rect x="21" y="32" width="10" height="12" rx="3" fill="url(#lf)" opacity="0.95"/>
              <polyline points="0,52 8,52 12,45 16,57 20,40 24,52 44,52 58,52" stroke="#29b6f6" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="font-black italic text-lg leading-none">
              <span style={{ background: "linear-gradient(90deg,#29b6f6,#1565c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Med</span>
              <span style={{ background: "linear-gradient(90deg,#43a047,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Sift</span>
              <span className="font-black text-white rounded-md px-1.5 py-0.5 text-xs ml-1" style={{ background: "#1a237e" }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {role === "clinician" ? "Clinician Sign In" : mode === "signup" ? "Create Account" : "Patient Sign In"}
          </h1>
          <p className="text-sm text-slate-400">
            {role === "clinician"
              ? "Access clinical analytics, SOAP notes, and visit processing."
              : mode === "signup"
                ? "Create an account to view your visit summaries and care plans."
                : "View your approved visit summaries and medication history."}
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-6">
          {(["clinician", "patient"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === r
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {r === "clinician" ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Patient: sign-in / create account toggle */}
        {isPatient && (
          <div className="flex gap-4 border-b border-slate-100 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`pb-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  mode === m
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
        )}

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors mb-4 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.064 44 29.929 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign-up extras */}
          {showSignup && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-semibold text-slate-600">Full Name</Label>
                <Input id="fullname" type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Alex Johnson" required className="h-10 text-sm border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-semibold text-slate-600">Date of Birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)}
                    required className="h-10 text-sm border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-600">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 000-0000" className="h-10 text-sm border-slate-200" />
                </div>
              </div>

              {/* SMS consent — shown when phone is provided */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors select-none">
                <div className="mt-0.5 shrink-0">
                  {smsConsent
                    ? <CheckSquare className="h-4 w-4 text-blue-600" onClick={() => setSmsConsent(false)} />
                    : <Square className="h-4 w-4 text-slate-300" onClick={() => setSmsConsent(true)} />}
                </div>
                <div onClick={() => setSmsConsent(!smsConsent)}>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                    Receive SMS medication reminders
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block leading-relaxed">
                    Get text reminders for your scheduled medications at the number above. Msg &amp; data rates may apply. Reply STOP to opt out.
                  </span>
                </div>
              </label>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-600">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required className="h-10 text-sm border-slate-200" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-600">Password</Label>
              {!showSignup && (
                <button type="button" onClick={() => toast.info("Password reset not available in demo.")}
                  className="text-[11px] text-slate-400 hover:text-slate-700 hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                required className="h-10 text-sm pr-10 border-slate-200" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {showSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPass" className="text-xs font-semibold text-slate-600">Confirm Password</Label>
              <Input id="confirmPass" type="password" value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••"
                required className="h-10 text-sm border-slate-200" />
            </div>
          )}

          {/* Remember for 30 days */}
          {!showSignup && (
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {remember
                ? <CheckSquare className="h-4 w-4 text-slate-700 shrink-0" />
                : <Square className="h-4 w-4 text-slate-300 shrink-0" />}
              Remember me for 30 days
            </button>
          )}

          <Button type="submit" className="w-full gap-2 h-11 text-sm font-semibold mt-1" disabled={loading}>
            {loading
              ? "Please wait…"
              : showSignup
                ? <><User className="h-4 w-4" /> Create Account</>
                : <><ArrowRight className="h-4 w-4" /> Sign In</>}
          </Button>
        </form>

        {/* Demo hint */}
        {mode === "signin" && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <strong className="text-slate-700">Demo mode.</strong> Credentials are pre-filled — just click Sign In.
          </div>
        )}

        {/* Terms */}
        {showSignup && (
          <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
            By creating an account you agree to our{" "}
            <button onClick={() => toast.info("Not available in demo.")} className="underline text-slate-500">Terms</button>
            {" "}and{" "}
            <button onClick={() => toast.info("Not available in demo.")} className="underline text-slate-500">Privacy Policy</button>.
          </p>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link href="/" className="hover:text-slate-700 transition-colors">← Back to home</Link>
        </p>
      </div>

      {/* ── RIGHT: photo panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={role}
          src={panel.photo}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 xl:p-16 pb-14">
          {/* Role badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              {role === "clinician"
                ? <Stethoscope className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-white" />}
            </div>
            <span className="text-white/80 text-sm font-medium capitalize">{role} Portal</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4 max-w-md">
            {panel.headline}
          </h2>

          {/* Tagline */}
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-8">
            {panel.tagline}
          </p>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            {panel.badge}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
