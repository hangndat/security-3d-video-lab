import { createHash } from "node:crypto";

import type { CaptionTimingEntry } from "../../composition/generate-caption-timing-map.js";
import type { NarrationProvider, NarrationSynthesisResult } from "./types.js";

export const DETERMINISTIC_STUB_PROVIDER_ID = "deterministic-stub";
const SAMPLE_RATE = 22050;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function createSilentWav(durationSeconds: number): Buffer {
  const numSamples = Math.max(1, Math.round(SAMPLE_RATE * durationSeconds));
  const blockAlign = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function computeContentHash(
  entry: CaptionTimingEntry,
  durationMs: number,
  providerId: string
): string {
  return sha256(`${entry.analyticKey}|${entry.scriptIntent}|${durationMs}|${providerId}`);
}

export class DeterministicStubProvider implements NarrationProvider {
  readonly id = DETERMINISTIC_STUB_PROVIDER_ID;

  synthesizeSegment(
    entry: CaptionTimingEntry,
    targetDurationSeconds: number
  ): NarrationSynthesisResult {
    const durationMs = Math.round(targetDurationSeconds * 1000);
    const audioBytes = createSilentWav(targetDurationSeconds);
    return {
      actualDurationSeconds: Number((durationMs / 1000).toFixed(3)),
      contentHash: computeContentHash(entry, durationMs, this.id),
      audioBytes
    };
  }
}

export function createDeterministicStubProvider(): DeterministicStubProvider {
  return new DeterministicStubProvider();
}

export function synthesizeStubSegmentBytes(
  entry: CaptionTimingEntry,
  targetDurationSeconds: number
): Buffer {
  return createDeterministicStubProvider().synthesizeSegment(entry, targetDurationSeconds).audioBytes;
}
