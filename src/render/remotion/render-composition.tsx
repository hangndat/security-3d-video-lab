import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { validateSceneSpec } from "../../engine/contracts/validate-scene-spec.js";
import { scheduleFrame, type ScheduledFrameState } from "../../engine/timeline/scheduler.js";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

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

function colorFromTrace(traceInput: string): [number, number, number] {
  const digest = createHash("sha256").update(traceInput).digest();
  return [digest[0] ?? 0, digest[1] ?? 0, digest[2] ?? 0];
}

function writePpmFrame(framePath: string, width: number, height: number, color: [number, number, number]): void {
  const header = `P6\n${width} ${height}\n255\n`;
  const body = Buffer.alloc(width * height * 3);
  for (let index = 0; index < body.length; index += 3) {
    body[index] = color[0];
    body[index + 1] = color[1];
    body[index + 2] = color[2];
  }
  writeFileSync(framePath, Buffer.concat([Buffer.from(header, "ascii"), body]));
}

export function renderCompositionDemoMp4(sceneSpec: SceneSpec, outputPath: string): void {
  assertValidSceneSpec(sceneSpec);
  mkdirSync(dirname(outputPath), { recursive: true });

  const width = 320;
  const height = 180;
  const fps = 30;
  const frameCount = 30;
  const tempDir = mkdtempSync(join(tmpdir(), "composition-frames-"));

  try {
    for (let frame = 0; frame < frameCount; frame += 1) {
      const renderState = deriveRenderFrameState(sceneSpec, frame);
      const color = colorFromTrace(renderState.timelineTraceInput);
      const framePath = join(tempDir, `frame-${String(frame + 1).padStart(4, "0")}.ppm`);
      writePpmFrame(framePath, width, height, color);
    }

    const encode = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-framerate",
        String(fps),
        "-i",
        join(tempDir, "frame-%04d.ppm"),
        "-pix_fmt",
        "yuv420p",
        outputPath
      ],
      { stdio: "pipe", encoding: "utf8" }
    );
    if (encode.status !== 0) {
      throw new Error(`ffmpeg encoding failed: ${encode.stderr || encode.stdout}`.trim());
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
