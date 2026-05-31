import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

import type {
  CaptionTimingMap
} from "../composition/generate-caption-timing-map.js";
import { createDeterministicStubProvider } from "./providers/deterministic-stub-provider.js";
import type { NarrationProvider } from "./providers/types.js";
import { validateNarrationAlignment } from "./validate-narration-alignment.js";

export interface NarrationSegment {
  topic: string;
  beatId: string;
  analyticKey: string;
  startSeconds: number;
  endSeconds: number;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  scriptIntent: string;
  providerId: string;
  contentHash: string;
  audioArtifactPath: string;
}

export interface NarrationTrackManifest {
  schemaVersion: "1.0.0";
  assemblySlug: string;
  branchId?: string;
  providerId: string;
  fps: number;
  captionMapHash: string;
  totalDurationSeconds: number;
  segments: NarrationSegment[];
}

export interface GenerateNarrationTrackOptions {
  artifactsRoot?: string;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function stableJson(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.map((item) => stableJson(item)).join(",")}]`;
  }
  if (input && typeof input === "object") {
    const entries = Object.entries(input).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`).join(",")}}`;
  }
  return JSON.stringify(input);
}

export function hashCaptionTimingMap(captionMap: CaptionTimingMap): string {
  return sha256(stableJson(captionMap));
}

export function hashNarrationTrack(track: NarrationTrackManifest): string {
  return sha256(stableJson(track));
}

export function buildNarrationArtifactDir(
  assemblySlug: string,
  branchId?: string,
  artifactsRoot = ".artifacts/narration"
): string {
  if (branchId) {
    return `${artifactsRoot}/${assemblySlug}/${branchId}`;
  }
  return `${artifactsRoot}/${assemblySlug}`;
}

export function buildSegmentAudioPath(
  assemblySlug: string,
  analyticKey: string,
  branchId?: string,
  artifactsRoot = ".artifacts/narration"
): string {
  const safeKey = analyticKey.replace(/:/g, "-");
  return `${buildNarrationArtifactDir(assemblySlug, branchId, artifactsRoot)}/${safeKey}.wav`;
}

export function generateNarrationTrack(
  captionMap: CaptionTimingMap,
  provider: NarrationProvider = createDeterministicStubProvider(),
  options: GenerateNarrationTrackOptions = {}
): NarrationTrackManifest {
  const artifactsRoot = options.artifactsRoot ?? ".artifacts/narration";
  const segments: NarrationSegment[] = captionMap.entries.map((entry) => {
    const targetDurationSeconds = Number((entry.endSeconds - entry.startSeconds).toFixed(3));
    const synthesis = provider.synthesizeSegment(entry, targetDurationSeconds);

    return {
      topic: entry.topic,
      beatId: entry.beatId,
      analyticKey: entry.analyticKey,
      startSeconds: entry.startSeconds,
      endSeconds: entry.endSeconds,
      targetDurationSeconds,
      actualDurationSeconds: synthesis.actualDurationSeconds,
      scriptIntent: entry.scriptIntent,
      providerId: provider.id,
      contentHash: synthesis.contentHash,
      audioArtifactPath: buildSegmentAudioPath(
        captionMap.assemblySlug,
        entry.analyticKey,
        captionMap.branchId,
        artifactsRoot
      )
    };
  });

  const track: NarrationTrackManifest = {
    schemaVersion: "1.0.0",
    assemblySlug: captionMap.assemblySlug,
    ...(captionMap.branchId ? { branchId: captionMap.branchId } : {}),
    providerId: provider.id,
    fps: captionMap.fps,
    captionMapHash: hashCaptionTimingMap(captionMap),
    totalDurationSeconds:
      segments.length > 0 ? segments[segments.length - 1]!.endSeconds : 0,
    segments
  };

  const alignment = validateNarrationAlignment(captionMap, track);
  if (!alignment.valid) {
    throw new Error(`Narration alignment failed:\n${alignment.errors.join("\n")}`);
  }

  return track;
}

export interface WriteNarrationArtifactsResult {
  manifestPath: string;
  audioPaths: string[];
}

export function writeNarrationArtifacts(
  track: NarrationTrackManifest,
  captionMap: CaptionTimingMap,
  provider: NarrationProvider = createDeterministicStubProvider(),
  repoRoot: string
): WriteNarrationArtifactsResult {
  const manifestDir = resolve(
    repoRoot,
    buildNarrationArtifactDir(track.assemblySlug, track.branchId)
  );
  mkdirSync(manifestDir, { recursive: true });

  const audioPaths: string[] = [];
  for (const entry of captionMap.entries) {
    const segment = track.segments.find(
      (item) => item.analyticKey === entry.analyticKey && item.beatId === entry.beatId
    );
    if (!segment) {
      continue;
    }

    const targetDurationSeconds = Number((entry.endSeconds - entry.startSeconds).toFixed(3));
    const synthesis = provider.synthesizeSegment(entry, targetDurationSeconds);
    const audioPath = resolve(repoRoot, segment.audioArtifactPath);
    mkdirSync(dirname(audioPath), { recursive: true });
    writeFileSync(audioPath, synthesis.audioBytes);
    audioPaths.push(audioPath);
  }

  const manifestPath = resolve(manifestDir, "narration-track.json");
  writeFileSync(manifestPath, `${JSON.stringify(track, null, 2)}\n`, "utf-8");

  return { manifestPath, audioPaths };
}
