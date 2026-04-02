import { recruiterFetch } from "@/lib/api/recruiter-client";

import type { JobOpeningDetail } from "./get-job-opening";

export async function updateJobOpening(
  id: number,
  body: { data: Record<string, unknown> },
  token: string,
): Promise<JobOpeningDetail> {
  return recruiterFetch<JobOpeningDetail>(`/api/job-openings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
}
