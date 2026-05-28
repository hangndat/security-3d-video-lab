import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { validateSceneSpec } from "../../engine/contracts/validate-scene-spec.js";
import { scheduleFrame, type ScheduledFrameState } from "../../engine/timeline/scheduler.js";

export interface DeterministicRenderFrameState extends ScheduledFrameState {
  timelineTraceInput: string;
}

function assertValidSceneSpec(sceneSpec: SceneSpec): void {
  const validation = validateSceneSpec(sceneSpec);
  if (!validation.ok) {
    const details = validation.errors
      .map((error) => `${error.path} (${error.code}): ${error.message}`)
      .join("; ");
    throw new Error(`SceneSpec validation failed before render: ${details}`);
  }
}

export function deriveRenderFrameState(sceneSpec: SceneSpec, frame: number): DeterministicRenderFrameState {
  assertValidSceneSpec(sceneSpec);
  const scheduled = scheduleFrame(sceneSpec, frame);
  return {
    ...scheduled,
    timelineTraceInput: `${scheduled.seed}:${scheduled.frame}:${scheduled.activeTimelineIds.join(",")}`
  };
}

export function buildDeterministicTraceInputs(sceneSpec: SceneSpec, frames: number[]): string[] {
  assertValidSceneSpec(sceneSpec);
  return frames.map((frame) => deriveRenderFrameState(sceneSpec, frame).timelineTraceInput);
}
