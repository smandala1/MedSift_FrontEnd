"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Upload, CheckCircle2, Loader2, AlertTriangle,
  FileAudio, Mic, ShieldCheck, Brain, FileText,
  ArrowRight, Download, Eye, Square, Radio, Clock, Stethoscope
} from "lucide-react";
import { transcribeAudio, analyzeTranscript, exportPDF, downloadPDF } from "@/lib/api";
import { toast } from "sonner";
import type { TranscribeResponse, AnalyzeResponse, AuthUser } from "@/types";

// ── Removed "scoring" stage — backend does not support risk scoring ──
type Stage = "idle" | "uploading" | "transcribing" | "redacting" | "extracting" | "done" | "error";
type Mode = "file" | "live";

const STAGES: { key: Stage; label: string; icon: React.ElementType; sub: string }[] = [
  { key: "uploading",    label: "Uploading Audio",        icon: Upload,      sub: "Securely transmitting file to backend" },
  { key: "transcribing", label: "Transcribing Speech",    icon: Mic,         sub: "Whisper AI — local speech-to-text" },
  { key: "redacting",    label: "De-identifying PHI",     icon: ShieldCheck, sub: "Presidio — removing patient identifiers" },
  { key: "extracting",   label: "Extracting Care Plan",   icon: Brain,       sub: "LLaMA 3 — structured clinical extraction" },
];

const STAGE_ORDER: Stage[] = ["uploading", "transcribing", "redacting", "extracting", "done"];

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
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitType, setVisitType] = useState("routine checkup");
  const [tags, setTags] = useState("");
  const [transcribeResult, setTranscribeResult] = useState<TranscribeResponse | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"care-plan" | "soap" | "transcript">("care-plan");
  const [errorMsg, setErrorMsg] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("medsift_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored) as AuthUser;
    setUser(u);
    if (u.role === "patient") {
      toast.error("Patients cannot upload recordings. Only clinicians can process audio.");
      router.push("/dashboard");
    }
  }, [router]);

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
        const f = new File([blob], `consultation-${Date.now()}.webm`, { type: "audio/webm" });
        setFile(f);
        stream.getTracks().forEach(t => t.stop());
        toast.success("Recording saved — ready to process");
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
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

      setStage("done");

      const pending = JSON.parse(localStorage.getItem("medsift_pending") || "[]") as number[];
      if (!pending.includes(ar.visit_id)) {
        pending.push(ar.visit_id);
        localStorage.setItem("medsift_pending", JSON.stringify(pending));
      }

      toast.success("Processing complete! Visit is pending clinician approval.");
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">New Consultation Recording</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Upload an audio file or record live to generate a structured care plan and SOAP note.
        </p>
      </div>

      {stage === "idle" && (
        <>
          {/* ── Live Recording Hero Banner (top, prominent) ─────── */}
          <Card className={`mb-6 border-2 transition-all duration-300 ${
            recording
              ? "border-red-400 bg-red-50 shadow-lg shadow-red-100"
              : "border-[#0ea5e9]/30 bg-gradient-to-br from-[#0ea5e9]/5 to-[#06b6d4]/5"
          }`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Left: icon + label */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${
                    recording
                      ? "bg-red-500 shadow-lg shadow-red-300"
                      : "bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] shadow-lg shadow-[#0ea5e9]/30"
                  }`}>
                    {recording ? (
                      <Radio className="h-8 w-8 text-white animate-pulse" />
                    ) : (
                      <Mic className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    {recording ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-red-600 font-bold text-lg">Recording in Progress</span>
                        </div>
                        <p className="text-sm text-red-500">
                          Consultation is being captured — click Stop when finished
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="font-bold text-lg text-gray-800">Live Consultation Recording</h2>
                        <p className="text-sm text-muted-foreground">
                          Click <strong>Start Recording</strong> to capture the consultation directly in your browser
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: button */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  {!recording ? (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="gap-2 px-10 py-6 text-base text-white font-semibold rounded-xl"
                      style={{ background: "#dc2626", boxShadow: "0 6px 20px rgba(220,38,38,0.35)" }}
                    >
                      <Mic className="h-5 w-5" /> Start Recording
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={stopRecording}
                      variant="outline"
                      className="gap-2 px-10 py-6 text-base font-semibold rounded-xl border-2 border-red-400 text-red-600 hover:bg-red-100"
                    >
                      <Square className="h-5 w-5 fill-current" /> Stop Recording
                    </Button>
                  )}
                  {!recording && !file && (
                    <span className="text-xs text-muted-foreground">Requires microphone access</span>
                  )}
                </div>
              </div>

              {/* Recorded file ready */}
              {file && file.name.startsWith("consultation-") && !recording && (
                <div className="mt-4 flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Recording saved: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(0)} KB) — ready to process</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Divider ─────────────────────────────────────────── */}
          <div className="flex items-center gap-4 mb-6">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">
              Or upload an audio file
            </span>
            <Separator className="flex-1" />
          </div>

          {/* ── File upload + metadata row ───────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* File dropzone */}
            <div className="md:col-span-2">
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  dragging
                    ? "border-[#0ea5e9] bg-[#0ea5e9]/5 scale-[1.01]"
                    : file && !file.name.startsWith("consultation-")
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-[#0ea5e9]/50 hover:bg-gray-50/80"
                }`}
              >
                <input ref={inputRef} type="file" accept=".mp3,.wav,.m4a,.webm,.ogg" className="hidden" onChange={onFileChange} />
                {file && !file.name.startsWith("consultation-") ? (
                  <>
                    <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <FileAudio className="h-7 w-7 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-700 text-base">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change file</p>
                  </>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <Upload className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                    <div className="flex gap-2 mt-4">
                      {[".mp3", ".wav", ".m4a", ".webm"].map(ext => (
                        <span key={ext} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono">{ext}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Metadata + submit */}
            <div className="space-y-4">
              <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0ea5e9]" />
                    Visit Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visit Date</Label>
                    <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="mt-1.5 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visit Type</Label>
                    <select
                      value={visitType}
                      onChange={e => setVisitType(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20"
                    >
                      <option>routine checkup</option>
                      <option>follow-up</option>
                      <option>specialist</option>
                      <option>emergency</option>
                      <option>telehealth</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</Label>
                    <Input
                      placeholder="e.g. diabetes, hypertension"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="mt-1.5 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={process}
                disabled={!file || recording}
                className="w-full gap-2 py-5 text-sm font-semibold rounded-xl"
                style={file && !recording ? { background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" } : {}}
              >
                <Brain className="h-4 w-4" /> Run MedSift Pipeline
              </Button>

              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2.5 uppercase tracking-wide">Pipeline Steps</p>
                  <ol className="text-xs text-slate-500 space-y-2">
                    {[
                      "Audio uploaded securely",
                      "Whisper transcribes speech",
                      "PHI automatically redacted",
                      "LLM extracts care plan + SOAP note",
                      "Clinical literature searched",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="shrink-0 h-4 w-4 rounded-full bg-[#0ea5e9]/15 text-[#0ea5e9] font-bold flex items-center justify-center text-[10px]">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ── Processing stages timeline ───────────────────────────── */}
      {stage !== "idle" && stage !== "done" && stage !== "error" && (
        <div className="max-w-2xl mx-auto">
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
                    <CardTitle className="text-lg">Processing Consultation</CardTitle>
                    <p className="text-sm text-muted-foreground">Running MedSift AI pipeline — please wait</p>
                  </div>
                </div>
                <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20">
                  Step {stageIndex(stage) + 1} of {STAGES.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Progress bar */}
              <div className="relative mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#06b6d4] to-[#10b981] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((stageIndex(stage) + 1) / STAGES.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(((stageIndex(stage) + 1) / STAGES.length) * 100)}% complete
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ~{Math.max(0, (STAGES.length - stageIndex(stage) - 1) * 5)}s remaining
                  </span>
                </div>
              </div>

              {/* Timeline steps */}
              <div className="relative">
                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0ea5e9] via-gray-200 to-gray-100" />
                <div className="space-y-1">
                  {STAGES.map((s) => {
                    const idx = stageIndex(s.key);
                    const cur = stageIndex(stage);
                    const isDone = cur > idx;
                    const isActive = cur === idx;

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
                            <s.icon className="h-6 w-6 text-white" />
                          ) : (
                            <s.icon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold transition-colors ${
                              isActive ? "text-[#0ea5e9]" : isDone ? "text-green-700" : "text-gray-500"
                            }`}>
                              {s.label}
                            </p>
                            {isDone && (
                              <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0">Complete</Badge>
                            )}
                            {isActive && (
                              <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-0 text-[10px] px-1.5 py-0 animate-pulse">In Progress</Badge>
                            )}
                          </div>
                          <p className={`text-sm mt-0.5 ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                            {s.sub}
                          </p>
                          {isActive && (
                            <div className="mt-2 flex gap-1">
                              {[0, 150, 300].map(delay => (
                                <div key={delay} className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
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

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>All processing is performed locally — no data leaves your device</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Secure</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "HIPAA Compliant", color: "#10b981" },
              { icon: Brain,        label: "AI-Powered",     color: "#8b5cf6" },
              { icon: FileText,     label: "Structured Output", color: "#0ea5e9" },
            ].map(tip => (
              <div key={tip.label} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                <tip.icon className="h-4 w-4" style={{ color: tip.color }} />
                <span className="text-xs font-medium text-gray-600">{tip.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          {/* Approval notice */}
          <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Awaiting clinician approval</p>
              <p className="text-sm text-amber-700 mt-0.5">
                This summary has been processed and is pending your review. Once approved, the patient will see it in their portal.
              </p>
            </div>
          </div>

          {/* Summary header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Processing Complete</p>
                <p className="text-sm text-muted-foreground">
                  {transcribeResult.duration.toFixed(0)}s audio · {transcribeResult.redaction_log.length} PHI items redacted
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exportLoading} className="gap-1.5">
                <Download className="h-4 w-4" /> {exportLoading ? "Generating…" : "Export PDF"}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => router.push(`/visits/${analyzeResult.visit_id}`)}>
                <Eye className="h-4 w-4" /> Full Details
              </Button>
            </div>
          </div>

          {/* Result tabs — Risk tab removed */}
          <div className="flex gap-2 border-b pb-0">
            {(["care-plan", "soap", "transcript"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "care-plan" ? "Care Plan" : t === "soap" ? "SOAP Note" : "Transcript"}
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
                          {val ? <span>{val}</span> : <span className="text-red-500 italic font-medium">Not provided</span>}
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
                    <p className="text-xs text-muted-foreground">{transcribeResult.redaction_log.length} items redacted</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => { setStage("idle"); setFile(null); setTranscribeResult(null); setAnalyzeResult(null); }}>
              Process Another Recording
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