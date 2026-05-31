import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import tlsProductionSceneSpec from "../src/fixtures/tls-production-scene-spec.json";
import { getComposePlan } from "../src/client/viz/compose-scene.js";
import { CATALOG_VIZ_MODULE_IDS } from "../src/client/viz/registry.js";
import { createHeadlessModuleMeshes } from "../src/client/viz/viz-mesh-spec.js";
import { captureVizFramePng } from "../src/render/headless/capture-viz-frame-png.js";
import {
  buildVizThreeScene,
  countSceneMeshes
} from "../src/render/headless/build-viz-three-scene.js";
import { buildTlsProductionCaptionMap } from "../src/verification/tls-production-rubric.js";

function headlessGlAvailable(): boolean {
  try {
    captureVizFramePng(goldenSceneSpec, 0, { width: 64, height: 36 });
    return true;
  } catch {
    return false;
  }
}

const glAvailable = headlessGlAvailable();

describe("headless scene parity (no GL)", () => {
  it("factory dispatch covers all catalog module ids for golden frame 0", () => {
    const plan = getComposePlan(goldenSceneSpec, 0);
    const context = { sceneSpec: goldenSceneSpec, frame: 0, plan };

    for (const moduleId of CATALOG_VIZ_MODULE_IDS) {
      expect(() => createHeadlessModuleMeshes(moduleId, context)).not.toThrow();
    }
  });
});

describe.skipIf(!glAvailable)("headless scene parity (GL)", () => {
  it("golden-scene-spec frame 0 includes mesh for each active packet/tunnel module", () => {
    const { scene, plan } = buildVizThreeScene(goldenSceneSpec, 0, 320, 180);
    const meshCount = countSceneMeshes(scene);
    const activeModules = plan.renderOrder.filter(
      (moduleId) =>
        moduleId.startsWith("viz-packet-") || moduleId.startsWith("viz-tunnel-")
    );

    expect(activeModules.length).toBeGreaterThan(0);
    expect(meshCount).toBeGreaterThanOrEqual(activeModules.length);
  });

  it("tls-production frame 270 has more meshes than packet-only frame 0", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const sparse = buildVizThreeScene(tlsProductionSceneSpec, 0, 320, 180, captionMap);
    const rich = buildVizThreeScene(tlsProductionSceneSpec, 270, 320, 180, captionMap);

    expect(countSceneMeshes(rich.scene)).toBeGreaterThan(countSceneMeshes(sparse.scene));
    expect(rich.plan.renderOrder.some((id) => id.startsWith("viz-cert-"))).toBe(true);
  });

  it("tls-production frame 525 dispatches every module in renderOrder", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const { scene, plan } = buildVizThreeScene(tlsProductionSceneSpec, 525, 320, 180, captionMap);

    for (const moduleId of plan.renderOrder) {
      expect(() =>
        createHeadlessModuleMeshes(moduleId as (typeof CATALOG_VIZ_MODULE_IDS)[number], {
          sceneSpec: tlsProductionSceneSpec,
          frame: 525,
          plan
        })
      ).not.toThrow();
    }

    expect(countSceneMeshes(scene)).toBeGreaterThan(0);
  });
});
