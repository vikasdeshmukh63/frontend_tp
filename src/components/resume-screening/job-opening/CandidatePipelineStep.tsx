"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CandidatePipelineState, PipelineMiddleStage } from "@/types/candidate-pipeline";
import { createMiddleStage } from "@/types/candidate-pipeline";
import {
  APPLIED_BADGE_CLASS,
  PIPELINE_ASSIGNEE_NONE,
  type PipelineAssigneeOption,
  PIPELINE_TEMPLATE_OPTIONS,
  PIPELINE_TERMINALS,
  getTemplateMeta,
} from "./candidate-pipeline-constants";
import { ChevronDown, FileText, GripVertical, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

type CandidatePipelineStepProps = {
  pipeline: CandidatePipelineState;
  onChange: (next: CandidatePipelineState) => void;
  /** Same-company recruiters + “No assignee”; defaults until parent loads. */
  assigneeOptions?: PipelineAssigneeOption[];
  assigneeOptionsLoading?: boolean;
  assigneeOptionsError?: string | null;
  /** Shown under “Assignee” — same `companyName` as your profile (auth). */
  assigneeCompanyHint?: string | null;
};

function reorderStages(
  stages: PipelineMiddleStage[],
  fromIndex: number,
  toIndex: number,
): PipelineMiddleStage[] {
  if (fromIndex === toIndex) return stages;
  const next = [...stages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function CandidatePipelineStep({
  pipeline,
  onChange,
  assigneeOptions: assigneeOptionsProp,
  assigneeOptionsLoading = false,
  assigneeOptionsError = null,
  assigneeCompanyHint = null,
}: CandidatePipelineStepProps) {
  const assigneeOptions = assigneeOptionsProp ?? [PIPELINE_ASSIGNEE_NONE];
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragPreviewRef = useRef<HTMLElement | null>(null);
  /** Wrapper around each middle-stage card — used to locate the real Card node for drag preview. */
  const cardWrapRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const removeDragPreview = useCallback(() => {
    const node = dragPreviewRef.current;
    if (node?.parentNode) {
      node.parentNode.removeChild(node);
    }
    dragPreviewRef.current = null;
  }, []);

  const middle = pipeline.middleStages;

  const patchMiddle = useCallback(
    (nextMiddle: PipelineMiddleStage[]) => {
      onChange({ middleStages: nextMiddle });
    },
    [onChange],
  );

  const updateStage = useCallback(
    (id: string, patch: Partial<PipelineMiddleStage>) => {
      patchMiddle(
        middle.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      );
    },
    [middle, patchMiddle],
  );

  const addStage = (template: (typeof PIPELINE_TEMPLATE_OPTIONS)[number]) => {
    const row = createMiddleStage(template.id, template.defaultStageName);
    patchMiddle([...middle, row]);
    setAddMenuOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    patchMiddle(middle.filter((s) => s.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const terminalStartIndex = 2 + middle.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Candidate pipeline
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add interview or assessment stages between Applied and the final outcomes. Drag the grip
          handle to reorder. Terminal stages are fixed.
        </p>
      </div>

      <ol className="relative space-y-0">
        {/* Stage 1 — Applied */}
        <li className="flex gap-3 pb-6">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
              1
            </span>
            <div className="mt-2 min-h-[48px] w-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
              <CardContent className="p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Stage type
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                    APPLIED_BADGE_CLASS,
                  )}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  APPLIED
                </span>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Entry point when a candidate submits an application.
                </p>
              </CardContent>
            </Card>
          </div>
        </li>

        {/* Add stage */}
        <li className="flex gap-3 pb-6">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
            <div className="min-h-[24px] w-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0">
            <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add stage
                  <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(100vw-2rem,28rem)] p-0">
                <div className="max-h-[min(70vh,420px)] overflow-y-auto py-1">
                  {PIPELINE_TEMPLATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => addStage(opt)}
                      className="flex w-full gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                          opt.badgeClass,
                        )}
                      >
                        <opt.Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-gray-900 dark:text-white">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                          {opt.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </li>

        {/* Middle stages */}
        {middle.map((stage, idx) => {
          const meta = getTemplateMeta(stage.template);
          const displayNum = idx + 2;
          const Icon = meta?.Icon;
          const badgeClass = meta?.badgeClass ?? "";

          return (
            <li
              key={stage.id}
              className={cn(
                "flex gap-3 pb-6 transition-opacity",
                draggingIndex === idx && "opacity-50",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromStr = e.dataTransfer.getData("text/plain");
                const from = Number.parseInt(fromStr, 10);
                if (Number.isNaN(from) || from === idx) return;
                patchMiddle(reorderStages(middle, from, idx));
                removeDragPreview();
                setDraggingIndex(null);
              }}
            >
              <div className="flex w-9 shrink-0 flex-col items-center">
                <div className="h-2 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                  {displayNum}
                </span>
                <div className="mt-2 min-h-[48px] w-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
              </div>
              <div
                ref={(el) => {
                  if (el) cardWrapRefs.current.set(stage.id, el);
                  else cardWrapRefs.current.delete(stage.id);
                }}
                className="min-w-0 flex-1 pt-0.5"
              >
                <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <div
                          draggable
                          onDragStart={(e) => {
                            removeDragPreview();
                            const wrap = cardWrapRefs.current.get(stage.id);
                            const sourceEl = wrap?.querySelector(
                              '[data-slot="card"]',
                            ) as HTMLElement | null;
                            e.dataTransfer.setData("text/plain", String(idx));
                            e.dataTransfer.effectAllowed = "move";
                            setDraggingIndex(idx);
                            if (!sourceEl) return;
                            const rect = sourceEl.getBoundingClientRect();
                            const clone = sourceEl.cloneNode(true) as HTMLElement;
                            clone.style.opacity = "0.65";
                            clone.style.position = "fixed";
                            clone.style.left = "-9999px";
                            clone.style.top = "0";
                            clone.style.width = `${rect.width}px`;
                            clone.style.maxWidth = `${rect.width}px`;
                            clone.style.pointerEvents = "none";
                            clone.style.boxShadow =
                              "0 20px 40px -12px rgba(15, 23, 42, 0.22)";
                            document.body.appendChild(clone);
                            dragPreviewRef.current = clone;
                            const ox = Math.round(e.clientX - rect.left);
                            const oy = Math.round(e.clientY - rect.top);
                            e.dataTransfer.setDragImage(clone, ox, oy);
                          }}
                          onDragEnd={() => {
                            removeDragPreview();
                            setDraggingIndex(null);
                          }}
                          className="mt-0.5 cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300"
                          aria-label="Drag to reorder stage"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Stage type
                          </p>
                          {Icon ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                                badgeClass,
                              )}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              {meta?.label.toUpperCase().replace(/\s+/g, " ")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full border-dashed"
                              aria-label="Assign teammate"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-64 p-1">
                            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              Assignee
                            </p>
                            {assigneeCompanyHint ? (
                              <p className="px-2 pb-1 text-[11px] leading-snug text-muted-foreground">
                                Recruiters at {assigneeCompanyHint}
                              </p>
                            ) : null}
                            {assigneeOptionsError ? (
                              <p className="px-2 pb-2 text-xs text-destructive">{assigneeOptionsError}</p>
                            ) : null}
                            {assigneeOptionsLoading ? (
                              <p className="px-2 pb-2 text-xs text-muted-foreground">Loading teammates…</p>
                            ) : null}
                            <div className="flex flex-col gap-0.5">
                              {assigneeOptions.map((u) => (
                                <button
                                  key={u.id}
                                  type="button"
                                  disabled={assigneeOptionsLoading}
                                  onClick={() =>
                                    updateStage(stage.id, {
                                      assigneeId: u.id === "__none__" ? null : u.id,
                                    })
                                  }
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                                    (stage.assigneeId === null && u.id === "__none__") ||
                                      stage.assigneeId === u.id
                                      ? "bg-brand-50 dark:bg-brand-500/10"
                                      : "",
                                  )}
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {u.initials}
                                  </span>
                                  <span className="truncate">{u.label}</span>
                                  {(stage.assigneeId === null && u.id === "__none__") ||
                                  stage.assigneeId === u.id ? (
                                    <span className="ml-auto text-brand-600">✓</span>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTargetId(stage.id)}
                          aria-label="Delete stage"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Stage name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={stage.stageName}
                          onChange={(e) =>
                            updateStage(stage.id, { stageName: e.target.value })
                          }
                          placeholder="e.g. Phone screening"
                          className="h-10 bg-background"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Internal name
                        </Label>
                        <Input
                          value={stage.internalName}
                          onChange={(e) =>
                            updateStage(stage.id, { internalName: e.target.value })
                          }
                          placeholder="Optional label for your team"
                          className="h-10 bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </li>
          );
        })}

        {/* Terminal stages */}
        {PIPELINE_TERMINALS.map((t, ti) => {
          const n = terminalStartIndex + ti;
          const isLast = ti === PIPELINE_TERMINALS.length - 1;
          return (
            <li key={t.kind} className={cn("flex gap-3", !isLast && "pb-6")}>
              <div className="flex w-9 shrink-0 flex-col items-center">
                <div className="h-2 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                  {n}
                </span>
                {!isLast ? (
                  <div className="mt-2 min-h-[32px] w-px flex-1 bg-gray-200 dark:bg-gray-700" aria-hidden />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
                  <CardContent className="p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Stage type
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                        t.badgeClass,
                      )}
                    >
                      <t.Icon className="h-3.5 w-3.5" aria-hidden />
                      {t.label}
                    </span>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      System stage — cannot be removed.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </li>
          );
        })}
      </ol>

      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        className="max-w-md p-6 shadow-xl"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete stage</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this stage?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
