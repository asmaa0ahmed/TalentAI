import { useRef, useState, type DragEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  FileCheck2,
  FileText,
  Gauge,
  LoaderCircle,
  Menu,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { analyzeResume, API_LABEL, type AnalysisResult } from "./api";

type ConnectionState = "ready" | "connecting" | "connected" | "unavailable";

const navItems = [
  { label: "Resume Analyzer", icon: SearchCheck, active: true },
];

const statusCopy: Record<ConnectionState, string> = {
  ready: "API ready",
  connecting: "Connecting",
  connected: "API connected",
  unavailable: "API unavailable",
};

function displayPercent(value: number) {
  const percent = value >= 0 && value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, percent));
}

function formatPercent(value: number) {
  const percent = displayPercent(value);
  return `${Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Gauge;
}) {
  const percent = displayPercent(value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {formatPercent(value)}
        </span>
      </div>
      <p className="mb-3 text-sm font-medium text-slate-600">{label}</p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className="h-full rounded-full bg-teal-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function SkillGroup({
  title,
  skills,
  tone,
  emptyText,
}: {
  title: string;
  skills: string[];
  tone: "success" | "warning" | "neutral";
  emptyText: string;
}) {
  const toneClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {skills.length}
        </span>
      </div>
      {skills.length ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${toneClasses[tone]}`}
            >
              {tone === "success" && <Check className="size-3.5" aria-hidden="true" />}
              {tone === "warning" && <AlertCircle className="size-3.5" aria-hidden="true" />}
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </section>
  );
}

function Results({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const score = displayPercent(result.final_match_score);

  return (
    <div className="space-y-5" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-700">
            <Check className="size-4" aria-hidden="true" />
            Analysis complete
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Match report</h2>
          <p className="mt-1 text-sm text-slate-500">
            Results for <span className="font-medium text-slate-700">{result.filename}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          New analysis
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_2fr]">
        <section className="relative overflow-hidden rounded-2xl bg-[#102a36] p-6 text-white shadow-sm sm:p-7">
          <div className="absolute -right-12 -top-12 size-40 rounded-full bg-teal-400/10" />
          <div className="relative flex h-full flex-col">
            <p className="text-sm font-medium text-slate-300">Final match score</p>
            <div className="my-6 flex items-center justify-center">
              <div className="relative size-44">
                <svg className="-rotate-90 size-full" viewBox="0 0 120 120" aria-hidden="true">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(255,255,255,.1)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="9"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray={`${score} 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatPercent(result.final_match_score)}
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                    Overall
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-center text-xs text-slate-300">
              <ShieldCheck className="size-4 text-teal-300" aria-hidden="true" />
              Based on skills and semantic relevance
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard label="TF-IDF similarity" value={result.tfidf_score} icon={Gauge} />
          <MetricCard
            label="Semantic similarity"
            value={result.semantic_score}
            icon={Sparkles}
          />
          <MetricCard
            label="Required skill coverage"
            value={result.skill_coverage}
            icon={CircleGauge}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Skills breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">
              {result.matched_skills.length} of {result.required_skills.length} required skills matched
            </p>
          </div>
          <div className="hidden size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 sm:flex">
            <Zap className="size-5" aria-hidden="true" />
          </div>
        </div>
        <div className="grid gap-7 lg:grid-cols-2">
          <SkillGroup
            title="Matched skills"
            skills={result.matched_skills}
            tone="success"
            emptyText="No required skills were matched."
          />
          <SkillGroup
            title="Missing required skills"
            skills={result.missing_skills}
            tone="warning"
            emptyText="No required skills are missing."
          />
          <div className="lg:col-span-2">
            <SkillGroup
              title="All detected candidate skills"
              skills={result.candidate_skills}
              tone="neutral"
              emptyText="No candidate skills were detected."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("ready");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function validateFile(nextFile: File) {
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf" && extension !== "txt") {
      setError("Please upload a PDF or TXT file. Other file types are not supported.");
      return false;
    }
    setFile(nextFile);
    setError("");
    setResult(null);
    return true;
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) validateFile(droppedFile);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Add your resume before starting the analysis.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Enter a job description so we can calculate a match.");
      return;
    }

    setError("");
    setResult(null);
    setIsLoading(true);
    setConnection("connecting");

    try {
      const analysis = await analyzeResume(file, jobDescription.trim());
      setResult(analysis);
      setConnection("connected");
    } catch (requestError) {
      setConnection("unavailable");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The analysis could not be completed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setJobDescription("");
    setError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const canAnalyze = Boolean(file && jobDescription.trim() && !isLoading);

  return (
    <div className="min-h-screen bg-[#f4f7f8] font-sans text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0c2530] px-4 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-400 text-[#0c2530] shadow-lg shadow-teal-950/20">
            <BriefcaseBusiness className="size-5" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">TalentAI</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Intelligent hiring
            </p>
          </div>
        </div>

        <nav className="mt-10 space-y-1" aria-label="Primary navigation">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-400/15 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
              {active && <ChevronRight className="ml-auto size-4" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold">AI-powered insights</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Match candidates using lexical and semantic analysis.
          </p>
        </div>
        <p className="mt-5 px-2 text-[11px] text-slate-500">TalentAI portfolio project</p>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0c2530] text-teal-300">
              <BriefcaseBusiness className="size-4.5" aria-hidden="true" />
            </div>
            <span className="font-bold tracking-tight">TalentAI</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            className="flex size-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {mobileNavOpen && (
          <nav className="grid gap-1 border-t border-slate-100 p-3" aria-label="Mobile navigation">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  active ? "bg-teal-50 text-teal-800" : "text-slate-600"
                }`}
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                <span className="h-px w-6 bg-teal-500" />
                Resume intelligence
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Resume Match Analyzer
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Compare a candidate's resume with any job description using lexical and semantic
                matching.
              </p>
            </div>
            <div
              className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm"
              title={`Endpoint: ${API_LABEL}/assistant`}
            >
              <span
                className={`size-2 rounded-full ${
                  connection === "unavailable"
                    ? "bg-rose-500"
                    : connection === "connecting"
                      ? "animate-pulse bg-amber-400"
                      : "bg-emerald-500"
                }`}
              />
              <span className="text-xs font-semibold text-slate-600">{statusCopy[connection]}</span>
            </div>
          </header>

          {error && (
            <div
              className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-semibold">We couldn't complete the analysis</p>
                <p className="mt-0.5 text-sm text-rose-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 text-rose-600 hover:bg-rose-100"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {!result ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#0c2530] text-xs font-bold text-white">
                        1
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Candidate profile
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950">Upload resume</h2>
                    <p className="mt-1 text-sm text-slate-500">Select a PDF or plain text file.</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <FileText className="size-5" aria-hidden="true" />
                  </div>
                </div>

                {file ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                      <FileCheck2 className="size-7" aria-hidden="true" />
                    </div>
                    <p className="mt-4 max-w-full truncate text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB
                      · Ready to analyze
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                      isDragging
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm ring-1 ring-slate-200">
                      <UploadCloud className="size-7" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">Drop your resume here</p>
                    <p className="mt-1 text-xs text-slate-500">or choose a file from your device</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      Browse files
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="sr-only"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0];
                    if (nextFile) validateFile(nextFile);
                  }}
                  aria-label="Upload resume file"
                />
              </section>

              <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#0c2530] text-xs font-bold text-white">
                        2
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Target role
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950">Job description</h2>
                    <p className="mt-1 text-sm text-slate-500">Paste the complete role requirements.</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <BriefcaseBusiness className="size-5" aria-hidden="true" />
                  </div>
                </div>
                <div className="relative flex flex-1 flex-col">
                  <textarea
                    value={jobDescription}
                    onChange={(event) => {
                      setJobDescription(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Paste the job title, responsibilities, qualifications, and required skills here..."
                    className="min-h-64 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/70 p-4 pb-10 text-sm leading-6 text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    aria-label="Job description"
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium text-slate-400">
                    {jobDescription.length.toLocaleString()} characters
                  </span>
                </div>
              </section>

              <div className="xl:col-span-2">
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:pl-5">
                  <div className="flex items-center gap-3">
                    <div className="hidden size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex">
                      <ShieldCheck className="size-4.5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Your data is sent only to your configured API</p>
                      <p className="text-xs text-slate-500">No example data or simulated results are used.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canAnalyze}
                    onClick={handleAnalyze}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" />
                        Analyzing resume...
                      </>
                    ) : (
                      <>
                        Analyze Resume
                        <ArrowRight className="size-4.5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Results result={result} onReset={reset} />
          )}
        </div>
      </main>
    </div>
  );
}
