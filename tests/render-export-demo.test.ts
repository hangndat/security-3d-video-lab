import { statSync } from "node:fs";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";

describe("demo export pipeline", () => {
  it("exports mp4 from composition-derived deterministic frame state", () => {
    const outputPath = ".artifacts/export/demo.mp4";
    renderCompositionDemoMp4(goldenSceneSpec, outputPath);

    const stats = statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
