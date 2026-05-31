import { mkdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import authSessionSceneSpec from "../src/fixtures/auth-session-scene-spec.json";
import pkiTrustChainSceneSpec from "../src/fixtures/pki-trust-chain-scene-spec.json";
import mitmDefenseSceneSpec from "../src/fixtures/mitm-defense-scene-spec.json";
import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { buildLongFormSceneSpec } from "../src/content/composition/build-long-form-scene-spec.js";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";
import { assertExportQuality } from "../src/verification/export-quality.js";

const EXPORT_ROOT = ".artifacts/export/phase07";
const ALL_SCENES = {
  tls: goldenSceneSpec,
  ssh: sshSceneSpec,
  dns: dnsSceneSpec,
  "auth-session": authSessionSceneSpec,
  "pki-trust-chain": pkiTrustChainSceneSpec,
  "mitm-defense": mitmDefenseSceneSpec
} as const;

describe("expansion batch export quality (CINE-02)", () => {
  it("exports manifest topics with scene fixtures (six of nine until Phase 12)", () => {
    mkdirSync(EXPORT_ROOT, { recursive: true });
    const contracts = loadTopicContracts();
    const manifest = loadTopicManifest();
    const exportableTopics = manifest.order.filter(
      (topic) => topic in ALL_SCENES
    );

    expect(manifest.order).toHaveLength(9);
    expect(exportableTopics).toHaveLength(6);

    for (const topic of exportableTopics) {
      const contract = contracts.find((entry) => entry.contract.topic === topic)!.contract;
      const scene = ALL_SCENES[topic as keyof typeof ALL_SCENES];
      const outputPath = `${EXPORT_ROOT}/${contract.slug}.mp4`;
      renderCompositionDemoMp4(scene, outputPath);
      assertExportQuality(outputPath, `${contract.slug}.mp4`);
    }
  });

  it("exports canonical and expansion long-form artifacts with quality gates", () => {
    mkdirSync(EXPORT_ROOT, { recursive: true });

    const canonical = buildLongFormSceneSpec("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });
    const expansion = buildLongFormSceneSpec("security-expansion-long-v1", ALL_SCENES);

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
