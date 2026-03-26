import { AUTH_SESSION_COOKIE } from "@/lib/auth-constants";

export { AUTH_SESSION_COOKIE };

const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0`;
}

export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) =>
    c.trim().startsWith(`${AUTH_SESSION_COOKIE}=1`)
  );
}
