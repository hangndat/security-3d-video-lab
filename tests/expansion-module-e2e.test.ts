import { mkdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { SceneSpec } from "../src/engine/contracts/scene-spec.js";
import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import authSessionSceneSpec from "../src/fixtures/auth-session-scene-spec.json";
import pkiTrustChainSceneSpec from "../src/fixtures/pki-trust-chain-scene-spec.json";
import mitmDefenseSceneSpec from "../src/fixtures/mitm-defense-scene-spec.json";
import { DRAFT_TOPIC_IDS, V12_TOPIC_IDS, type DraftTopicId } from "../src/content/contracts/types.js";
import { loadLongFormAssembly } from "../src/content/composition/build-long-form-scene-spec.js";
import { buildLongFormSceneSpec } from "../src/content/composition/build-long-form-scene-spec.js";
import { renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";
import { assertExportQuality } from "../src/verification/export-quality.js";
import { evaluateModulePacket } from "../src/verification/module-packet.js";

const EXPANSION_SCENES: Record<DraftTopicId, SceneSpec> = {
  "auth-session": authSessionSceneSpec,
  "pki-trust-chain": pkiTrustChainSceneSpec,
  "mitm-defense": mitmDefenseSceneSpec
};

describe("expansion module packet and export linkage (VER-01)", () => {
  for (const topic of DRAFT_TOPIC_IDS) {
    it(`${topic} packet passes completeness and contract validation`, () => {
      const status = evaluateModulePacket(topic);
      expect(status.packetComplete).toBe(true);
      expect(status.errors).toEqual([]);
      expect(status.beatCount).toBeGreaterThan(0);
      expect(status.placeholderCount).toBe(status.beatCount);
      expect(status.longFormLinked).toBe(true);
    });

    it(`${topic} short export passes quality gates with slug-based naming`, () => {
      const status = evaluateModulePacket(topic);
      const outputPath = `.artifacts/export/phase07/${status.slug}.mp4`;
      mkdirSync(".artifacts/export/phase07", { recursive: true });
      renderCompositionDemoMp4(EXPANSION_SCENES[topic], outputPath);

      const metadata = assertExportQuality(outputPath, `${status.slug}.mp4`);
      expect(metadata.durationMs).toBeGreaterThanOrEqual(900);
    });
  }

  it("expansion long-form assembly includes all draft modules with coherent transitions", () => {
    const assembly = loadLongFormAssembly("security-expansion-long-v1");
    for (const topic of DRAFT_TOPIC_IDS) {
      expect(assembly.sequence).toContain(topic);
    }

    const stitched = buildLongFormSceneSpec("security-expansion-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec,
      "auth-session": authSessionSceneSpec,
      "pki-trust-chain": pkiTrustChainSceneSpec,
      "mitm-defense": mitmDefenseSceneSpec
    });
    expect(stitched.sceneId).toBe("security-expansion-long-v1");
  });
});

describe("v1.2 module packet completeness (CONT-04, CONT-05)", () => {
  for (const topic of V12_TOPIC_IDS) {
    it(`${topic} packet passes completeness and content-depth-long-v1 linkage`, () => {
      const status = evaluateModulePacket(topic);
      expect(status.packetComplete).toBe(true);
      expect(status.errors).toEqual([]);
      expect(status.beatCount).toBeGreaterThanOrEqual(5);
      expect(status.placeholderCount).toBe(status.beatCount);
      expect(status.longFormLinked).toBe(true);
    });
  }

  it("content-depth-long-v1 assembly validates with nine-topic transition chain", () => {
    const assembly = loadLongFormAssembly("content-depth-long-v1");
    expect(assembly.sequence).toHaveLength(9);
    for (const topic of V12_TOPIC_IDS) {
      expect(assembly.sequence).toContain(topic);
    }
  });
});
