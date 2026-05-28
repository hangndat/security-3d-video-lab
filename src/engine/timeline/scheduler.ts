import type { SceneSpec } from "../contracts/scene-spec.js";

type TimelineCue = SceneSpec["timeline"][number];

export interface ScheduledFrameState {
  frame: number;
  seed: string;
  sortedTimelineIds: string[];
  activeTimelineIds: string[];
}

function sortTimelineDeterministically(timeline: SceneSpec["timeline"]): TimelineCue[] {
  return [...timeline]
    .map((cue, index) => ({ cue, index }))
    .sort((left, right) => {
      if (left.cue.startFrame !== right.cue.startFrame) {
        return left.cue.startFrame - right.cue.startFrame;
      }
      if (left.cue.track !== right.cue.track) {
        return left.cue.track.localeCompare(right.cue.track);
      }
      if (left.cue.id !== right.cue.id) {
        return left.cue.id.localeCompare(right.cue.id);
      }
      return left.index - right.index;
    })
    .map((entry) => entry.cue);
}

function validateDuplicateIdSemantics(sortedTimeline: TimelineCue[]): void {
  const idWindows = new Map<string, Array<{ start: number; end: number }>>();
  for (const cue of sortedTimeline) {
    const nextWindow = {
      start: cue.startFrame,
      end: cue.startFrame + cue.duration
    };
    const windows = idWindows.get(cue.id) ?? [];
    for (const window of windows) {
      const overlaps = nextWindow.start < window.end && nextWindow.end > window.start;
      if (overlaps) {
        throw new Error(
          `Duplicate timeline id '${cue.id}' has overlapping semantic windows (${window.start}-${window.end} and ${nextWindow.start}-${nextWindow.end}).`
        );
      }
    }
    windows.push(nextWindow);
    idWindows.set(cue.id, windows);
  }
}

export function scheduleFrame(sceneSpec: SceneSpec, frame: number): ScheduledFrameState {
  const sortedTimeline = sortTimelineDeterministically(sceneSpec.timeline);
  validateDuplicateIdSemantics(sortedTimeline);

  const activeTimelineIds = sortedTimeline
    .filter((cue) => frame >= cue.startFrame && frame < cue.startFrame + cue.duration)
    .map((cue) => cue.id);

  return {
    frame,
    seed: sceneSpec.seed,
    sortedTimelineIds: sortedTimeline.map((cue) => cue.id),
    activeTimelineIds
  };
}
