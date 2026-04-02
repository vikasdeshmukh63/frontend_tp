import type { JobOpeningListItem } from "@/features/job-opening/api/list-job-openings";
import { formatInrLpaRange } from "@/lib/format-salary-inr";
import { parseISO } from "date-fns";

/** Parses API timestamps (ISO, MySQL-style, or epoch ms) without throwing. */
export function parseTimestampMs(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "bigint") return Number(raw);
  const s = String(raw).trim();
  if (!s) return null;
  try {
    const d = parseISO(s);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  } catch {
    /* parseISO throws on non-strings in some cases */
  }
  const d2 = new Date(s);
  if (!Number.isNaN(d2.getTime())) return d2.getTime();
  return null;
}

export function getJobOpeningCreatedAtMs(row: JobOpeningListItem): number | null {
  const r = row as JobOpeningListItem & { createdAt?: unknown };
  return parseTimestampMs(r.created_at ?? r.createdAt);
}

export type UiJobStatus = "Draft" | "Published" | "Archived" | "Hidden";

export function availabilityApiToUi(api: string): UiJobStatus {
  switch (api.trim().toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "ACTIVE":
      return "Published";
    case "CLOSED":
      return "Archived";
    case "PAUSED":
      return "Hidden";
    default:
      return "Published";
  }
}

export function uiStatusToAvailabilityApi(ui: UiJobStatus): string {
  switch (ui) {
    case "Draft":
      return "DRAFT";
    case "Published":
      return "ACTIVE";
    case "Archived":
      return "CLOSED";
    case "Hidden":
      return "PAUSED";
    default:
      return "ACTIVE";
  }
}

export function getAvailabilityFromStoredData(data: Record<string, unknown>): string {
  const jp = data.job_post;
  if (!jp || typeof jp !== "object" || Array.isArray(jp)) return "ACTIVE";
  return String((jp as Record<string, unknown>).availability_status ?? "ACTIVE");
}

export function mergeAvailabilityIntoData(
  data: Record<string, unknown>,
  uiStatus: UiJobStatus,
): Record<string, unknown> {
  const next = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const jp =
    next.job_post && typeof next.job_post === "object" && !Array.isArray(next.job_post)
      ? ({ ...(next.job_post as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  jp.availability_status = uiStatusToAvailabilityApi(uiStatus);
  next.job_post = jp;
  return next;
}

export function getRowTitle(row: JobOpeningListItem): string {
  return (
    row.job_title ??
    (typeof row.data?.job_title === "string" ? row.data.job_title : null) ??
    "Untitled role"
  );
}

/** Annual INR string from API → lakhs (12 = 12 LPA), matching `formatInrLpaRange` rules. */
export function parseAnnualToLakhs(s: string): number {
  const raw = Number.parseFloat(String(s ?? "").replace(/,/g, "")) || 0;
  if (raw <= 0) return 0;
  const LAKH = 100_000;
  return raw >= LAKH ? raw / LAKH : raw;
}

export function getRowSalaryStrings(row: JobOpeningListItem): { min: string; max: string } {
  const jp = row.data?.job_post;
  if (!jp || typeof jp !== "object" || Array.isArray(jp)) {
    return { min: "", max: "" };
  }
  const o = jp as Record<string, unknown>;
  const minT = o.min_salary_times_hundred;
  const maxT = o.max_salary_times_hundred;
  const min = typeof minT === "number" ? minT : Number(minT);
  const max = typeof maxT === "number" ? maxT : Number(maxT);
  return {
    min: Number.isFinite(min) && min > 0 ? String(Math.round(min / 100)) : "",
    max: Number.isFinite(max) && max > 0 ? String(Math.round(max / 100)) : "",
  };
}

/** Lower / upper salary band in LPA (lakhs) for filtering. */
export function rowSalaryLakhsRange(row: JobOpeningListItem): { lo: number; hi: number } {
  const { min, max } = getRowSalaryStrings(row);
  const la = parseAnnualToLakhs(min);
  const lb = parseAnnualToLakhs(max);
  if (!la && !lb) return { lo: 0, hi: 0 };
  if (!la) return { lo: lb, hi: lb };
  if (!lb) return { lo: la, hi: la };
  return { lo: Math.min(la, lb), hi: Math.max(la, lb) };
}

export function formatRowSalary(row: JobOpeningListItem): string {
  const { min, max } = getRowSalaryStrings(row);
  if (!min && !max) return "—";
  return formatInrLpaRange(min, max);
}

export function getRowLocation(row: JobOpeningListItem): string {
  const jp = row.data?.job_post;
  if (!jp || typeof jp !== "object" || Array.isArray(jp)) return "—";
  const loc = (jp as Record<string, unknown>).location_restrictions;
  if (typeof loc === "string" && loc.trim()) {
    const first = loc
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0];
    return first ?? "—";
  }
  return "—";
}

export function getEmploymentLabel(row: JobOpeningListItem): string {
  const raw = String(row.data?.employment_type ?? "").toUpperCase();
  const map: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    OTHER: "Other",
  };
  return map[raw] ?? (raw ? raw.replace(/_/g, " ") : "—");
}

export function getWorkArrangementLabel(row: JobOpeningListItem): string {
  const jp = row.data?.job_post;
  if (!jp || typeof jp !== "object" || Array.isArray(jp)) return "—";
  const raw = String((jp as Record<string, unknown>).work_arrangement ?? "").toUpperCase();
  const map: Record<string, string> = {
    ONSITE: "On-site",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
  };
  return map[raw] ?? "—";
}
