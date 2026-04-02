/**
 * Client-safe env (`NEXT_PUBLIC_*`). Base URLs have no trailing slash.
 *
 * - **Auth** (`getAuthApiBaseUrl`) — login, register, profile (`apiFetch` in `lib/api/client.ts`).
 * - **Recruiter** (`getRecruiterApiBaseUrl`) — job openings create/list (`recruiterFetch` in `lib/api/recruiter-client.ts` only).
 * - **AI** — JD PDF parse, etc.
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

/**
 * Recruiter service (Express) — **job openings and other recruiter APIs**.
 * Must not point at the auth service; default port matches `recruiter_service` (e.g. 3001).
 */
export function getRecruiterApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_RECRUITER_API_URL ?? "http://localhost:3001";
  return raw.replace(/\/+$/, "");
}
