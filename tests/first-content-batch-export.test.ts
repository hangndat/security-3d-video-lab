import { statSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { SceneSpec } from "../src/engine/contracts/scene-spec.js";
import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import {
  buildLongFormSceneSpec,
  longFormAssembly,
  validateLongFormTransitionCoherence
} from "../src/content/batch/first-content-batch.js";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";

describe("phase 03 export batch", () => {
  it("exports three shorts plus one long-form artifact", () => {
    validateLongFormTransitionCoherence();
    const longForm = buildLongFormSceneSpec({
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });

    const outputs: Array<{ scene: SceneSpec; outputPath: string }> = [
      { scene: goldenSceneSpec, outputPath: ".artifacts/export/phase03/tls-short-v1.mp4" },
      { scene: sshSceneSpec, outputPath: ".artifacts/export/phase03/ssh-short-v1.mp4" },
      { scene: dnsSceneSpec, outputPath: ".artifacts/export/phase03/dns-short-v1.mp4" },
      { scene: longForm, outputPath: ".artifacts/export/phase03/network-foundations-long-v1.mp4" }
    ];

    for (const output of outputs) {
      renderCompositionDemoMp4(output.scene, output.outputPath);
      const stats = statSync(output.outputPath);
      expect(stats.size).toBeGreaterThan(0);
    }

    expect(longForm.sceneId).toBe(longFormAssembly.slug);
    expect(longForm.seed).toContain("tls");
    expect(longForm.seed).toContain("ssh");
    expect(longForm.seed).toContain("dns");
    expect(longForm.timeline.length).toBe(
      goldenSceneSpec.timeline.length + sshSceneSpec.timeline.length + dnsSceneSpec.timeline.length
    );
  });
});
