import type { PublicUser } from "@/types/auth";
import type { PipelineStageTemplate, PipelineTerminalKind } from "@/types/candidate-pipeline";
import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Gift,
  LogOut,
  Phone,
  Settings,
  Sparkles,
  Video,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type PipelineTemplateMeta = {
  id: PipelineStageTemplate;
  label: string;
  description: string;
  defaultStageName: string;
  Icon: LucideIcon;
  badgeClass: string;
};

export const PIPELINE_TEMPLATE_OPTIONS: PipelineTemplateMeta[] = [
  {
    id: "phone_screening",
    label: "Phone Screening",
    description: "Call candidates. Rank and review them.",
    defaultStageName: "Phone Screening",
    Icon: Phone,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100",
  },
  {
    id: "assessment",
    label: "Assessment",
    description: "Quiz, coding, communication, etc.",
    defaultStageName: "Assessment",
    Icon: ClipboardCheck,
    badgeClass:
      "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-500/15 dark:text-sky-100",
  },
  {
    id: "one_way_ai",
    label: "One-Way AI Interview",
    description: "Fixed questions. Evaluate subjective responses via text, audio, video.",
    defaultStageName: "One-Way AI Interview",
    Icon: Sparkles,
    badgeClass:
      "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-500/15 dark:text-violet-100",
  },
  {
    id: "conversational_ai",
    label: "Conversational AI Interview",
    description: "AI bot auto-generates questions. Engages in back-and-forth.",
    defaultStageName: "Conversational AI Interview",
    Icon: Bot,
    badgeClass:
      "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-500/15 dark:text-purple-100",
  },
  {
    id: "video_interview",
    label: "Video Interview",
    description: "Use your videoconferencing tool. Rank and review candidates.",
    defaultStageName: "Video Interview",
    Icon: Video,
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-500/15 dark:text-blue-100",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Custom stage with optional ranking.",
    defaultStageName: "Custom stage",
    Icon: Settings,
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-500/15 dark:text-slate-100",
  },
];

export function getTemplateMeta(
  id: PipelineStageTemplate,
): PipelineTemplateMeta | undefined {
  return PIPELINE_TEMPLATE_OPTIONS.find((o) => o.id === id);
}

export type TerminalMeta = {
  kind: PipelineTerminalKind;
  label: string;
  Icon: LucideIcon;
  badgeClass: string;
};

export const PIPELINE_TERMINALS: TerminalMeta[] = [
  {
    kind: "offered",
    label: "OFFERED",
    Icon: Gift,
    badgeClass:
      "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-500/15 dark:text-violet-100",
  },
  {
    kind: "hired",
    label: "HIRED",
    Icon: CheckCircle2,
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-100",
  },
  {
    kind: "rejected",
    label: "REJECTED",
    Icon: XCircle,
    badgeClass:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-500/15 dark:text-red-100",
  },
  {
    kind: "withdrawn",
    label: "WITHDRAWN",
    Icon: LogOut,
    badgeClass:
      "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-200",
  },
];

export const APPLIED_BADGE_CLASS =
  "border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-100";

export type PipelineAssigneeOption = { id: string; label: string; initials: string };

export const PIPELINE_ASSIGNEE_NONE: PipelineAssigneeOption = {
  id: "__none__",
  label: "No assignee",
  initials: "—",
};

function initialsForUser(u: PublicUser): string {
  const parts = [u.firstName, u.lastName].filter(
    (x): x is string => typeof x === "string" && x.trim() !== "",
  );
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
  }
  if (parts.length === 1) {
    const p = parts[0]!;
    return p.length >= 2 ? p.slice(0, 2).toUpperCase() : p.toUpperCase();
  }
  const e = u.email ?? "?";
  return e.slice(0, 2).toUpperCase();
}

/** Assignee rows for the pipeline UI: “No assignee” plus same-company recruiters (`id` = auth user id). */
export function buildPipelineAssigneeOptions(recruiters: PublicUser[]): PipelineAssigneeOption[] {
  return [
    PIPELINE_ASSIGNEE_NONE,
    ...recruiters.map((u) => ({
      id: String(u.id),
      label:
        [u.firstName, u.lastName].filter((x) => x && String(x).trim()).join(" ").trim() ||
        u.email,
      initials: initialsForUser(u),
    })),
  ];
}
