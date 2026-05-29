import { describe, expect, it } from "vitest";

import type { SceneSpec } from "../src/engine/contracts/scene-spec.js";
import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import authSessionSceneSpec from "../src/fixtures/auth-session-scene-spec.json";
import pkiTrustChainSceneSpec from "../src/fixtures/pki-trust-chain-scene-spec.json";
import mitmDefenseSceneSpec from "../src/fixtures/mitm-defense-scene-spec.json";
import { buildLongFormSceneSpec } from "../src/content/composition/build-long-form-scene-spec.js";
import type { TopicId } from "../src/content/contracts/types.js";
import { buildDeterministicTraceInputs } from "../src/render/remotion/render-composition.js";

const TRACE_FRAMES = [0, 5, 10, 15, 20, 25];

const CANONICAL_SCENES: Record<"tls" | "ssh" | "dns", SceneSpec> = {
  tls: goldenSceneSpec,
  ssh: sshSceneSpec,
  dns: dnsSceneSpec
};

const EXPANSION_SCENES: Record<TopicId, SceneSpec> = {
  tls: goldenSceneSpec,
  ssh: sshSceneSpec,
  dns: dnsSceneSpec,
  "auth-session": authSessionSceneSpec,
  "pki-trust-chain": pkiTrustChainSceneSpec,
  "mitm-defense": mitmDefenseSceneSpec
};

describe("narrative composition deterministic replay", () => {
  it("canonical assembly stitched scene produces identical trace inputs on two runs", () => {
    const scene = buildLongFormSceneSpec("network-foundations-long-v1", CANONICAL_SCENES);
    const firstRun = buildDeterministicTraceInputs(scene, TRACE_FRAMES);
    const secondRun = buildDeterministicTraceInputs(scene, TRACE_FRAMES);
    expect(secondRun).toEqual(firstRun);
  });

  it("trace inputs change when a topic scene seed changes", () => {
    const baseScene = buildLongFormSceneSpec("network-foundations-long-v1", CANONICAL_SCENES);
    const mutatedScenes = {
      ...CANONICAL_SCENES,
      tls: { ...goldenSceneSpec, seed: "mutated-seed-001" }
    };
    const mutatedScene = buildLongFormSceneSpec("network-foundations-long-v1", mutatedScenes);
    const baseTrace = buildDeterministicTraceInputs(baseScene, TRACE_FRAMES);
    const mutatedTrace = buildDeterministicTraceInputs(mutatedScene, TRACE_FRAMES);
    expect(mutatedTrace).not.toEqual(baseTrace);
  });

  it("expansion assembly stitched scene passes replay equality at sampled frames", () => {
    const scene = buildLongFormSceneSpec("security-expansion-long-v1", EXPANSION_SCENES);
    const firstRun = buildDeterministicTraceInputs(scene, TRACE_FRAMES);
    const secondRun = buildDeterministicTraceInputs(scene, TRACE_FRAMES);
    expect(secondRun).toEqual(firstRun);
    expect(scene.timeline.length).toBeGreaterThan(goldenSceneSpec.timeline.length);
  });
});
