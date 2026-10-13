export type AnalysisResult = {
  filename: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  candidate_skills: string[];
  tfidf_score: number;
  semantic_score: number;
  skill_coverage: number;
  final_match_score: number;
};

// Configure the backend once with VITE_API_BASE_URL. When omitted, requests use
// the current origin, which is useful when FastAPI is served behind a proxy.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
export const API_LABEL = API_BASE_URL || "Current origin";

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;

  const result = value as Record<string, unknown>;
  const arrays = [
    "required_skills",
    "matched_skills",
    "missing_skills",
    "candidate_skills",
  ];
  const scores = ["tfidf_score", "semantic_score", "skill_coverage", "final_match_score"];

  return (
    typeof result.filename === "string" &&
    arrays.every(
      (key) =>
        Array.isArray(result[key]) &&
        (result[key] as unknown[]).every((item) => typeof item === "string"),
    ) &&
    scores.every((key) => typeof result[key] === "number")
  );
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { detail?: string; message?: string };
    return body.detail || body.message;
  } catch {
    return undefined;
  }
}

export async function analyzeResume(file: File, jobDescription: string) {
  const formData = new FormData();
  formData.append("cv", file);
  formData.append("job_description", jobDescription);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/assistant`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "The API could not be reached. Check that FastAPI is running and VITE_API_BASE_URL is configured correctly.",
    );
  }

  if (!response.ok) {
    const apiMessage = await getErrorMessage(response);
    throw new Error(
      apiMessage || `The API returned an error (${response.status}). Please check the request and try again.`,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The API returned an unreadable response. Expected valid JSON.");
  }

  if (!isAnalysisResult(data)) {
    throw new Error("The API response is missing one or more expected analysis fields.");
  }

  return data;
}
