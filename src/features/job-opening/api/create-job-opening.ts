import { getRecruiterApiBaseUrl } from "@/config/env";
import { ApiError } from "@/lib/api/client";

export type CreateJobOpeningResponse = {
  id: number;
  data: unknown;
};

/**
 * Persists a job opening via the recruiter API (`recruiter_service`).
 */
export async function createJobOpening(
  body: { data: Record<string, unknown> },
  token: string,
): Promise<CreateJobOpeningResponse> {
  const base = getRecruiterApiBaseUrl();
  const url = `${base}/api/job-openings`;
  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }

  if (!res.ok) {
    const b = data as { error?: string; code?: string };
    throw new ApiError(b.error ?? res.statusText, res.status, b.code);
  }

  return data as CreateJobOpeningResponse;
}
