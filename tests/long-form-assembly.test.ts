import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import {
  buildLongFormSceneSpec,
  loadLongFormAssembly,
  validateLongFormTransitionCoherence
} from "../src/content/composition/build-long-form-scene-spec.js";
import { loadLongFormAssemblyProfile } from "../src/content/composition/load-long-form-assembly.js";
import { validateLongFormAssemblyProfile } from "../src/content/composition/validate-long-form-assembly.js";
import {
  isKnownPacingPreset,
  PACING_PRESETS,
  validatePacingPresetId
} from "../src/content/composition/pacing-presets.js";
import {
  TRANSITION_PRESETS,
  validateTransitionPresetPair
} from "../src/content/contracts/transition-presets.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSEMBLIES_ROOT = resolve(REPO_ROOT, "src/content/assemblies");

describe("long-form assembly schema and manifest lock", () => {
  it("schema rejects unsupported schemaVersion", () => {
    const profile = loadLongFormAssemblyProfile("network-foundations-long-v1", ASSEMBLIES_ROOT);
    const invalid = { ...profile, schemaVersion: "2.0.0" as "1.0.0" };
    const result = validateLongFormAssemblyProfile(
      invalid,
      `${ASSEMBLIES_ROOT}/network-foundations-long-v1.json`
    );
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("validator rejects duplicate topics in assembly sequence", () => {
    const profile = loadLongFormAssemblyProfile("network-foundations-long-v1", ASSEMBLIES_ROOT);
    const invalid = { ...profile, sequence: ["tls", "tls", "dns"] };
    const result = validateLongFormAssemblyProfile(
      invalid,
      `${ASSEMBLIES_ROOT}/network-foundations-long-v1.json`
    );
    expect(result.errors.some((item) => item.reason.includes("Duplicate topic"))).toBe(true);
  });

  it("validator rejects sequence topics not present in manifest order", () => {
    const profile = loadLongFormAssemblyProfile("network-foundations-long-v1", ASSEMBLIES_ROOT);
    const invalid = { ...profile, sequence: ["dns", "tls", "ssh"] };
    const result = validateLongFormAssemblyProfile(
      invalid,
      `${ASSEMBLIES_ROOT}/network-foundations-long-v1.json`
    );
    expect(result.errors.some((item) => item.reason.includes("manifest-locked ordering"))).toBe(true);
  });

  it("canonical profile matches tls,ssh,dns sequence and 4-6 minute window", () => {
    const profile = loadLongFormAssemblyProfile("network-foundations-long-v1", ASSEMBLIES_ROOT);
    const result = validateLongFormAssemblyProfile(
      profile,
      `${ASSEMBLIES_ROOT}/network-foundations-long-v1.json`
    );
    expect(result.errors).toEqual([]);
    expect(profile.sequence).toEqual(["tls", "ssh", "dns"]);
    expect(profile.targetWindowMinutes).toEqual({ min: 4, max: 6 });
  });
});

describe("transition and pacing presets", () => {
  it("unknown transition preset ID fails pair validation", () => {
    const error = validateTransitionPresetPair("made-up-preset", "tls", "ssh");
    expect(error).toMatch(/Unknown transition preset/);
  });

  it("expansion chain presets allow dns→auth-session, auth-session→pki, pki→mitm-defense", () => {
    expect(
      validateTransitionPresetPair("dns-to-auth-boundary", "dns", "auth-session")
    ).toBeNull();
    expect(
      validateTransitionPresetPair("auth-session-to-pki-trust-chain", "auth-session", "pki-trust-chain")
    ).toBeNull();
    expect(
      validateTransitionPresetPair("pki-trust-chain-to-mitm-defense", "pki-trust-chain", "mitm-defense")
    ).toBeNull();
  });

  it("pacing preset registry exposes documentary-standard and rejects unknown IDs", () => {
    expect(PACING_PRESETS["documentary-standard"]).toBeDefined();
    expect(isKnownPacingPreset("documentary-standard")).toBe(true);
    expect(validatePacingPresetId("unknown-pacing")).toMatch(/Unknown pacing preset/);
  });

  it("security-expansion assembly validates with full transition chain", () => {
    const profile = loadLongFormAssemblyProfile("security-expansion-long-v1", ASSEMBLIES_ROOT);
    const result = validateLongFormAssemblyProfile(
      profile,
      `${ASSEMBLIES_ROOT}/security-expansion-long-v1.json`
    );
    expect(result.errors).toEqual([]);
    expect(profile.sequence).toEqual(loadTopicManifest().order);
    expect(Object.keys(TRANSITION_PRESETS).length).toBeGreaterThanOrEqual(5);
  });
});

describe("assembly-driven long-form stitch", () => {
  it("buildLongFormSceneSpec produces canonical sceneId, seed, and timeline length", () => {
    const longForm = buildLongFormSceneSpec("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });

    expect(longForm.sceneId).toBe("network-foundations-long-v1");
    expect(longForm.seed).toBe("tls:golden-seed-001|ssh:ssh-seed-001|dns:dns-seed-001");
    expect(longForm.timeline.length).toBe(
      goldenSceneSpec.timeline.length + sshSceneSpec.timeline.length + dnsSceneSpec.timeline.length
    );
  });

  it("validateLongFormTransitionCoherence works for expansion assembly with five transitions", () => {
    const assembly = loadLongFormAssembly("security-expansion-long-v1");
    expect(assembly.transitions).toHaveLength(5);
    expect(() => validateLongFormTransitionCoherence(assembly)).not.toThrow();
  });

  it("missing scene for required topic throws before stitch", () => {
    expect(() =>
      buildLongFormSceneSpec("network-foundations-long-v1", {
        tls: goldenSceneSpec,
        ssh: sshSceneSpec
      })
    ).toThrow(/Missing scene for required topic 'dns'/);
  });
});
