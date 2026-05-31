import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { validateSceneSpec } from "../../engine/contracts/validate-scene-spec.js";
import { scheduleFrame, type ScheduledFrameState } from "../../engine/timeline/scheduler.js";
import { buildVizFrameState, type VizFrameState } from "../../client/viz/build-viz-frame-state.js";
import { getComposePlan } from "../../client/viz/compose-scene.js";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { captureVizFramePng } from "../headless/capture-viz-frame-png.js";
import {
  resolveProductionRenderBackend,
  type ProductionRenderBackend
} from "../headless/resolve-production-render-backend.js";

export interface DeterministicRenderFrameState extends ScheduledFrameState {
  timelineTraceInput: string;
  vizFrameState: VizFrameState;
  vizRenderTraceInput: string;
}

export type ProductionRenderProfile = {
  width: number;
  height: number;
  fps: number;
};

export type DeriveRenderFrameStateOptions = {
  captionMap?: CaptionTimingMap;
};

export type RenderCompositionProductionOptions = {
  profile?: Partial<ProductionRenderProfile>;
  captionMap?: CaptionTimingMap;
  backend?: ProductionRenderBackend;
};

const DEFAULT_PRODUCTION_PROFILE: ProductionRenderProfile = {
  width: 640,
  height: 360,
  fps: 30
};

function assertValidSceneSpec(sceneSpec: SceneSpec): void {
  const validation = validateSceneSpec(sceneSpec);
  if (!validation.ok) {
    const details = validation.errors
      .map((error) => `${error.path} (${error.code}): ${error.message}`)
      .join("; ");
    throw new Error(`SceneSpec validation failed before render: ${details}`);
  }
}

function digestPacketPositions(vizFrameState: VizFrameState): string {
  const parts = vizFrameState.packets
    .map(
      (packet) =>
        `${packet.id}:${packet.progress.toFixed(4)}:${packet.position.x.toFixed(3)},${packet.position.y.toFixed(3)},${packet.position.z.toFixed(3)}:${packet.moduleId}`
    )
    .sort((left, right) => left.localeCompare(right));
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

export function buildVizRenderTraceInput(
  sceneSpec: SceneSpec,
  frame: number,
  captionMap?: CaptionTimingMap
): string {
  assertValidSceneSpec(sceneSpec);
  const scheduled = scheduleFrame(sceneSpec, frame);
  const plan = getComposePlan(sceneSpec, frame, { captionMap });
  const positionsDigest = digestPacketPositions(plan.vizFrameState);
  return `${scheduled.seed}:${scheduled.frame}:${plan.renderOrder.join(",")}:${positionsDigest}`;
}

export function deriveRenderFrameState(
  sceneSpec: SceneSpec,
  frame: number,
  options: DeriveRenderFrameStateOptions = {}
): DeterministicRenderFrameState {
  assertValidSceneSpec(sceneSpec);
  const scheduled = scheduleFrame(sceneSpec, frame);
  const vizFrameState = buildVizFrameState(sceneSpec, frame);
  const timelineTraceInput = `${scheduled.seed}:${scheduled.frame}:${scheduled.activeTimelineIds.join(",")}`;
  const vizRenderTraceInput = buildVizRenderTraceInput(sceneSpec, frame, options.captionMap);

  return {
    ...scheduled,
    timelineTraceInput,
    vizFrameState,
    vizRenderTraceInput
  };
}

export function buildDeterministicTraceInputs(sceneSpec: SceneSpec, frames: number[]): string[] {
  assertValidSceneSpec(sceneSpec);
  return frames.map((frame) => deriveRenderFrameState(sceneSpec, frame).timelineTraceInput);
}

export function stitchSceneSpecsInOrder(
  orderedScenes: Array<{ topic: string; scene: SceneSpec }>,
  stitchedSceneId: string
): SceneSpec {
  if (orderedScenes.length === 0) {
    throw new Error("At least one scene is required to stitch a long-form composition.");
  }

  let frameOffset = 0;
  const actors = new Map<string, SceneSpec["actors"][number]>();
  const packets = new Map<string, SceneSpec["packets"][number]>();
  const timeline: SceneSpec["timeline"] = [];
  const seeds: string[] = [];
  const capabilities: Record<string, boolean> = {};

  for (const { topic, scene } of orderedScenes) {
    seeds.push(`${topic}:${scene.seed}`);
    for (const actor of scene.actors) {
      const actorId = `${topic}-${actor.id}`;
      actors.set(actorId, { ...actor, id: actorId });
    }

    for (const packet of scene.packets) {
      const packetId = `${topic}-${packet.id}`;
      packets.set(packetId, { ...packet, id: packetId });
    }

    for (const cue of scene.timeline) {
      const payload = { ...cue.payload };
      if (typeof payload.packetId === "string") {
        payload.packetId = `${topic}-${payload.packetId}`;
      }

      timeline.push({
        ...cue,
        id: `${topic}-${cue.id}`,
        startFrame: cue.startFrame + frameOffset,
        payload
      });
    }

    Object.assign(capabilities, scene.capabilities);
    frameOffset += scene.totalFrames;
  }

  return {
    schemaVersion: "1.0.0",
    seed: seeds.join("|"),
    sceneId: stitchedSceneId,
    actors: [...actors.values()],
    packets: [...packets.values()],
    timeline,
    totalFrames: frameOffset,
    capabilities
  };
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

type FrameSequenceFormat = "ppm" | "png";

function encodeFrameSequenceToMp4(
  tempDir: string,
  outputPath: string,
  fps: number,
  format: FrameSequenceFormat
): void {
  const pattern = format === "png" ? "frame-%04d.png" : "frame-%04d.ppm";
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
      join(tempDir, pattern),
      "-pix_fmt",
      "yuv420p",
      outputPath
    ],
    { stdio: "pipe", encoding: "utf8" }
  );
  if (encode.status !== 0) {
    throw new Error(`ffmpeg encoding failed: ${encode.stderr || encode.stdout}`.trim());
  }
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

    encodeFrameSequenceToMp4(tempDir, outputPath, fps, "ppm");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function renderProductionFramesR3fHeadless(
  sceneSpec: SceneSpec,
  tempDir: string,
  profile: ProductionRenderProfile,
  captionMap?: CaptionTimingMap
): void {
  for (let frame = 0; frame < sceneSpec.totalFrames; frame += 1) {
    const pngBuffer = captureVizFramePng(sceneSpec, frame, {
      width: profile.width,
      height: profile.height,
      captionMap
    });
    const framePath = join(tempDir, `frame-${String(frame + 1).padStart(4, "0")}.png`);
    writeFileSync(framePath, pngBuffer);
  }
}

function renderProductionFramesTraceHash(
  sceneSpec: SceneSpec,
  tempDir: string,
  profile: ProductionRenderProfile,
  captionMap?: CaptionTimingMap
): void {
  for (let frame = 0; frame < sceneSpec.totalFrames; frame += 1) {
    const renderState = deriveRenderFrameState(sceneSpec, frame, { captionMap });
    const color = colorFromTrace(renderState.vizRenderTraceInput);
    const framePath = join(tempDir, `frame-${String(frame + 1).padStart(4, "0")}.ppm`);
    writePpmFrame(framePath, profile.width, profile.height, color);
  }
}

export function renderCompositionProductionMp4(
  sceneSpec: SceneSpec,
  outputPath: string,
  options: RenderCompositionProductionOptions = {}
): void {
  assertValidSceneSpec(sceneSpec);
  mkdirSync(dirname(outputPath), { recursive: true });

  const profile: ProductionRenderProfile = {
    ...DEFAULT_PRODUCTION_PROFILE,
    ...options.profile
  };
  const backend = options.backend ?? resolveProductionRenderBackend();
  const tempDir = mkdtempSync(join(tmpdir(), `composition-production-${backend}-`));

  try {
    if (backend === "r3f-headless") {
      renderProductionFramesR3fHeadless(sceneSpec, tempDir, profile, options.captionMap);
      encodeFrameSequenceToMp4(tempDir, outputPath, profile.fps, "png");
    } else {
      renderProductionFramesTraceHash(sceneSpec, tempDir, profile, options.captionMap);
      encodeFrameSequenceToMp4(tempDir, outputPath, profile.fps, "ppm");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
