import { statSync } from "node:fs";
import { basename } from "node:path";
import { spawnSync } from "node:child_process";

import type { SceneSpec } from "../engine/contracts/scene-spec.js";

export interface ExportQualityPolicy {
  codec: string;
  container: string;
  minDurationSeconds: number;
  maxDurationSeconds: number;
}

export const DEFAULT_EXPORT_QUALITY_POLICY: ExportQualityPolicy = {
  codec: "h264",
  container: "mp4",
  minDurationSeconds: 0.9,
  maxDurationSeconds: 1.2
};

export const PRODUCTION_EXPORT_QUALITY_POLICY: ExportQualityPolicy = {
  codec: "h264",
  container: "mp4",
  minDurationSeconds: 7.0,
  maxDurationSeconds: 9.0
};

const PRODUCTION_FPS = 30;
const PRODUCTION_DURATION_TOLERANCE_SECONDS = 0.5;

export function productionPolicyForScene(
  sceneSpec: SceneSpec,
  fps: number = PRODUCTION_FPS,
  toleranceSeconds: number = PRODUCTION_DURATION_TOLERANCE_SECONDS
): ExportQualityPolicy {
  const targetDuration = sceneSpec.totalFrames / fps;
  return {
    codec: "h264",
    container: "mp4",
    minDurationSeconds: Number((targetDuration - toleranceSeconds).toFixed(2)),
    maxDurationSeconds: Number((targetDuration + toleranceSeconds).toFixed(2))
  };
}

export interface ExportProbeResult {
  codec: string;
  durationMs: number;
  formatNames: string[];
}

export function probeExport(videoPath: string): ExportProbeResult {
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name:format=format_name,duration",
      "-of",
      "default=noprint_wrappers=1:nokey=0",
      videoPath
    ],
    { encoding: "utf8" }
  );

  if (probe.status !== 0) {
    throw new Error(`ffprobe failed for ${videoPath}: ${probe.stderr || probe.stdout}`);
  }

  const lines = probe.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const codec = lines.find((line) => line.startsWith("codec_name="))?.slice("codec_name=".length);
  const format = lines.find((line) => line.startsWith("format_name="))?.slice("format_name=".length);
  const durationValue = lines.find((line) => line.startsWith("duration="))?.slice("duration=".length);
  const durationSeconds = Number(durationValue);

  if (!codec || !format || Number.isNaN(durationSeconds)) {
    throw new Error(`ffprobe returned incomplete metadata for ${videoPath}: ${probe.stdout}`);
  }

  return {
    codec,
    formatNames: format.split(",").map((entry) => entry.trim()),
    durationMs: Math.round(durationSeconds * 1000)
  };
}

export function assertNonZeroFileSize(videoPath: string): number {
  const fileStats = statSync(videoPath);
  if (fileStats.size <= 0) {
    throw new Error(`Export file is empty: ${videoPath}`);
  }
  return fileStats.size;
}

export function assertExportFileName(videoPath: string, expectedFileName: string): void {
  const name = basename(videoPath);
  if (name !== expectedFileName) {
    throw new Error(`Export naming mismatch. Expected '${expectedFileName}', got '${name}'.`);
  }
}

export function assertExportQuality(
  videoPath: string,
  expectedFileName: string,
  policy: ExportQualityPolicy = DEFAULT_EXPORT_QUALITY_POLICY
): ExportProbeResult {
  assertNonZeroFileSize(videoPath);
  assertExportFileName(videoPath, expectedFileName);

  const metadata = probeExport(videoPath);
  if (metadata.codec !== policy.codec) {
    throw new Error(`Unexpected codec '${metadata.codec}' (expected '${policy.codec}').`);
  }
  if (!metadata.formatNames.includes(policy.container)) {
    throw new Error(
      `Unexpected container format '${metadata.formatNames.join(",")}' (expected '${policy.container}').`
    );
  }

  const durationSeconds = metadata.durationMs / 1000;
  if (durationSeconds < policy.minDurationSeconds || durationSeconds > policy.maxDurationSeconds) {
    throw new Error(
      `Duration ${durationSeconds}s outside window ${policy.minDurationSeconds}-${policy.maxDurationSeconds}s.`
    );
  }

  return metadata;
}
