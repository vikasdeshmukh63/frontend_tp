"use client";

import { Button } from "@/components/ui/button";
import { useJobOpeningDraftStore } from "@/stores/job-opening-draft-store";
import { useRouter } from "next/navigation";
import React from "react";
import {
  validateJobPostStep1,
  type JobPostStep1FieldErrors,
} from "./job-post-step1-validation";
import ApplicationFormPreview from "./ApplicationFormPreview";
import ApplicationFormStepPanel from "./ApplicationFormStepPanel";
import CandidatePipelineStep from "./CandidatePipelineStep";
import { buildPipelineAssigneeOptions } from "./candidate-pipeline-constants";
import JobPostFormPanel from "./JobPostFormPanel";
import JobPostLivePreview from "./JobPostLivePreview";
import { getDefaultApplicationForm, type ApplicationFormState } from "@/types/application-form";
import {
  getDefaultCandidatePipeline,
  type CandidatePipelineState,
} from "@/types/candidate-pipeline";
import { listCompanyRecruiters } from "@/features/auth/api/list-company-recruiters";
import { createJobOpening } from "@/features/job-opening/api/create-job-opening";
import { updateJobOpening } from "@/features/job-opening/api/update-job-opening";
import { mapJobDraftToCreatePayload } from "@/features/job-opening/utils/map-draft-to-create-payload";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import type { PublicUser } from "@/types/auth";

const STEPS = [
  { id: 1, title: "Job post", description: "Details candidates see" },
  { id: 2, title: "Application form", description: "Fields candidates must fill out" },
  { id: 3, title: "Candidate pipeline", description: "Different stages and automations" },
] as const;

function stepNavTitle(stepId: number, step1Done: boolean, step2Done: boolean): string | undefined {
  if (stepId === 1) return undefined;
  if (stepId === 2 && !step1Done) {
    return "Complete step 1 and click Next to unlock this step";
  }
  if (stepId === 3 && !step2Done) {
    return "Complete step 2 and click Next to unlock this step";
  }
  return undefined;
}

/** Whether the user may open this step from the stepper (sequential unlock; can go back to earlier completed steps). */
function canNavigateToStep(
  targetId: number,
  step1Completed: boolean,
  step2Completed: boolean,
): boolean {
  if (targetId === 1) return true;
  if (targetId === 2) return step1Completed;
  if (targetId === 3) return step2Completed;
  return false;
}

export default function JobOpeningWizard() {
  const router = useRouter();
  const draft = useJobOpeningDraftStore((s) => s.draft);
  const setDraft = useJobOpeningDraftStore((s) => s.setDraft);
  const patchDraft = useJobOpeningDraftStore((s) => s.patchDraft);
  const step = useJobOpeningDraftStore((s) => s.step);
  const setStep = useJobOpeningDraftStore((s) => s.setStep);
  const step1Completed = useJobOpeningDraftStore((s) => s.step1Completed);
  const setStep1Completed = useJobOpeningDraftStore((s) => s.setStep1Completed);
  const step2Completed = useJobOpeningDraftStore((s) => s.step2Completed);
  const setStep2Completed = useJobOpeningDraftStore((s) => s.setStep2Completed);
  const resetToUpload = useJobOpeningDraftStore((s) => s.resetToUpload);
  const editingJobOpeningId = useJobOpeningDraftStore((s) => s.editingJobOpeningId);

  const handleCancel = () => {
    resetToUpload();
    useJobOpeningDraftStore.persist.clearStorage();
    router.push("/resume-screening/job-openings");
  };

  const [step1Error, setStep1Error] = React.useState<string | null>(null);
  const [step3Error, setStep3Error] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [step1FieldErrors, setStep1FieldErrors] = React.useState<JobPostStep1FieldErrors>(
    {},
  );

  /** Heal inconsistent persisted step vs. completion flags (e.g. after migrations). */
  React.useEffect(() => {
    if (step >= 2 && !step1Completed) {
      setStep(1);
      return;
    }
    if (step >= 3 && !step2Completed) {
      setStep(2);
    }
  }, [step, step1Completed, step2Completed, setStep]);

  /** Older persisted drafts may omit applicationForm — persist defaults when opening step 2. */
  React.useEffect(() => {
    if (step !== 2) return;
    const d = useJobOpeningDraftStore.getState().draft;
    if (d.applicationForm) return;
    setDraft({ ...d, applicationForm: getDefaultApplicationForm() });
  }, [step, setDraft]);

  /** Older drafts may omit candidatePipeline — defaults when opening step 3. */
  React.useEffect(() => {
    if (step !== 3) return;
    const d = useJobOpeningDraftStore.getState().draft;
    if (d.candidatePipeline) return;
    patchDraft({ candidatePipeline: getDefaultCandidatePipeline() });
  }, [step, patchDraft]);

  const [companyRecruiters, setCompanyRecruiters] = React.useState<PublicUser[] | null>(null);
  const [recruitersError, setRecruitersError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (step !== 3) return;
    const token = useAuthStore.getState().token;
    if (!token) {
      setCompanyRecruiters([]);
      setRecruitersError(null);
      return;
    }
    let cancelled = false;
    setCompanyRecruiters(null);
    setRecruitersError(null);
    listCompanyRecruiters(token)
      .then((r) => {
        if (!cancelled) setCompanyRecruiters(r.recruiters);
      })
      .catch((e) => {
        if (!cancelled) {
          setCompanyRecruiters([]);
          setRecruitersError(
            e instanceof ApiError ? e.message : "Could not load teammates.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [step]);

  /** Drop assignees that are not in the loaded same-company list (e.g. old mock ids). */
  React.useEffect(() => {
    if (step !== 3 || companyRecruiters === null) return;
    const validIds = new Set(companyRecruiters.map((u) => String(u.id)));
    const pl =
      useJobOpeningDraftStore.getState().draft.candidatePipeline ??
      getDefaultCandidatePipeline();
    let changed = false;
    const nextMiddle = pl.middleStages.map((s) => {
      if (s.assigneeId !== null && !validIds.has(s.assigneeId)) {
        changed = true;
        return { ...s, assigneeId: null };
      }
      return s;
    });
    if (changed) {
      patchDraft({ candidatePipeline: { middleStages: nextMiddle } });
    }
  }, [step, companyRecruiters, patchDraft]);

  const assigneeOptions = React.useMemo(
    () => buildPipelineAssigneeOptions(companyRecruiters ?? []),
    [companyRecruiters],
  );
  const assigneeOptionsLoading = step === 3 && companyRecruiters === null;
  const assigneeCompanyHint = useAuthStore((s) => s.user?.companyName?.trim()) || null;

  const handleDraftChange = (next: typeof draft) => {
    setDraft(next);
    setStep1FieldErrors({});
    setStep1Error(null);
  };

  const applicationForm = draft.applicationForm ?? getDefaultApplicationForm();
  const candidatePipeline: CandidatePipelineState =
    draft.candidatePipeline ?? getDefaultCandidatePipeline();

  const handleApplicationFormChange = React.useCallback(
    (nextApp: ApplicationFormState) => {
      setDraft({
        ...useJobOpeningDraftStore.getState().draft,
        applicationForm: nextApp,
      });
    },
    [setDraft],
  );

  const handlePipelineChange = React.useCallback(
    (next: CandidatePipelineState) => {
      patchDraft({ candidatePipeline: next });
    },
    [patchDraft],
  );

  const goToStep = (id: number) => {
    if (!canNavigateToStep(id, step1Completed, step2Completed)) return;
    setStep1Error(null);
    setStep3Error(null);
    setStep1FieldErrors({});
    setStep(id);
  };

  const handleNextOrCreate = async () => {
    setStep1Error(null);
    setStep3Error(null);
    if (step === 1) {
      const result = validateJobPostStep1(draft);
      if (!result.ok) {
        setStep1FieldErrors(result.fieldErrors);
        const vals = Object.values(result.fieldErrors);
        setStep1Error(
          vals.length > 1
            ? vals.join(" · ")
            : result.message ?? "Complete the required fields to continue.",
        );
        return;
      }
      setStep1FieldErrors({});
      setStep1Completed(true);
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep2Completed(true);
      setStep(3);
      return;
    }
    if (step === 3) {
      const pl =
        useJobOpeningDraftStore.getState().draft.candidatePipeline ??
        getDefaultCandidatePipeline();
      for (const s of pl.middleStages) {
        if (!String(s.stageName ?? "").trim()) {
          setStep3Error("Each pipeline stage must have a stage name.");
          return;
        }
      }

      const token = useAuthStore.getState().token;
      if (!token) {
        setStep3Error("Please sign in to create a job opening.");
        return;
      }

      const fullDraft = useJobOpeningDraftStore.getState().draft;
      const payload = mapJobDraftToCreatePayload(fullDraft, pl);

      setIsCreating(true);
      try {
        const editId = useJobOpeningDraftStore.getState().editingJobOpeningId;
        if (editId != null) {
          await updateJobOpening(editId, { data: payload }, token);
        } else {
          await createJobOpening({ data: payload }, token);
        }
        resetToUpload();
        useJobOpeningDraftStore.persist.clearStorage();
        router.push("/resume-screening/job-openings");
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not create the job opening. Try again.";
        setStep3Error(msg);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-0">
      <header className="shrink-0 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <nav aria-label="Job opening steps" className="min-w-0 flex-1">
            <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6 lg:gap-10">
              {STEPS.map((s) => {
                const active = step === s.id;
                const done = step > s.id;
                const locked = !canNavigateToStep(s.id, step1Completed, step2Completed);
                const navTitle = stepNavTitle(s.id, step1Completed, step2Completed);
                return (
                  <li key={s.id} className="min-w-0 flex-1 sm:flex-initial sm:max-w-[220px]">
                    <button
                      type="button"
                      disabled={locked}
                      aria-disabled={locked}
                      title={navTitle}
                      onClick={() => goToStep(s.id)}
                      className={`w-full text-left transition ${
                        locked
                          ? "cursor-not-allowed text-gray-400 opacity-60 dark:text-gray-600"
                          : active
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            active
                              ? "bg-brand-500 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-brand-400 dark:ring-offset-gray-900"
                              : done
                                ? "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
                                : locked
                                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {s.id}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-white">
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                            {s.description}
                          </span>
                        </span>
                      </div>
                      {active ? (
                        <span className="mt-2 block h-0.5 w-full rounded-full bg-brand-500 dark:bg-brand-400" />
                      ) : (
                        <span className="mt-2 block h-0.5 w-full rounded-full bg-transparent" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreating}
              onClick={() => void handleNextOrCreate()}
              className="bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {step === 3
                ? isCreating
                  ? editingJobOpeningId != null
                    ? "Saving…"
                    : "Creating…"
                  : editingJobOpeningId != null
                    ? "Save changes"
                    : "Create Job Opening"
                : "Next"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col pt-5 pb-6">
        {step1Error && step === 1 ? (
          <div
            className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/20"
            role="alert"
          >
            {step1Error}
          </div>
        ) : null}

        {step3Error && step === 3 ? (
          <div
            className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive dark:bg-destructive/20"
            role="alert"
          >
            {step3Error}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <JobPostFormPanel
                draft={draft}
                onChange={handleDraftChange}
                fieldErrors={step1FieldErrors}
              />
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <JobPostLivePreview
                draft={draft}
                shareJobOpeningId={editingJobOpeningId ?? undefined}
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <ApplicationFormStepPanel
                applicationForm={applicationForm}
                onChange={handleApplicationFormChange}
              />
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <ApplicationFormPreview applicationForm={applicationForm} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <CandidatePipelineStep
              pipeline={candidatePipeline}
              onChange={handlePipelineChange}
              assigneeOptions={assigneeOptions}
              assigneeOptionsLoading={assigneeOptionsLoading}
              assigneeOptionsError={recruitersError}
              assigneeCompanyHint={assigneeCompanyHint}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
