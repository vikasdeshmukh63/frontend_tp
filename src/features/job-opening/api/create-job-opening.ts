import { recruiterFetch } from "@/lib/api/recruiter-client";
import type { PublicUser } from "@/types/auth";

export type CreateJobOpeningResponse = {
  id: number;
  data: unknown;
  job_title?: string | null;
  role_id?: number | null;
  recruiter_user_id?: number;
  creator?: PublicUser | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Persists a job opening via **recruiter_service** only (`/api/job-openings`).
 * Uses `recruiterFetch`, not the auth `apiFetch`.
 */
export async function createJobOpening(
  body: { data: Record<string, unknown> },
  token: string,
): Promise<CreateJobOpeningResponse> {
  return recruiterFetch<CreateJobOpeningResponse>("/api/job-openings", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
}
