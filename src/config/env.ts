/**
 * Client-safe env (NEXT_PUBLIC_*). Auth service base URL without trailing slash.
 */
export function getAuthApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
