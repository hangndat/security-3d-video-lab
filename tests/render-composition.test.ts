import { mkdtempSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { captureVizFramePng } from "../src/render/headless/capture-viz-frame-png.js";
import {
  buildDeterministicTraceInputs,
  deriveRenderFrameState,
  renderCompositionProductionMp4
} from "../src/render/remotion/render-composition.js";

function headlessGlAvailable(): boolean {
  try {
    captureVizFramePng(goldenSceneSpec, 0, { width: 64, height: 36 });
    return true;
  } catch {
    return false;
  }
}

const glAvailable = headlessGlAvailable();
const shortSceneSpec = { ...goldenSceneSpec, totalFrames: 2 };

describe("render composition determinism", () => {
  it("derives render state only from scheduler output and frame", () => {
    const stateA = deriveRenderFrameState(goldenSceneSpec, 42);
    const stateB = deriveRenderFrameState(goldenSceneSpec, 42);

    expect(stateA).toEqual(stateB);
    expect(stateA.frame).toBe(42);
    expect(stateA.seed).toBe(goldenSceneSpec.seed);
  });

  it("produces identical timeline trace inputs for identical invocations", () => {
    const frames = [0, 30, 90, 180, 270, 359];
    const firstRun = buildDeterministicTraceInputs(goldenSceneSpec, frames);
    const secondRun = buildDeterministicTraceInputs(goldenSceneSpec, frames);

    expect(firstRun).toEqual(secondRun);
  });
});

describe("renderCompositionProductionMp4 backends", () => {
  it("trace-hash backend writes non-empty MP4 for short fixture", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "render-composition-trace-"));
    const outputPath = join(tempDir, "trace-hash.mp4");

    try {
      renderCompositionProductionMp4(shortSceneSpec, outputPath, { backend: "trace-hash" });
      expect(statSync(outputPath).size).toBeGreaterThan(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it.skipIf(!glAvailable)("r3f-headless backend writes non-empty MP4 for short fixture", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "render-composition-r3f-"));
    const outputPath = join(tempDir, "r3f-headless.mp4");

    try {
      renderCompositionProductionMp4(shortSceneSpec, outputPath, { backend: "r3f-headless" });
      expect(statSync(outputPath).size).toBeGreaterThan(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
