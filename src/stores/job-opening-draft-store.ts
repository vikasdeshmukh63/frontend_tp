"use client";

import { getEmptyJobPostDraft } from "@/components/resume-screening/job-opening/mockJobPostData";
import type { JobPostDraft } from "@/types/job-post-draft";
import { getDefaultCandidatePipeline } from "@/types/candidate-pipeline";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "talent-job-opening-draft";

/** Avoid ReferenceError on SSR when `localStorage` is not defined; persist needs a real storage object. */
function getLocalStorageOrNoop(): Storage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
      length: 0,
      clear: () => {},
    } as Storage;
  }
  return window.localStorage;
}

export type JobOpeningFlowPhase = "upload" | "wizard";

type JobOpeningDraftState = {
  flowPhase: JobOpeningFlowPhase;
  draft: JobPostDraft;
  step: number;
  /** User advanced past step 1 via Next (unlocks step 2). */
  step1Completed: boolean;
  /** User advanced past step 2 via Next (unlocks step 3). */
  step2Completed: boolean;
  setDraft: (draft: JobPostDraft) => void;
  patchDraft: (partial: Partial<JobPostDraft>) => void;
  setStep: (step: number) => void;
  setStep1Completed: (done: boolean) => void;
  setStep2Completed: (done: boolean) => void;
  /** After PDF parse or “sample” — opens wizard at step 1. */
  enterWizard: (draft: JobPostDraft) => void;
  /** Upload screen → empty wizard (Start from scratch). */
  startWizardEmpty: () => void;
  /** Back to upload with empty draft (e.g. after finishing or explicit reset). */
  resetToUpload: () => void;
};

export const useJobOpeningDraftStore = create<JobOpeningDraftState>()(
  persist(
    (set) => ({
      flowPhase: "upload",
      draft: getEmptyJobPostDraft(),
      step: 1,
      step1Completed: false,
      step2Completed: false,

      setDraft: (draft) => set({ draft }),

      patchDraft: (partial) =>
        set((s) => ({
          draft: { ...s.draft, ...partial },
        })),

      setStep: (step) => set({ step }),

      setStep1Completed: (step1Completed) => set({ step1Completed }),

      setStep2Completed: (step2Completed) => set({ step2Completed }),

      enterWizard: (draft) =>
        set({
          flowPhase: "wizard",
          draft,
          step: 1,
          step1Completed: false,
          step2Completed: false,
        }),

      startWizardEmpty: () =>
        set({
          flowPhase: "wizard",
          draft: getEmptyJobPostDraft(),
          step: 1,
          step1Completed: false,
          step2Completed: false,
        }),

      resetToUpload: () =>
        set({
          flowPhase: "upload",
          draft: getEmptyJobPostDraft(),
          step: 1,
          step1Completed: false,
          step2Completed: false,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(getLocalStorageOrNoop),
      partialize: (s) => ({
        flowPhase: s.flowPhase,
        draft: s.draft,
        step: s.step,
        step1Completed: s.step1Completed,
        step2Completed: s.step2Completed,
      }),
      version: 3,
      migrate: (persistedState: unknown) => {
        const p = persistedState as Record<string, unknown> | null;
        if (!p || typeof p !== "object") return persistedState;
        let next: Record<string, unknown> = { ...p };
        if (typeof next.step2Completed !== "boolean") {
          next = { ...next, step2Completed: false };
        }
        const draft = next.draft as Record<string, unknown> | undefined;
        if (draft && typeof draft === "object" && !("candidatePipeline" in draft)) {
          next = {
            ...next,
            draft: {
              ...draft,
              candidatePipeline: getDefaultCandidatePipeline(),
            },
          };
        }
        return next;
      },
    },
  ),
);

/** Wait for persist rehydration from localStorage before using flow state (avoids SSR / flash). */
export function useJobOpeningDraftHydrated(): boolean {
  const persistApi = useJobOpeningDraftStore.persist;

  const [hydrated, setHydrated] = useState(
    () => persistApi?.hasHydrated() ?? true,
  );

  useEffect(() => {
    const api = useJobOpeningDraftStore.persist;
    if (!api) {
      setHydrated(true);
      return;
    }
    if (api.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = api.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
