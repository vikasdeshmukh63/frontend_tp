import { recruiterFetch } from "@/lib/api/recruiter-client";
import type { PublicUser } from "@/types/auth";

export type JobOpeningListItem = {
  id: number;
  data: Record<string, unknown>;
  job_title: string | null;
  role_id: number | null;
  recruiter_user_id: number;
  /** Resolved from auth_service for `recruiter_user_id` (null if lookup failed). */
  creator: PublicUser | null;
  created_at: string;
  updated_at: string;
};

export type ListJobOpeningsResponse = {
  job_openings: JobOpeningListItem[];
};

/**
 * Lists job openings from **recruiter_service** only.
 * Uses `recruiterFetch`, not the auth `apiFetch`.
 */
export async function listJobOpenings(
  token: string,
  options?: { limit?: number; offset?: number },
): Promise<ListJobOpeningsResponse> {
  const params = new URLSearchParams();
  if (options?.limit !== undefined) params.set("limit", String(options.limit));
  if (options?.offset !== undefined) params.set("offset", String(options.offset));
  const q = params.toString();
  const path = `/api/job-openings${q ? `?${q}` : ""}`;

  return recruiterFetch<ListJobOpeningsResponse>(path, {
    method: "GET",
    token,
  });
}
