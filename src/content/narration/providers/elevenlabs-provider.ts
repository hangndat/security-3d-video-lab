import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import type { CaptionTimingEntry } from "../../composition/generate-caption-timing-map.js";
import type { NarrationProvider, NarrationSynthesisResult } from "./types.js";

export const ELEVENLABS_PROVIDER_ID = "elevenlabs";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const SAMPLE_RATE = 22050;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

export type ElevenLabsFetchResult = {
  ok: boolean;
  status?: number;
  audioBytes?: Buffer;
};

export type ElevenLabsProviderOptions = {
  apiKey: string;
  voiceId?: string;
  fetchImpl?: (url: string, init: RequestInit) => ElevenLabsFetchResult;
};

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function computeContentHash(
  entry: CaptionTimingEntry,
  durationMs: number,
  providerId: string,
  byteLength: number
): string {
  return sha256(`${entry.analyticKey}|${entry.scriptIntent}|${durationMs}|${providerId}|${byteLength}`);
}

function wrapPcmInWav(pcmBytes: Buffer, durationSeconds: number): Buffer {
  const targetSamples = Math.max(1, Math.round(SAMPLE_RATE * durationSeconds));
  const blockAlign = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const targetDataSize = targetSamples * blockAlign;
  const dataSize = Math.min(pcmBytes.length, targetDataSize);
  const buffer = Buffer.alloc(44 + targetDataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + targetDataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(targetDataSize, 40);
  pcmBytes.copy(buffer, 44, 0, dataSize);

  return buffer;
}

function requestAudioBytes(
  options: ElevenLabsProviderOptions,
  voiceId: string,
  text: string
): Buffer {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_22050`;

  if (options.fetchImpl) {
    const response = options.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": options.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1"
      })
    });

    if (!response.ok) {
      throw new Error(
        `ElevenLabs TTS failed (${response.status ?? "unknown"}): ${text.slice(0, 80)}`
      );
    }
    if (!response.audioBytes || response.audioBytes.length === 0) {
      throw new Error("ElevenLabs TTS returned empty audio payload.");
    }
    return response.audioBytes;
  }

  const tempDir = mkdtempSync(join(tmpdir(), "elevenlabs-tts-"));
  const outputPath = join(tempDir, "segment.pcm");

  try {
    const result = spawnSync(
      "curl",
      [
        "-sS",
        "-f",
        "-X",
        "POST",
        url,
        "-H",
        `xi-api-key: ${options.apiKey}`,
        "-H",
        "Content-Type: application/json",
        "-d",
        JSON.stringify({ text, model_id: "eleven_monolingual_v1" }),
        "-o",
        outputPath
      ],
      { encoding: "utf-8" }
    );

    if (result.status !== 0) {
      throw new Error(
        `ElevenLabs curl request failed (${result.status ?? "unknown"}): ${result.stderr || result.stdout}`
      );
    }

    return readFileSync(outputPath);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export class ElevenLabsProvider implements NarrationProvider {
  readonly id = ELEVENLABS_PROVIDER_ID;

  constructor(private readonly options: ElevenLabsProviderOptions) {}

  synthesizeSegment(
    entry: CaptionTimingEntry,
    targetDurationSeconds: number
  ): NarrationSynthesisResult {
    const pcmBytes = requestAudioBytes(this.options, this.options.voiceId ?? DEFAULT_VOICE_ID, entry.scriptIntent);
    const audioBytes = wrapPcmInWav(pcmBytes, targetDurationSeconds);
    const durationMs = Math.round(targetDurationSeconds * 1000);

    return {
      actualDurationSeconds: Number((durationMs / 1000).toFixed(3)),
      contentHash: computeContentHash(entry, durationMs, this.id, audioBytes.length),
      audioBytes
    };
  }
}

export function createElevenLabsProvider(options: ElevenLabsProviderOptions): ElevenLabsProvider {
  if (!options.apiKey.trim()) {
    throw new Error("ElevenLabs provider requires a non-empty apiKey.");
  }
  return new ElevenLabsProvider(options);
}
