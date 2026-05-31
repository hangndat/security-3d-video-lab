import type { CaptionTimingMap } from "../composition/generate-caption-timing-map.js";
import type { NarrationTrackManifest } from "./generate-narration-track.js";

export const NARRATION_DURATION_TOLERANCE_MS = 50;

export interface NarrationAlignmentResult {
  valid: boolean;
  errors: string[];
}

export function validateNarrationAlignment(
  captionMap: CaptionTimingMap,
  narrationTrack: NarrationTrackManifest,
  toleranceMs: number = NARRATION_DURATION_TOLERANCE_MS
): NarrationAlignmentResult {
  const errors: string[] = [];
  const toleranceSeconds = toleranceMs / 1000;

  if (narrationTrack.segments.length !== captionMap.entries.length) {
    errors.push(
      `Segment count mismatch: expected ${captionMap.entries.length}, got ${narrationTrack.segments.length}.`
    );
  }

  for (let index = 0; index < captionMap.entries.length; index += 1) {
    const captionEntry = captionMap.entries[index]!;
    const segment = narrationTrack.segments[index];

    if (!segment) {
      errors.push(`Missing narration segment for caption entry '${captionEntry.analyticKey}'.`);
      continue;
    }

    if (segment.beatId !== captionEntry.beatId) {
      errors.push(
        `Beat id mismatch at index ${index}: expected '${captionEntry.beatId}', got '${segment.beatId}'.`
      );
    }

    if (segment.analyticKey !== captionEntry.analyticKey) {
      errors.push(
        `Analytic key mismatch at index ${index}: expected '${captionEntry.analyticKey}', got '${segment.analyticKey}'.`
      );
    }

    const targetDuration = Number((captionEntry.endSeconds - captionEntry.startSeconds).toFixed(3));
    const delta = Math.abs(segment.actualDurationSeconds - targetDuration);
    if (delta > toleranceSeconds) {
      errors.push(
        `Duration tolerance exceeded for '${captionEntry.analyticKey}': delta ${delta.toFixed(3)}s > ${toleranceSeconds}s.`
      );
    }

    if (Math.abs(segment.targetDurationSeconds - targetDuration) > 0.001) {
      errors.push(
        `Target duration mismatch for '${captionEntry.analyticKey}': expected ${targetDuration}, got ${segment.targetDurationSeconds}.`
      );
    }
  }

  if (narrationTrack.captionMapHash) {
    // Hash parity is validated at generation time; no re-hash here to keep validator pure.
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
