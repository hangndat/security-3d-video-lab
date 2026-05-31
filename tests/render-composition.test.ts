import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import {
  buildDeterministicTraceInputs,
  deriveRenderFrameState
} from "../src/render/remotion/render-composition.js";

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
