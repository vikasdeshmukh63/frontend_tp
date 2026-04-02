import { recruiterFetch } from "@/lib/api/recruiter-client";
import type { PublicUser } from "@/types/auth";

export type JobOpeningDetail = {
  id: number;
  data: Record<string, unknown>;
  job_title: string | null;
  role_id: number | null;
  /** Present on authenticated recruiter routes; omitted on public job page. */
  recruiter_user_id?: number;
  creator?: PublicUser | null;
  created_at: string;
  updated_at: string;
};

export async function getJobOpening(
  id: number,
  token: string,
): Promise<JobOpeningDetail> {
  return recruiterFetch<JobOpeningDetail>(`/api/job-openings/${id}`, {
    method: "GET",
    token,
  });
}
