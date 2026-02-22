"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload, CheckCircle2, Circle, Loader2, AlertTriangle,
  FileAudio, Mic, ShieldCheck, Brain, Activity, FileText,
  ArrowRight, Download, Eye, Square, Radio, Clock
} from "lucide-react";
import { transcribeAudio, analyzeTranscript, exportPDF, downloadPDF } from "@/lib/api";
import { toast } from "sonner";
import type { TranscribeResponse, AnalyzeResponse, AuthUser } from "@/types";

type Stage = "idle" | "uploading" | "transcribing" | "redacting" | "extracting" | "scoring" | "done" | "error";
type Mode = "file" | "live";

const STAGES: { key: Stage; label: string; icon: React.ElementType; sub: string }[] = [
  { key: "uploading",    label: "Uploading audio",       icon: Upload,       sub: "Sending file to backend" },
  { key: "transcribing", label: "Transcribing (Whisper)", icon: Mic,          sub: "Local speech-to-text" },
  { key: "redacting",    label: "Redacting PHI",          icon: ShieldCheck,  sub: "Presidio anonymization" },
  { key: "extracting",   label: "Extracting care plan",   icon: Brain,        sub: "LLaMA 3 structured extraction" },
  { key: "scoring",      label: "Scoring risk",           icon: Activity,     sub: "Rule-based + LLM analysis" },
];

const STAGE_ORDER: Stage[] = ["uploading", "transcribing", "redacting", "extracting", "scoring", "done"];

function stageIndex(s: Stage) { return STAGE_ORDER.indexOf(s); }

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitType, setVisitType] = useState("routine checkup");
  const [tags, setTags] = useState("");
  const [transcribeResult, setTranscribeResult] = useState<TranscribeResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"care-plan" | "soap" | "risk" | "transcript">("care-plan");
  const [errorMsg, setErrorMsg] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored) as AuthUser;
    setUser(u);
    // Patients cannot upload recordings — redirect to dashboard
    if (u.role === "patient") {
      toast.error("Patients cannot upload recordings. Only clinicians can process audio.");
      router.push("/dashboard");
    }
  }, [router]);

  // ── Recording timer ───────────────────────────────────────────
  useEffect(() => {
    if (!recording) { setRecordSeconds(0); return; }
    const iv = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  // ── Dropzone ──────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(mp3|wav|m4a|webm|ogg)$/i.test(f.name)) setFile(f);
    else toast.error("Please upload an audio file (.mp3, .wav, .m4a, .webm)");
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // ── Live Recording ─────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const f = new File([blob], `live-recording-${Date.now()}.webm`, { type: "audio/webm" });
        setFile(f);
        stream.getTracks().forEach(t => t.stop());
        toast.success("Recording saved — ready to process");
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // ── Process pipeline ──────────────────────────────────────────
  const process = async () => {
    if (!file) return;
    setErrorMsg("");
    try {
      setStage("uploading");
      await new Promise(r => setTimeout(r, 500));
      setStage("transcribing");
      const tr = await transcribeAudio(file);
      setTranscribeResult(tr);

      setStage("redacting");
      await new Promise(r => setTimeout(r, 600));

      setStage("extracting");
      const ar = await analyzeTranscript({
        transcript: tr.redacted_transcript,
        visit_date: visitDate,
        visit_type: visitType,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setAnalyzeResult(ar);

      setStage("scoring");
      await new Promise(r => setTimeout(r, 400));

      setStage("done");

      // Add to pending approvals queue (clinician must approve before patient sees it)
      const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
      if (!pending.includes(ar.visit_id)) {
        pending.push(ar.visit_id);
        localStorage.setItem("medsift_pending", JSON.stringify(pending));
      }

      toast.success("Processing complete! Awaiting clinician approval.");
    } catch (err) {
      setStage("error");
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      toast.error("Processing failed: " + msg);
    }
  };

  const handleExportPDF = async () => {
    if (!analyzeResult) return;
    setExportLoading(true);
    try {
      const blob = await exportPDF(analyzeResult.visit_id);
      downloadPDF(blob, `visit-${analyzeResult.visit_id}-summary.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const riskColor = analyzeResult?.risk_assessment.risk_level === "high"
    ? "text-red-600" : analyzeResult?.risk_assessment.risk_level === "medium"
    ? "text-amber-600" : "text-green-600";

  const riskBg = analyzeResult?.risk_assessment.risk_level === "high"
    ? "bg-red-50 border-red-200" : analyzeResult?.risk_assessment.risk_level === "medium"
    ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Process New Recording</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a file or use live recording to run the full MedSift pipeline.</p>
      </div>

      {stage === "idle" && (
        <>
          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border bg-muted p-1 mb-6">
            <button
              onClick={() => { setMode("file"); setFile(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === "file" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload File</span>
            </button>
            <button
              onClick={() => { setMode("live"); setFile(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === "live" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="flex items-center gap-2"><Mic className="h-4 w-4" /> Live Recording</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* File upload dropzone */}
            {mode === "file" && (
              <div className="md:col-span-2">
                <div
                  onDrop={onDrop}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    dragging ? "border-primary bg-primary/5" : file ? "border-green-400 bg-green-50" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.webm,.ogg" className="hidden" onChange={onFileChange} />
                  {file ? (
                    <>
                      <FileAudio className="h-12 w-12 text-green-500 mb-3" />
                      <p className="font-semibold text-green-700">{file.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="font-semibold">Drop audio file here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                      <p className="text-xs text-muted-foreground/70 mt-3">.mp3 · .wav · .m4a · .webm</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Live recording panel */}
            {mode === "live" && (
              <div className="md:col-span-2">
                <div className="border-2 rounded-2xl p-12 flex flex-col items-center justify-center gap-6"
                  style={{ borderColor: recording ? "#dc2626" : "#e2e8f0", background: recording ? "rgba(220,38,38,0.03)" : "transparent" }}>

                  {/* Recording indicator */}
                  {recording && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold animate-pulse">
                      <Radio className="h-5 w-5" />
                      <span>Recording in progress</span>
                    </div>
                  )}

                  {/* Timer */}
                  <div className="text-5xl font-black font-mono" style={{ color: recording ? "#dc2626" : "#94a3b8" }}>
                    {fmtTime(recordSeconds)}
                  </div>

                  {/* Record / Stop button */}
                  {!recording ? (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="gap-2 px-8 text-white"
                      style={{ background: "#dc2626", boxShadow: "0 4px 16px rgba(220,38,38,0.3)" }}
                    >
                      <Mic className="h-5 w-5" /> Start Recording
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={stopRecording}
                      variant="outline"
                      className="gap-2 px-8 border-red-400 text-red-600 hover:bg-red-50"
                    >
                      <Square className="h-5 w-5 fill-current" /> Stop Recording
                    </Button>
                  )}

                  {/* Recorded file ready indicator */}
                  {file && !recording && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Recorded: {file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  )}

                  {!recording && !file && (
                    <p className="text-sm text-muted-foreground">Press the button above to start recording the consultation</p>
                  )}
                </div>
              </div>
            )}

            {/* Metadata + submit */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Visit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Visit Date</Label>
                    <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="mt-1 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs">Visit Type</Label>
                    <select
                      value={visitType}
                      onChange={e => setVisitType(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option>routine checkup</option>
                      <option>follow-up</option>
                      <option>specialist</option>
                      <option>emergency</option>
                      <option>telehealth</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Tags (comma-separated)</Label>
                    <Input
                      placeholder="diabetes, hypertension"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="mt-1 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={process}
                disabled={!file || recording}
                className="w-full gap-2"
              >
                <Brain className="h-4 w-4" /> Run Pipeline
              </Button>

              {/* How it works sidebar */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-xs font-bold text-blue-800 mb-2">How it works:</p>
                  <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
                    <li>Audio → Whisper transcribes it</li>
                    <li>PHI is automatically redacted</li>
                    <li>LLM extracts care plan + SOAP note</li>
                    <li>Risk scoring identifies red flags</li>
                    <li>Clinical trials &amp; literature are searched</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ── Processing stages - Advanced Timeline ──────────────────────────────────── */}
      {stage !== "idle" && stage !== "done" && stage !== "error" && (
        <div className="max-w-2xl mx-auto">
          {/* Main processing card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
            <CardHeader className="border-b bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Processing Your Recording</CardTitle>
                    <p className="text-sm text-muted-foreground">Running MedSift AI pipeline...</p>
                  </div>
                </div>
                <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20">
                  Step {stageIndex(stage) + 1} of {STAGES.length}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Animated progress bar */}
              <div className="relative mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#06b6d4] to-[#10b981] rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${((stageIndex(stage) + 1) / STAGES.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{Math.round(((stageIndex(stage) + 1) / STAGES.length) * 100)}% complete</span>
                  <span className="text-xs text-muted-foreground">~{Math.max(0, (STAGES.length - stageIndex(stage) - 1) * 5)}s remaining</span>
                </div>
              </div>

              {/* Timeline steps */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0ea5e9] via-gray-200 to-gray-100" />
                
                <div className="space-y-1">
                  {STAGES.map((s, i) => {
                    const idx = stageIndex(s.key);
                    const cur = stageIndex(stage);
                    const isDone = cur > idx;
                    const isActive = cur === idx;
                    const isPending = cur < idx;
                    
                    return (
                      <div 
                        key={s.key} 
                        className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                          isActive 
                            ? "bg-gradient-to-r from-[#0ea5e9]/10 to-transparent border border-[#0ea5e9]/20 shadow-sm" 
                            : isDone 
                              ? "bg-green-50/50" 
                              : "opacity-50"
                        }`}
                      >
                        {/* Step indicator */}
                        <div className={`relative z-10 shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                          isDone 
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25" 
                            : isActive 
                              ? "bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] shadow-lg shadow-[#0ea5e9]/30" 
                              : "bg-gray-100 border-2 border-gray-200"
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : isActive ? (
                            <div className="relative">
                              <s.icon className="h-6 w-6 text-white" />
                              <div className="absolute inset-0 animate-ping">
                                <s.icon className="h-6 w-6 text-white opacity-50" />
                              </div>
                            </div>
                          ) : (
                            <s.icon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold transition-colors ${
                              isActive ? "text-[#0ea5e9]" : isDone ? "text-green-700" : "text-gray-500"
                            }`}>
                              {s.label}
                            </p>
                            {isDone && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0">
                                Done
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-0 text-[10px] px-1.5 py-0 animate-pulse">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm mt-0.5 ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                            {s.sub}
                          </p>
                          
                          {/* Active step details */}
                          {isActive && (
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                <span className="text-xs text-[#0ea5e9] font-medium">Processing</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Time estimate */}
                        <div className={`text-right shrink-0 ${isPending ? "opacity-50" : ""}`}>
                          {isDone ? (
                            <span className="text-xs text-green-600 font-medium">✓</span>
                          ) : isActive ? (
                            <span className="text-xs text-[#0ea5e9] font-medium">~5s</span>
                          ) : (
                            <span className="text-xs text-gray-400">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>All processing happens locally on your device</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing tips */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "HIPAA Compliant", color: "#10b981" },
              { icon: Brain, label: "AI-Powered", color: "#8b5cf6" },
              { icon: Activity, label: "Real-time Analysis", color: "#0ea5e9" },
            ].map((tip) => (
              <div key={tip.label} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <tip.icon className="h-4 w-4" style={{ color: tip.color }} />
                <span className="text-xs font-medium text-gray-600">{tip.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shimmer animation style */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* ── Error ─────────────────────────────────────────────── */}
      {stage === "error" && (
        <Card className="max-w-xl mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Processing failed</p>
              <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
              <Button variant="outline" className="mt-4" onClick={() => setStage("idle")}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Results ───────────────────────────────────────────── */}
      {stage === "done" && analyzeResult && transcribeResult && (
        <div className="space-y-6">
          {/* Approval notice banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Awaiting clinician approval</p>
              <p className="text-sm text-amber-700 mt-0.5">
                This summary has been processed and is pending review. Once a clinician approves it, the patient will be able to view it in their portal.
              </p>
            </div>
          </div>

          {/* Summary header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">Processing complete</p>
                <p className="text-sm text-muted-foreground">
                  {transcribeResult.duration.toFixed(0)}s audio · {transcribeResult.redaction_log.length} PHI items redacted
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${riskBg} ${riskColor}`}>
                Risk: {analyzeResult.risk_assessment.risk_score}/100 · {analyzeResult.risk_assessment.risk_level.toUpperCase()}
              </div>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exportLoading} className="gap-1.5">
                <Download className="h-4 w-4" /> {exportLoading ? "Generating…" : "PDF"}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => router.push(`/visits/${analyzeResult.visit_id}`)}>
                <Eye className="h-4 w-4" /> Full Details
              </Button>
            </div>
          </div>

          {/* Result tabs */}
          <div className="flex gap-2 border-b pb-0">
            {(["care-plan", "soap", "risk", "transcript"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "care-plan" ? "Care Plan" : t === "soap" ? "SOAP Note" : t === "risk" ? "Risk Assessment" : "Transcript"}
              </button>
            ))}
          </div>

          {/* Care Plan tab */}
          {activeTab === "care-plan" && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Visit Summary</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{analyzeResult.patient_summary.visit_summary}</p></CardContent>
              </Card>
              {analyzeResult.patient_summary.medications.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">💊 Medications</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {analyzeResult.patient_summary.medications.map((med, i) => (
                      <div key={i} className="border rounded-lg p-3 text-sm">
                        <p className="font-semibold">{med.name} <span className="font-normal text-muted-foreground">· {med.dose} · {med.frequency}</span></p>
                        <p className="text-muted-foreground mt-1">{med.instructions}</p>
                        {med.evidence && <p className="text-xs text-blue-600 mt-1 italic">"{med.evidence}"</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {analyzeResult.patient_summary.tests_ordered.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">🔬 Tests Ordered</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {analyzeResult.patient_summary.tests_ordered.map((t, i) => (
                      <div key={i} className="border rounded-lg p-3 text-sm">
                        <p className="font-semibold">{t.test_name}</p>
                        <p className="text-muted-foreground">{t.instructions} · {t.timeline}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {analyzeResult.patient_summary.red_flags_for_patient.length > 0 && (
                <Card className="border-red-200 bg-red-50 md:col-span-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">⚠️ When to Seek Urgent Care</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {analyzeResult.patient_summary.red_flags_for_patient.map((rf, i) => (
                      <p key={i} className="text-sm text-red-700 font-medium">• {rf.warning}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* SOAP Note tab */}
          {activeTab === "soap" && (
            <div className="grid md:grid-cols-2 gap-4">
              {(["subjective", "objective", "assessment", "plan"] as const).map((section) => {
                const data = analyzeResult.clinician_note.soap_note[section];
                const fields = {
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
                return (
                  <Card key={section}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                        {section === "subjective" ? "S — Subjective" : section === "objective" ? "O — Objective" : section === "assessment" ? "A — Assessment" : "P — Plan"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {fields.map(({ label, val }) => (
                        <p key={label}>
                          <strong>{label}:</strong>{" "}
                          {val ? (
                            <span>{val}</span>
                          ) : (
                            <span className="text-red-500 italic font-medium">Not provided</span>
                          )}
                        </p>
                      ))}
                      {data.evidence && data.evidence.length > 0 && (
                        <div className="text-xs text-blue-600 italic space-y-1 border-t pt-2 mt-2">
                          {data.evidence.slice(0, 2).map((e, i) => <p key={i}>"{e}"</p>)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Risk tab */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <Card className={`border ${riskBg}`}>
                <CardContent className="pt-6 flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-5xl font-black ${riskColor}`}>{analyzeResult.risk_assessment.risk_score}</div>
                    <div className="text-xs text-muted-foreground mt-1">/ 100</div>
                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div>
                    <p className={`text-xl font-bold ${riskColor} capitalize`}>{analyzeResult.risk_assessment.risk_level} Risk</p>
                    <p className="text-sm text-muted-foreground">{analyzeResult.risk_assessment.total_factors_detected} risk factors detected</p>
                    <p className="text-xs text-muted-foreground mt-2">⚠️ This is not a medical diagnosis.</p>
                  </div>
                </CardContent>
              </Card>
              {analyzeResult.risk_assessment.red_flags.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-red-700">🚨 Red Flags</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {analyzeResult.risk_assessment.red_flags.map((rf, i) => (
                      <div key={i} className="border border-red-200 rounded-lg p-3 bg-red-50">
                        <p className="text-sm font-semibold text-red-700">{rf.flag}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rf.recommended_action}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Factors</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {analyzeResult.risk_assessment.risk_factors.map((rf, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-sm">
                      <span>{rf.factor}</span>
                      <Badge variant="outline">+{rf.points}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transcript tab */}
          {activeTab === "transcript" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Original Transcript</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">{transcribeResult.transcript}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" /> De-identified Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">{transcribeResult.redacted_transcript}</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Redacted: {transcribeResult.redaction_log.length} items</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setStage("idle"); setFile(null); setTranscribeResult(null); setAnalyzeResult(null); }}>
              Process another
            </Button>
            {user?.role === "clinician" && (
              <Button onClick={() => router.push(`/visits/${analyzeResult.visit_id}`)} className="gap-2">
                <Eye className="h-4 w-4" /> Review &amp; Approve <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}