import { getRecruiterApiBaseUrl } from "@/config/env";

import { ApiError } from "@/lib/api/client";

import type { JobOpeningDetail } from "./get-job-opening";

/**
 * Public job post (no auth) — only **Published** (ACTIVE) jobs return 200.
 */
export async function getPublicJobOpening(id: number): Promise<JobOpeningDetail> {
  const base = getRecruiterApiBaseUrl();
  const url = `${base}/api/public/job-openings/${id}`;

  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }

  if (!res.ok) {
    const body = data as { error?: string; code?: string };
    throw new ApiError(body.error ?? res.statusText, res.status, body.code);
  }

  return data as JobOpeningDetail;
}
