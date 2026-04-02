"use client";

import JobOpeningsEmptyState from "@/components/resume-screening/JobOpeningsEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobOpeningListItem } from "@/features/job-opening/api/list-job-openings";
import { listJobOpenings } from "@/features/job-opening/api/list-job-openings";
import { updateJobOpening } from "@/features/job-opening/api/update-job-opening";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import type { PublicUser } from "@/types/auth";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  ChevronDown,
  Eye,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  availabilityApiToUi,
  formatRowSalary,
  getAvailabilityFromStoredData,
  getEmploymentLabel,
  getJobOpeningCreatedAtMs,
  getRowLocation,
  getRowTitle,
  getWorkArrangementLabel,
  mergeAvailabilityIntoData,
  rowSalaryLakhsRange,
  type UiJobStatus,
} from "./job-openings-list-utils";

const EMPLOYMENT_FILTERS = [
  { value: "__all__", label: "All types" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "OTHER", label: "Other" },
] as const;

const WORK_FILTERS = [
  { value: "__all__", label: "All" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "REMOTE", label: "Remote" },
] as const;

const STATUS_FILTERS: { value: "__all__" | UiJobStatus; label: string }[] = [
  { value: "__all__", label: "All statuses" },
  { value: "Published", label: "Published" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
  { value: "Hidden", label: "Hidden" },
];

function parseLpaInput(raw: string): number | null {
  const t = raw.trim().replace(/,/g, "");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const STATUS_OPTIONS: { value: UiJobStatus; label: string; className: string }[] = [
  { value: "Published", label: "Published", className: "text-emerald-800 dark:text-emerald-200" },
  { value: "Archived", label: "Archived", className: "text-amber-900 dark:text-amber-200" },
  { value: "Hidden", label: "Hidden", className: "text-gray-700 dark:text-gray-300" },
  { value: "Draft", label: "Draft", className: "text-slate-700 dark:text-slate-300" },
];

const STATUS_PILL: Record<UiJobStatus, string> = {
  Published:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50",
  Archived: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
  Hidden: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50",
  Draft: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
};

function userInitials(first: string | null | undefined, last: string | null | undefined): string {
  const a = (first ?? "").trim().charAt(0);
  const b = (last ?? "").trim().charAt(0);
  const s = `${a}${b}`.toUpperCase();
  return s || "?";
}

/** Full name for tooltip (e.g. “Vikas Deshmukh”) and initials for the badge (e.g. “VD”). */
function resolveCreatorDisplay(
  row: JobOpeningListItem,
  sessionUser: PublicUser | null,
): { initials: string; tooltip: string } {
  const c = row.creator;
  if (c) {
    const full = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
    const tooltip = full || c.email || `User #${c.id}`;
    return { initials: userInitials(c.firstName, c.lastName), tooltip };
  }
  if (sessionUser && row.recruiter_user_id === sessionUser.id) {
    const full = `${sessionUser.firstName ?? ""} ${sessionUser.lastName ?? ""}`.trim();
    const tooltip = full || sessionUser.email || "You";
    return {
      initials: userInitials(sessionUser.firstName, sessionUser.lastName),
      tooltip,
    };
  }
  return {
    initials: "?",
    tooltip: `Recruiter #${row.recruiter_user_id}`,
  };
}

function publicJobUrl(id: number): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/jobs/${id}`;
}

export default function JobOpeningsList() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const sessionUser = useAuthStore((s) => s.user);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<JobOpeningListItem[]>([]);

  const [search, setSearch] = React.useState("");
  const [empFilter, setEmpFilter] = React.useState<string>("__all__");
  const [workFilter, setWorkFilter] = React.useState<string>("__all__");
  const [statusFilter, setStatusFilter] = React.useState<string>("__all__");
  const [minSalaryGte, setMinSalaryGte] = React.useState("");
  const [maxSalaryLte, setMaxSalaryLte] = React.useState("");
  const [sortAsc, setSortAsc] = React.useState(false);

  const clearFilters = React.useCallback(() => {
    setSearch("");
    setEmpFilter("__all__");
    setWorkFilter("__all__");
    setStatusFilter("__all__");
    setMinSalaryGte("");
    setMaxSalaryLte("");
  }, []);

  const hasActiveFilters = React.useMemo(() => {
    return (
      search.trim() !== "" ||
      empFilter !== "__all__" ||
      workFilter !== "__all__" ||
      statusFilter !== "__all__" ||
      minSalaryGte.trim() !== "" ||
      maxSalaryLte.trim() !== ""
    );
  }, [search, empFilter, workFilter, statusFilter, minSalaryGte, maxSalaryLte]);

  const [toast, setToast] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listJobOpenings(token);
      setItems(res.job_openings);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load job openings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Sign in to view job openings.");
      return;
    }
    void load();
  }, [token, load]);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    if (statusMenuOpenId == null) return;
    const onDown = (e: MouseEvent) => {
      const el = document.querySelector(`[data-status-row="${statusMenuOpenId}"]`);
      if (el && !el.contains(e.target as Node)) {
        setStatusMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [statusMenuOpenId]);

  const filtered = React.useMemo(() => {
    let rows = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => {
        const title = getRowTitle(r).toLowerCase();
        const idStr = String(r.id);
        return title.includes(q) || idStr.includes(q);
      });
    }
    if (empFilter !== "__all__") {
      rows = rows.filter((r) => {
        const raw = String(r.data?.employment_type ?? "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "_");
        return raw === empFilter;
      });
    }
    if (workFilter !== "__all__") {
      rows = rows.filter((r) => {
        const jp = r.data?.job_post;
        if (!jp || typeof jp !== "object" || Array.isArray(jp)) return false;
        return (
          String((jp as Record<string, unknown>).work_arrangement ?? "")
            .trim()
            .toUpperCase() === workFilter
        );
      });
    }
    if (statusFilter !== "__all__") {
      rows = rows.filter((r) => {
        const ui = availabilityApiToUi(
          getAvailabilityFromStoredData((r.data ?? {}) as Record<string, unknown>),
        );
        return ui === statusFilter;
      });
    }
    const minN = parseLpaInput(minSalaryGte);
    if (minN !== null) {
      rows = rows.filter((r) => {
        const { lo, hi } = rowSalaryLakhsRange(r);
        if (lo === 0 && hi === 0) return false;
        return lo >= minN;
      });
    }
    const maxN = parseLpaInput(maxSalaryLte);
    if (maxN !== null) {
      rows = rows.filter((r) => {
        const { lo, hi } = rowSalaryLakhsRange(r);
        if (lo === 0 && hi === 0) return false;
        return hi <= maxN;
      });
    }

    rows.sort((a, b) => {
      const ta = getJobOpeningCreatedAtMs(a) ?? 0;
      const tb = getJobOpeningCreatedAtMs(b) ?? 0;
      return sortAsc ? ta - tb : tb - ta;
    });
    return rows;
  }, [
    items,
    search,
    empFilter,
    workFilter,
    statusFilter,
    minSalaryGte,
    maxSalaryLte,
    sortAsc,
  ]);

  const handleInvite = (id: number) => {
    const url = publicJobUrl(id);
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => {
      setToast(
        "Application link copied! Share this link with your candidates. They can apply through it and will appear in your applications.",
      );
    });
  };

  const handlePreview = (id: number) => {
    window.open(
      `/resume-screening/job-openings/${id}/preview`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleStatusChange = async (row: JobOpeningListItem, next: UiJobStatus) => {
    if (!token) return;
    setUpdatingId(row.id);
    setStatusMenuOpenId(null);
    try {
      const nextData = mergeAvailabilityIntoData(row.data as Record<string, unknown>, next);
      await updateJobOpening(row.id, { data: nextData }, token);
      setItems((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, data: nextData as Record<string, unknown> } : r)),
      );
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.message : "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading job openings…</p>
    );
  }

  if (error && items.length === 0) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (items.length === 0) {
    return <JobOpeningsEmptyState />;
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-4 pr-10 shadow-lg dark:border-emerald-800 dark:bg-emerald-950/90">
          <button
            type="button"
            className="absolute top-2 right-2 rounded p-1 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">Success</p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">{toast}</p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-300" role="status">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-gray-50/90 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
        <div className="flex w-full min-w-0 items-stretch gap-0 sm:items-center">
          <div className="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:thin] sm:py-2.5 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            <div className="relative w-[200px] min-w-[180px] shrink-0 sm:w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search openings"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-gray-200 bg-white pl-9 text-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label="Search job openings"
            />
            </div>

            <Select value={empFilter} onValueChange={setEmpFilter}>
            <SelectTrigger
              className="h-9 w-[136px] shrink-0 rounded-lg border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label="Employment type"
            >
              <SelectValue placeholder="Employment" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {EMPLOYMENT_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>

            <Select value={workFilter} onValueChange={setWorkFilter}>
            <SelectTrigger
              className="h-9 w-[128px] shrink-0 rounded-lg border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label="Work arrangement"
            >
              <SelectValue placeholder="Work" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {WORK_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="h-9 w-[132px] shrink-0 rounded-lg border-gray-200 bg-white text-sm dark:border-gray-700 dark:bg-gray-900"
              aria-label="Status"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {STATUS_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>

            <div className="flex h-9 w-[100px] shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 dark:border-gray-700 dark:bg-gray-900">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Min</span>
            <Input
              className="h-7 min-w-0 flex-1 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
              inputMode="decimal"
              placeholder="LPA"
              value={minSalaryGte}
              onChange={(e) => setMinSalaryGte(e.target.value)}
              aria-label="Minimum salary in LPA"
            />
            </div>

            <div className="flex h-9 w-[100px] shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 dark:border-gray-700 dark:bg-gray-900">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Max</span>
            <Input
              className="h-7 min-w-0 flex-1 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
              inputMode="decimal"
              placeholder="LPA"
              value={maxSalaryLte}
              onChange={(e) => setMaxSalaryLte(e.target.value)}
              aria-label="Maximum salary in LPA"
            />
            </div>

            {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 whitespace-nowrap rounded-lg border-gray-200 bg-white px-3 text-xs font-medium dark:border-gray-700 dark:bg-gray-900"
              onClick={clearFilters}
            >
              Clear
            </Button>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 border-l border-gray-200 bg-white/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/60 sm:py-2.5">
            <span className="hidden text-xs font-medium text-gray-500 sm:inline dark:text-gray-400">
              Sort
            </span>
            <span className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              Created
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              onClick={() => setSortAsc((s) => !s)}
              title={sortAsc ? "Oldest first" : "Newest first"}
            >
              {sortAsc ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {hasActiveFilters || filtered.length !== items.length ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {items.length} job opening{items.length === 1 ? "" : "s"}
          {hasActiveFilters ? " (filters applied)" : ""}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.02]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500"
            onClick={() => void load()}
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="hidden min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_100px_140px_80px_120px] sm:gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_100px_140px_80px_120px]">
            <span>Role name</span>
            <span>Details</span>
            <span>Type</span>
            <span>Views / Applications</span>
            <span>Created</span>
            <span className="text-right">Status</span>
          </div>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((row, idx) => {
            const title = getRowTitle(row);
            const uiStatus = availabilityApiToUi(getAvailabilityFromStoredData(row.data as Record<string, unknown>));
            const busy = updatingId === row.id;
            const statusOpen = statusMenuOpenId === row.id;
            const creator = resolveCreatorDisplay(row, sessionUser);

            return (
              <li key={row.id} className="px-3 py-4 sm:px-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_100px_140px_80px_120px] lg:items-start lg:gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                        #{idx + 1} {title}
                      </span>
                      <span
                        className="flex h-7 w-7 shrink-0 cursor-default items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        title={creator.tooltip}
                      >
                        {creator.initials}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        onClick={() => handleInvite(row.id)}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Invite
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        onClick={() => handlePreview(row.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        onClick={() => router.push(`/resume-screening/job-openings/${row.id}/edit`)}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Settings
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-1.5">
                      <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{formatRowSalary(row)}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>
                        {getWorkArrangementLabel(row)} · {getRowLocation(row)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    {getEmploymentLabel(row)}
                  </div>

                  <div className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      0 views
                    </div>
                    <div className="flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" />
                      0 applications
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(() => {
                      const ms = getJobOpeningCreatedAtMs(row);
                      if (ms === null) return "—";
                      return format(new Date(ms), "MMM d");
                    })()}
                  </div>

                  <div className="relative flex justify-end" data-status-row={row.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setStatusMenuOpenId((id) => (id === row.id ? null : row.id))}
                      className={`inline-flex min-w-[7.5rem] items-center justify-between gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${STATUS_PILL[uiStatus]}`}
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      <span className={STATUS_OPTIONS.find((s) => s.value === uiStatus)?.className}>
                        {uiStatus}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </button>
                    {statusOpen ? (
                      <ul className="absolute right-0 top-full z-30 mt-1 min-w-[10rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                        {STATUS_OPTIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              className="flex w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => void handleStatusChange(row, opt.value)}
                            >
                              <span className={opt.className}>{opt.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">No jobs match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
