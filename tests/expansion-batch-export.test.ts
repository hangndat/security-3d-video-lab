import { mkdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { buildLongFormSceneSpec } from "../src/content/composition/build-long-form-scene-spec.js";
import {
  getManifestSceneFixtures,
  MANIFEST_SCENE_FIXTURES
} from "../src/fixtures/manifest-scene-fixtures.js";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";
import { assertExportQuality } from "../src/verification/export-quality.js";

const EXPORT_ROOT = ".artifacts/export/phase07";

describe("expansion batch export quality (CINE-02)", () => {
  it("exports all nine manifest topics with scene fixtures", () => {
    mkdirSync(EXPORT_ROOT, { recursive: true });
    const contracts = loadTopicContracts();
    const manifest = loadTopicManifest();
    const fixtures = getManifestSceneFixtures();

    expect(manifest.order).toHaveLength(9);

    for (const topic of manifest.order) {
      const contract = contracts.find((entry) => entry.contract.topic === topic)!.contract;
      const scene = fixtures[topic];
      const outputPath = `${EXPORT_ROOT}/${contract.slug}.mp4`;
      renderCompositionDemoMp4(scene, outputPath);
      assertExportQuality(outputPath, `${contract.slug}.mp4`);
    }
  });

  it("exports canonical and expansion long-form artifacts with quality gates", () => {
    mkdirSync(EXPORT_ROOT, { recursive: true });

    const canonical = buildLongFormSceneSpec("network-foundations-long-v1", {
      tls: MANIFEST_SCENE_FIXTURES.tls,
      ssh: MANIFEST_SCENE_FIXTURES.ssh,
      dns: MANIFEST_SCENE_FIXTURES.dns
    });
    const expansion = buildLongFormSceneSpec("security-expansion-long-v1", MANIFEST_SCENE_FIXTURES);

    const canonicalPath = `${EXPORT_ROOT}/network-foundations-long-v1.mp4`;
    const expansionPath = `${EXPORT_ROOT}/security-expansion-long-v1.mp4`;

    renderCompositionDemoMp4(canonical, canonicalPath);
    renderCompositionDemoMp4(expansion, expansionPath);

    assertExportQuality(canonicalPath, "network-foundations-long-v1.mp4");
    assertExportQuality(expansionPath, "security-expansion-long-v1.mp4");
    expect(canonical.sceneId).toBe("network-foundations-long-v1");
    expect(expansion.sceneId).toBe("security-expansion-long-v1");
  });
});
