/**
 * Client-safe env (NEXT_PUBLIC_*). Auth service base URL without trailing slash.
 */
export function getAuthApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** AI service (FastAPI) — JD parse, etc. */
export function getAiApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8000";
  return raw.replace(/\/+$/, "");
}

/** Recruiter API (job openings) — Express service; must match `recruiter_service` PORT. */
export function getRecruiterApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_RECRUITER_API_URL ?? "http://localhost:3002";
  return raw.replace(/\/+$/, "");
}
