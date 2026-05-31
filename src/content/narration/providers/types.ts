import type { CaptionTimingEntry } from "../composition/generate-caption-timing-map.js";

export interface NarrationSynthesisResult {
  actualDurationSeconds: number;
  contentHash: string;
  audioBytes: Buffer;
}

export interface NarrationProvider {
  id: string;
  synthesizeSegment(
    entry: CaptionTimingEntry,
    targetDurationSeconds: number
  ): NarrationSynthesisResult;
}
