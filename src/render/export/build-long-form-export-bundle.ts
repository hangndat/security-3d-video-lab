import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import {
  generateCaptionTimingMap,
  type CaptionTimingMap
} from "../../content/composition/generate-caption-timing-map.js";
import {
  generateNarrationTrack,
  hashCaptionTimingMap,
  hashNarrationTrack,
  writeNarrationArtifacts,
  type NarrationTrackManifest
} from "../../content/narration/generate-narration-track.js";
import { createDeterministicStubProvider } from "../../content/narration/providers/deterministic-stub-provider.js";
import type { TopicId } from "../../content/contracts/types.js";
import {
  buildDeterministicManifest,
  type DeterministicManifest
} from "./fingerprint.js";

export interface LongFormExportBundle {
  schemaVersion: "1.0.0";
  assemblySlug: string;
  branchId?: string;
  sceneId: string;
  captionTimingMapPath: string;
  narrationTrackPath: string;
  bundlePath: string;
  captionMapHash: string;
  narrationTrackHash: string;
  bundleHash: string;
  captionTimingMap: CaptionTimingMap;
  narrationTrack: NarrationTrackManifest;
  deterministicManifest?: DeterministicManifest;
}

export interface BuildLongFormExportBundleOptions {
  branchId?: string;
  traceInputs?: string[];
  specHash?: string;
  seed?: string;
  repoRoot?: string;
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

export function buildExportBundleDir(assemblySlug: string, branchId?: string): string {
  if (branchId) {
    return `.artifacts/exports/${assemblySlug}-${branchId}`;
  }
  return `.artifacts/exports/${assemblySlug}`;
}

export function buildSceneId(assemblySlug: string, branchId?: string): string {
  return branchId ? `${assemblySlug}:${branchId}` : assemblySlug;
}

export function hashExportBundleEnvelope(bundle: LongFormExportBundle): string {
  return sha256(
    stableJson({
      assemblySlug: bundle.assemblySlug,
      branchId: bundle.branchId ?? null,
      sceneId: bundle.sceneId,
      captionMapHash: bundle.captionMapHash,
      narrationTrackHash: bundle.narrationTrackHash
    })
  );
}

export function buildLongFormExportBundle(
  assemblySlug: string,
  topicScenes: Partial<Record<TopicId, SceneSpec>>,
  options: BuildLongFormExportBundleOptions = {}
): LongFormExportBundle {
  const captionTimingMap = generateCaptionTimingMap(assemblySlug, topicScenes, {
    branchId: options.branchId
  });
  const provider = createDeterministicStubProvider();
  const narrationTrack = generateNarrationTrack(captionTimingMap, provider);
  const sceneId = buildSceneId(assemblySlug, options.branchId);
  const exportDir = buildExportBundleDir(assemblySlug, options.branchId);

  const captionMapHash = hashCaptionTimingMap(captionTimingMap);
  const narrationTrackHash = hashNarrationTrack(narrationTrack);

  const bundle: LongFormExportBundle = {
    schemaVersion: "1.0.0",
    assemblySlug,
    branchId: options.branchId,
    sceneId,
    captionTimingMapPath: `${exportDir}/caption-timing-map.json`,
    narrationTrackPath: `${exportDir}/narration-track.json`,
    bundlePath: `${exportDir}/export-bundle.json`,
    captionMapHash,
    narrationTrackHash,
    bundleHash: "",
    captionTimingMap,
    narrationTrack
  };

  if (options.traceInputs && options.traceInputs.length > 0) {
    bundle.deterministicManifest = buildDeterministicManifest({
      sceneId,
      specHash: options.specHash ?? sha256(stableJson(captionTimingMap)),
      seed: options.seed ?? narrationTrack.captionMapHash.slice(0, 16),
      frameHashes: options.traceInputs.map((traceInput) => sha256(traceInput)),
      normalizedMetadata: {
        codec: "h264",
        container: "mp4",
        durationMs: Math.round(narrationTrack.totalDurationSeconds * 1000)
      },
      provenance: {
        node: process.version,
        remotion: "4.0.468",
        ffmpeg: "stub"
      }
    });
  }

  bundle.bundleHash = hashExportBundleEnvelope(bundle);
  return bundle;
}

export interface WriteExportBundleArtifactsResult {
  bundlePath: string;
  captionPath: string;
  narrationPath: string;
}

export function writeExportBundleArtifacts(
  bundle: LongFormExportBundle,
  repoRoot: string
): WriteExportBundleArtifactsResult {
  const exportDir = resolve(repoRoot, buildExportBundleDir(bundle.assemblySlug, bundle.branchId));
  mkdirSync(exportDir, { recursive: true });

  const captionPath = resolve(repoRoot, bundle.captionTimingMapPath);
  writeFileSync(captionPath, `${JSON.stringify(bundle.captionTimingMap, null, 2)}\n`, "utf-8");

  const provider = createDeterministicStubProvider();
  writeNarrationArtifacts(bundle.narrationTrack, bundle.captionTimingMap, provider, repoRoot);

  const narrationPath = resolve(repoRoot, bundle.narrationTrackPath);
  writeFileSync(narrationPath, `${JSON.stringify(bundle.narrationTrack, null, 2)}\n`, "utf-8");

  const bundlePath = resolve(repoRoot, bundle.bundlePath);
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf-8");

  return { bundlePath, captionPath, narrationPath };
}
