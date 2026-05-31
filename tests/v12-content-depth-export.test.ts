import { mkdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { buildLongFormSceneSpec } from "../src/content/composition/build-long-form-scene-spec.js";
import {
  BRANCH_IDS,
  BRANCHED_ASSEMBLY_SLUG,
  DEPTH_ASSEMBLY_SLUG,
  EXPORT_ROOT_PHASE12,
  getManifestSceneFixtures,
  MANIFEST_SCENE_FIXTURES
} from "../src/fixtures/manifest-scene-fixtures.js";
import {
  buildLongFormExportBundle,
  hashExportBundleEnvelope
} from "../src/render/export/build-long-form-export-bundle.js";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";
import { assertExportQuality } from "../src/verification/export-quality.js";

describe("manifest scene fixtures registry", () => {
  it("exports all nine manifest topic keys", () => {
    const manifest = loadTopicManifest();
    const fixtures = getManifestSceneFixtures();

    expect(manifest.order).toHaveLength(9);
    for (const topic of manifest.order) {
      expect(fixtures[topic]).toBeDefined();
      expect(fixtures[topic].sceneId).toBeTruthy();
    }
  });

  it("v1.2 fixtures use unique seeds and slug-aligned sceneIds", () => {
    const v12Fixtures = [
      MANIFEST_SCENE_FIXTURES["zero-trust-access"],
      MANIFEST_SCENE_FIXTURES["oauth-jwt-session"],
      MANIFEST_SCENE_FIXTURES["api-gateway-waf"]
    ];

    const seeds = v12Fixtures.map((scene) => scene.seed);
    const sceneIds = v12Fixtures.map((scene) => scene.sceneId);

    expect(new Set(seeds).size).toBe(3);
    expect(sceneIds).toEqual([
      "zero-trust-access-scene",
      "oauth-jwt-session-scene",
      "api-gateway-waf-scene"
    ]);
    for (const scene of v12Fixtures) {
      expect(scene.totalFrames).toBeGreaterThanOrEqual(240);
    }
  });
});

describe("v1.2 content depth export coverage (VER-04)", () => {
  it("exports all nine manifest topics with quality gates", () => {
    mkdirSync(EXPORT_ROOT_PHASE12, { recursive: true });
    const contracts = loadTopicContracts();
    const fixtures = getManifestSceneFixtures();

    for (const topic of loadTopicManifest().order) {
      const contract = contracts.find((entry) => entry.contract.topic === topic)!.contract;
      const scene = fixtures[topic];
      const outputPath = `${EXPORT_ROOT_PHASE12}/${contract.slug}.mp4`;

      renderCompositionDemoMp4(scene, outputPath);
      assertExportQuality(outputPath, `${contract.slug}.mp4`);
    }
  });

  it("exports content-depth-long-v1 stitched assembly", () => {
    mkdirSync(EXPORT_ROOT_PHASE12, { recursive: true });
    const stitched = buildLongFormSceneSpec(DEPTH_ASSEMBLY_SLUG, getManifestSceneFixtures());
    const outputPath = `${EXPORT_ROOT_PHASE12}/${DEPTH_ASSEMBLY_SLUG}.mp4`;

    renderCompositionDemoMp4(stitched, outputPath);
    assertExportQuality(outputPath, `${DEPTH_ASSEMBLY_SLUG}.mp4`);
    expect(stitched.sceneId).toBe(DEPTH_ASSEMBLY_SLUG);
  });

  for (const branchId of BRANCH_IDS) {
    it(`exports branched ${branchId} path with branch sceneId`, () => {
      mkdirSync(EXPORT_ROOT_PHASE12, { recursive: true });
      const stitched = buildLongFormSceneSpec(BRANCHED_ASSEMBLY_SLUG, getManifestSceneFixtures(), {
        branchId
      });
      const outputPath = `${EXPORT_ROOT_PHASE12}/${BRANCHED_ASSEMBLY_SLUG}-${branchId}.mp4`;

      renderCompositionDemoMp4(stitched, outputPath);
      assertExportQuality(outputPath, `${BRANCHED_ASSEMBLY_SLUG}-${branchId}.mp4`);
      expect(stitched.sceneId).toBe(`${BRANCHED_ASSEMBLY_SLUG}:${branchId}`);
    });
  }

  it("buildLongFormExportBundle produces stable bundleHash across runs", () => {
    const scenes = getManifestSceneFixtures();

    for (const branchId of [undefined, ...BRANCH_IDS] as const) {
      const options = branchId ? { branchId } : undefined;
      const first = buildLongFormExportBundle(BRANCHED_ASSEMBLY_SLUG, scenes, options);
      const second = buildLongFormExportBundle(BRANCHED_ASSEMBLY_SLUG, scenes, options);

      expect(second.bundleHash).toBe(first.bundleHash);
      expect(hashExportBundleEnvelope(second)).toBe(second.bundleHash);
    }

    const depthFirst = buildLongFormExportBundle(DEPTH_ASSEMBLY_SLUG, scenes);
    const depthSecond = buildLongFormExportBundle(DEPTH_ASSEMBLY_SLUG, scenes);
    expect(depthSecond.bundleHash).toBe(depthFirst.bundleHash);
  });
});
