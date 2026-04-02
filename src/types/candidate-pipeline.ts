import { newEntityId } from "@/types/application-form";

/** Addable / configurable stages between Applied and terminal outcomes. */
export type PipelineStageTemplate =
  | "phone_screening"
  | "assessment"
  | "one_way_ai"
  | "conversational_ai"
  | "video_interview"
  | "custom";

/** Fixed terminal stages (order is fixed in UI). */
export type PipelineTerminalKind = "offered" | "hired" | "rejected" | "withdrawn";

export type PipelineMiddleStage = {
  id: string;
  template: PipelineStageTemplate;
  /** Shown to candidates / recruiters (required). */
  stageName: string;
  internalName: string;
  /** Auth service user id of the assigned recruiter (`null` = none). Same company as job creator. */
  assigneeId: string | null;
};

export type CandidatePipelineState = {
  middleStages: PipelineMiddleStage[];
};

export function newPipelineStageId(): string {
  return newEntityId("ps");
}

export function getDefaultCandidatePipeline(): CandidatePipelineState {
  return { middleStages: [] };
}

export function createMiddleStage(
  template: PipelineStageTemplate,
  defaultName: string,
): PipelineMiddleStage {
  return {
    id: newPipelineStageId(),
    template,
    stageName: defaultName,
    internalName: "",
    assigneeId: null,
  };
}
