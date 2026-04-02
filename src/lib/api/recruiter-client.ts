import { getRecruiterApiBaseUrl } from "@/config/env";

import { ApiError } from "./client";

type ErrorBody = { error?: string; code?: string };

/**
 * HTTP client for **recruiter_service only** (`NEXT_PUBLIC_RECRUITER_API_URL`).
 * Do not use `apiFetch` from `client.ts` for job openings — that targets the auth service.
 */
export async function recruiterFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const base = getRecruiterApiBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, { ...rest, headers });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }

  if (!res.ok) {
    const body = data as ErrorBody;
    throw new ApiError(body.error ?? res.statusText, res.status, body.code);
  }

  return data as T;
}
