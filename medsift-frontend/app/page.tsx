import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic, ShieldCheck, FileText, Activity,
  FlaskConical, BookOpen, ArrowRight, Star, Zap, Lock,
} from "lucide-react";

const features = [
  { icon: Mic,          title: "Local Transcription",  desc: "OpenAI Whisper runs on your machine — audio never leaves your network.",                                                   color: "#1565c0", bg: "#e3f2fd", num: "01" },
  { icon: ShieldCheck,  title: "PHI Redaction",         desc: "Microsoft Presidio strips names, SSNs, phone numbers, and MRNs before any AI sees the text.",                             color: "#7b1fa2", bg: "#f3e5f5", num: "02" },
  { icon: FileText,     title: "Care Plans & SOAP",     desc: "LLaMA 3 extracts medications, tests, follow-ups, and a full clinical SOAP note with evidence quotes.",                    color: "#00796b", bg: "#e0f2f1", num: "03" },
  { icon: Activity,     title: "Risk Scoring",          desc: "Hybrid rule + LLM engine flags red flags and scores patient risk 0–100 in real time.",                                    color: "#c62828", bg: "#ffebee", num: "04" },
  { icon: FlaskConical, title: "Clinical Trials",       desc: "Matches patient conditions to actively recruiting ClinicalTrials.gov studies automatically.",                             color: "#0277bd", bg: "#e1f5fe", num: "05" },
  { icon: BookOpen,     title: "Literature Search",     desc: "Semantic Scholar retrieves peer-reviewed papers ranked by citation impact — and learns from clinician feedback.",          color: "#e65100", bg: "#fff3e0", num: "06" },
];

const stats = [
  { value: "100%", label: "Local Processing", color: "#00c853" },
  { value: "$0",   label: "API Cost",         color: "#29b6f6" },
  { value: "5",    label: "Pipeline Stages",  color: "#1565c0" },
  { value: "HIPAA",label: "Aware Design",     color: "#7b1fa2" },
];

const pipeline = [
  { label: "Audio",      icon: "🎙️", sub: ".mp3 / .wav" },
  { label: "Whisper",    icon: "📝", sub: "Transcription" },
  { label: "Presidio",   icon: "🛡️", sub: "PHI Redaction" },
  { label: "LLaMA 3",   icon: "🤖", sub: "Extraction" },
  { label: "Risk Engine",icon: "⚡", sub: "Scoring" },
  { label: "Care Plan",  icon: "📋", sub: "Output" },
];

const stack = [
  ["Next.js",  "#000000"],
  ["FastAPI",  "#009688"],
  ["Whisper",  "#1565c0"],
  ["Presidio", "#7b1fa2"],
  ["LLaMA 3",  "#e65100"],
  ["SQLite",   "#37474f"],
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          minHeight: "92vh",
          background: "linear-gradient(145deg,#060f24 0%,#0a1f4a 40%,#061a12 100%)",
        }}
      >
        {/* ── Animated SVG healthcare background ─────────────────── */}
        <svg
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ecgGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#29b6f6" stopOpacity="0"/>
              <stop offset="25%"  stopColor="#29b6f6" stopOpacity="0.7"/>
              <stop offset="75%"  stopColor="#00c853" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#00c853" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="ecgGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1565c0" stopOpacity="0"/>
              <stop offset="40%"  stopColor="#1565c0" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#26c6da" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Subtle hex grid */}
          {[...Array(6)].map((_,r) => [...Array(12)].map((_,c) => {
            const x = c*130 + (r%2===0?0:65), y = r*112;
            return <path key={`h${r}${c}`} d={`M${x+65},${y} L${x+97},${y+56} L${x+65},${y+112} L${x},${y+112} L${x-32},${y+56} L${x},${y} Z`} fill="none" stroke="#29b6f6" strokeOpacity="0.03" strokeWidth="1"/>
          }))}

          {/* ECG wave 1 — draws in on load */}
          <polyline className="ecg1"
            points="0,380 80,380 110,380 130,300 155,460 175,230 195,510 215,380 280,380 500,380 580,380 620,358 640,402 660,358 680,380 900,380 1440,380"
            stroke="url(#ecgGrad1)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

          {/* ECG wave 2 — secondary, draws in slower */}
          <polyline className="ecg2"
            points="0,560 160,560 200,560 220,490 245,630 265,430 285,680 305,560 400,560 700,560 780,540 800,580 820,540 850,560 1100,560 1440,560"
            stroke="url(#ecgGrad2)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Animated glow orbs */}
          <circle className="glow1" cx="18%"  cy="25%" r="200" fill="#1565c0" fillOpacity="0.06"/>
          <circle className="glow2" cx="82%"  cy="65%" r="240" fill="#00c853" fillOpacity="0.05"/>
          <circle          cx="55%"  cy="85%" r="140" fill="#29b6f6" fillOpacity="0.03"/>

          {/* Medical cross marks — 3 animated groups */}
          {[[95,90],[370,180],[680,70],[1050,130],[1330,90]].map(([x,y],i)=>(
            <g key={`ca${i}`} className="c1" transform={`translate(${x},${y})`}>
              <rect x="-4" y="-14" width="8" height="28" rx="2" fill="#29b6f6"/>
              <rect x="-14" y="-4" width="28" height="8" rx="2" fill="#29b6f6"/>
            </g>
          ))}
          {[[200,500],[500,430],[820,490],[1150,520],[1380,440]].map(([x,y],i)=>(
            <g key={`cb${i}`} className="c2" transform={`translate(${x},${y})`}>
              <rect x="-3" y="-11" width="6" height="22" rx="2" fill="#00c853"/>
              <rect x="-11" y="-3" width="22" height="6" rx="2" fill="#00c853"/>
            </g>
          ))}
          {[[80,700],[300,650],[620,720],[950,660],[1250,690]].map(([x,y],i)=>(
            <g key={`cc${i}`} className="c3" transform={`translate(${x},${y})`}>
              <rect x="-3" y="-10" width="6" height="20" rx="2" fill="#26c6da"/>
              <rect x="-10" y="-3" width="20" height="6" rx="2" fill="#26c6da"/>
            </g>
          ))}

          {/* Floating data pixels */}
          <rect className="px1" x="1080" y="80"  width="10" height="10" rx="2" fill="#00c853" fillOpacity="0.7"/>
          <rect className="px2" x="1110" y="58"  width="7"  height="7"  rx="1.5" fill="#29b6f6" fillOpacity="0.7"/>
          <rect className="px3" x="1098" y="102" width="6"  height="6"  rx="1.5" fill="#1565c0" fillOpacity="0.6"/>
          <rect className="px4" x="1128" y="88"  width="5"  height="5"  rx="1"   fill="#26c6da" fillOpacity="0.6"/>
          <rect className="px5" x="1148" y="68"  width="8"  height="8"  rx="1.5" fill="#00c853" fillOpacity="0.5"/>

          <rect className="px2" x="220"  y="110" width="9"  height="9"  rx="2"   fill="#29b6f6" fillOpacity="0.6"/>
          <rect className="px3" x="245"  y="88"  width="6"  height="6"  rx="1.5" fill="#00c853" fillOpacity="0.5"/>
          <rect className="px1" x="268"  y="128" width="7"  height="7"  rx="1.5" fill="#1565c0" fillOpacity="0.5"/>
        </svg>

        {/* ── Hero content ─────────────────────────────────────────── */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6"
          style={{ minHeight: "92vh", paddingTop: "5rem", paddingBottom: "5rem" }}
        >
          {/* Hackathon badge */}
          <div className="mb-8" style={{ animation: "fadeSlideUp 0.6s ease both" }}>
            <Badge className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full"
              style={{ background: "rgba(41,182,246,0.12)", color: "#29b6f6", border: "1px solid rgba(41,182,246,0.3)", backdropFilter: "blur(8px)" }}>
              <Star className="h-3 w-3" /> Hacklytics 2026 @ Georgia Tech
            </Badge>
          </div>

          {/* Wordmark — transparent, no white box */}
          <div className="flex items-center justify-center gap-2 mb-8" style={{ animation: "fadeSlideUp 0.7s ease both" }}>
            <svg viewBox="0 0 60 60" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="hc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#29b6f6"/><stop offset="100%" stopColor="#1565c0"/></linearGradient>
                <linearGradient id="hf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#26c6da"/><stop offset="100%" stopColor="#00c853"/></linearGradient>
              </defs>
              <rect x="5"  y="12" width="14" height="38" rx="4" fill="url(#hc)" opacity="0.95"/>
              <rect x="0"  y="24" width="24" height="14" rx="4" fill="url(#hc)" opacity="0.95"/>
              <polygon points="14,14 38,14 31,32 21,32" fill="url(#hf)" opacity="0.95"/>
              <rect x="21" y="32" width="10" height="12" rx="3" fill="url(#hf)" opacity="0.95"/>
              <rect x="25" y="4"  width="7"  height="7"  rx="2" fill="#00c853" opacity="0.9"/>
              <rect x="34" y="2"  width="5"  height="5"  rx="1.5" fill="#29b6f6" opacity="0.8"/>
              <rect x="41" y="8"  width="4"  height="4"  rx="1" fill="#26c6da" opacity="0.7"/>
              <polyline points="0,52 8,52 12,45 16,57 20,40 24,52 44,52 58,52" stroke="#29b6f6" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="font-black italic leading-none" style={{ fontSize: "clamp(2.8rem,6vw,4.2rem)", letterSpacing: "-0.02em" }}>
              <span style={{ background: "linear-gradient(90deg,#29b6f6,#1565c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Med</span>
              <span style={{ background: "linear-gradient(90deg,#43a047,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Sift</span>
            </span>
            <span className="font-black text-white rounded-xl px-3 py-1.5 leading-none"
              style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", background: "#1a237e" }}>AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-5 max-w-3xl"
            style={{ animation: "fadeSlideUp 0.8s ease both" }}>
            Sift through medical conversations.
            <br />
            <span style={{ background: "linear-gradient(90deg,#29b6f6,#00c853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Surface what matters.
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg mb-10 leading-relaxed"
            style={{ color: "#8cb8d4", animation: "fadeSlideUp 0.9s ease both" }}>
            Turn patient-doctor audio into structured care plans, SOAP notes, risk scores,
            and clinical research — fully local, zero cost, zero cloud.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12" style={{ animation: "fadeSlideUp 1s ease both" }}>
            <Link href="/login?role=clinician">
              <Button size="lg" className="font-bold px-9 gap-2 text-white border-0 transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg,#1565c0,#29b6f6)", boxShadow: "0 6px 28px rgba(21,101,192,0.45)", fontSize: "1rem" }}>
                Clinician Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login?role=patient">
              <Button size="lg" className="font-bold px-9 gap-2 text-white border-0 transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg,#1b5e20,#00c853)", boxShadow: "0 6px 28px rgba(0,200,83,0.3)", fontSize: "1rem" }}>
                Patient Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: "#6a9ab8", animation: "fadeSlideUp 1.1s ease both" }}>
            <span className="flex items-center gap-1.5"><Lock       className="h-4 w-4" style={{ color: "#00c853" }} /> 100% Local</span>
            <span className="flex items-center gap-1.5"><Zap        className="h-4 w-4" style={{ color: "#29b6f6" }} /> Zero Cloud</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" style={{ color: "#29b6f6" }} /> PHI Redacted</span>
            <span className="flex items-center gap-1.5"><Star       className="h-4 w-4" style={{ color: "#00c853" }} /> Evidence-Backed</span>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <section style={{ background: "#0d2352" }} className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium uppercase tracking-widest" style={{ color: "#7aa8c4" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ──────────────────────────────────────────────── */}
      <section className="py-16 border-b" style={{ background: "#f0f7ff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest mb-10" style={{ color: "#1565c0" }}>
            How It Works
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            {pipeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                <div className="text-center group">
                  <div
                    className="h-14 w-14 mx-auto rounded-2xl bg-white border-2 shadow-md flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110"
                    style={{ borderColor: "#29b6f630" }}>
                    {step.icon}
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#0d2352" }}>{step.label}</p>
                  <p className="text-[10px] text-slate-400">{step.sub}</p>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-0.5 w-6 sm:w-8 rounded-full" style={{ background: "linear-gradient(90deg,#29b6f6,#00c853)" }} />
                    <ArrowRight className="h-4 w-4" style={{ color: "#29b6f6", marginTop: "-6px" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3" style={{ color: "#0d2352" }}>
              Everything in one pipeline
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
              Six specialised modules, one local stack, end-to-end intelligence — from recording to care plan in seconds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default"
                style={{
                  borderColor: "#e8f0fe",
                  animationDelay: `${idx * 0.08}s`,
                  borderLeft: `4px solid ${f.color}20`,
                }}
              >
                {/* Number + icon row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: f.bg }}>
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <span className="text-4xl font-black" style={{ color: f.color + "20", letterSpacing: "-0.04em" }}>{f.num}</span>
                </div>

                <h3 className="font-bold text-base mb-2" style={{ color: "#0d2352" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>

                {/* Hover accent line */}
                <div className="h-0.5 mt-5 rounded-full transition-all duration-300 w-0 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg,${f.color},${f.color}80)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────────── */}
      <section className="py-16 text-white text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d2352 0%,#1565c0 50%,#00695c 100%)" }}>
        {/* subtle ECG in bg */}
        <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}>
          <polyline points="0,50 100,50 120,50 135,30 150,70 165,20 180,80 195,50 350,50 600,50 800,50 1440,50"
            stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to process your first recording?</h2>
          <p className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>Sign in as a clinician or patient to get started.</p>
          <Link href="/login">
            <Button size="lg" className="font-bold px-10 gap-2 transition-transform hover:scale-105"
              style={{ background: "#ffffff", color: "#1565c0", fontSize: "1rem" }}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── TECH STACK ────────────────────────────────────────────── */}
      <section className="py-12 border-t" style={{ background: "#f0f7ff" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {stack.map(([name, color]) => (
              <span key={name}
                className="px-4 py-1.5 rounded-full text-sm font-bold border bg-white shadow-sm transition-shadow hover:shadow-md"
                style={{ color, borderColor: color + "30" }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="py-8 border-t text-center text-xs text-slate-400 px-4">
        <p className="mb-1">
          <strong>Disclaimer:</strong> MedSift AI is for informational purposes only. It does not
          provide medical diagnoses or replace professional medical advice.
        </p>
        <p>© 2026 MedSift AI · Hacklytics 2026 @ Georgia Tech · MIT License</p>
      </footer>

    </div>
  );
}
