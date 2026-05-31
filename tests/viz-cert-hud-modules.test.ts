import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import tlsServerHelloSceneSpec from "../src/fixtures/tls-server-hello-scene-spec.json";
import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import { buildVizFrameState } from "../src/client/viz/build-viz-frame-state.js";
import { getComposePlan } from "../src/client/viz/compose-scene.js";
import { resolveActiveCaption } from "../src/client/viz/resolve-hud-caption.js";
import {
  CERT_MODULE_IDS,
  CATALOG_VIZ_MODULE_IDS,
  HUD_MODULE_IDS,
  VIZ_REGISTRY
} from "../src/client/viz/registry.js";
import { STYLE_TOKENS } from "../src/client/viz/style-tokens.js";
import {
  resolveCertModuleId,
  resolveHudModules,
  resolveVizModuleStack
} from "../src/client/viz/resolve-modules.js";
import { validateSceneSpec } from "../src/engine/contracts/validate-scene-spec.js";
import { generateCaptionTimingMap } from "../src/content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../src/engine/contracts/scene-spec.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CERT_COMPONENT_PATHS = [
  "src/client/viz/cert/viz-cert-single.tsx",
  "src/client/viz/cert/viz-cert-chain.tsx"
];

const HUD_COMPONENT_PATHS = [
  "src/client/viz/hud/viz-hud-actor-label.tsx",
  "src/client/viz/hud/viz-hud-beat-caption.tsx",
  "src/client/viz/hud/viz-hud-packet-id.tsx",
  "src/client/viz/hud/viz-hud-frame-counter.tsx"
];

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

const CHAIN_SCENE_SPEC: SceneSpec = {
  ...tlsServerHelloSceneSpec,
  actors: [
    { id: "actor-ca", label: "ca" },
    { id: "actor-intermediate", label: "intermediate" },
    { id: "actor-leaf", label: "leaf" }
  ]
};

describe("STYLE_TOKENS", () => {
  it("exports typography and camera tokens from style bible", () => {
    expect(STYLE_TOKENS.fontHudMd).toBe(14);
    expect(STYLE_TOKENS.fontHudSm).toBe(12);
    expect(STYLE_TOKENS.colorTextPrimary).toBe("#e8ecf4");
    expect(STYLE_TOKENS.cameraFovIntimate).toBe(35);
  });
});

describe("tls-server-hello fixture", () => {
  it("validates against validateSceneSpec", () => {
    const result = validateSceneSpec(tlsServerHelloSceneSpec);
    expect(result.ok).toBe(true);
  });
});

describe("VIZ-03 certificate modules", () => {
  it("resolveCertModuleId returns viz-cert-single during server-hello window", () => {
    const vizFrameState = buildVizFrameState(tlsServerHelloSceneSpec, 70);
    expect(resolveCertModuleId(vizFrameState, tlsServerHelloSceneSpec)).toBe("viz-cert-single");
  });

  it("resolveCertModuleId returns viz-cert-chain when three trust actors present", () => {
    const vizFrameState = buildVizFrameState(CHAIN_SCENE_SPEC, 70);
    expect(resolveCertModuleId(vizFrameState, CHAIN_SCENE_SPEC)).toBe("viz-cert-chain");
  });

  it("registry includes both cert module ids", () => {
    expect(CERT_MODULE_IDS).toEqual(["viz-cert-single", "viz-cert-chain"]);
    for (const id of CERT_MODULE_IDS) {
      expect(VIZ_REGISTRY[id]).toBeDefined();
    }
  });

  it("cert component sources do not contain hardcoded hex literals", () => {
    for (const relativePath of CERT_COMPONENT_PATHS) {
      const absolutePath = resolve(REPO_ROOT, relativePath);
      expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
      const content = readFileSync(absolutePath, "utf-8");
      expect(content).not.toMatch(HEX_PATTERN);
      expect(content).toContain("STYLE_TOKENS");
    }
  });

  it("resolveVizModuleStack places cert after packet and tunnel", () => {
    const vizFrameState = buildVizFrameState(tlsServerHelloSceneSpec, 70);
    const stack = resolveVizModuleStack(vizFrameState, tlsServerHelloSceneSpec);
    const tunnelIndex = stack.zOrder.indexOf("viz-tunnel-handshake");
    const packetIndex = stack.zOrder.indexOf("viz-packet-flow");
    const certIndex = stack.zOrder.indexOf("viz-cert-single");
    expect(tunnelIndex).toBeGreaterThanOrEqual(0);
    expect(packetIndex).toBeGreaterThan(tunnelIndex);
    expect(certIndex).toBeGreaterThan(packetIndex);
  });
});

describe("resolveActiveCaption", () => {
  it("returns tls-server-hello-beat entry at contract frame", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });
    const entry = resolveActiveCaption(captionMap, 60);
    expect(entry?.beatId).toBe("tls-server-hello-beat");
    expect(entry?.scriptIntent).toContain("certificate");
  });
});

describe("VIZ-04 HUD modules", () => {
  it("resolveHudModules includes beat-caption when caption active", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });
    const vizFrameState = buildVizFrameState(goldenSceneSpec, 60);
    const hud = resolveHudModules(vizFrameState, goldenSceneSpec, { captionMap });
    expect(hud).toContain("viz-hud-beat-caption");
    expect(hud).toContain("viz-hud-actor-label");
  });

  it("getComposePlan renderOrder ends with HUD modules after scene layers", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: tlsServerHelloSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });
    const plan = getComposePlan(tlsServerHelloSceneSpec, 70, { captionMap, showFrameCounter: true });
    const certIndex = plan.renderOrder.indexOf("viz-cert-single");
    const actorLabelIndex = plan.renderOrder.indexOf("viz-hud-actor-label");
    const beatCaptionIndex = plan.renderOrder.indexOf("viz-hud-beat-caption");
    const frameCounterIndex = plan.renderOrder.indexOf("viz-hud-frame-counter");
    expect(actorLabelIndex).toBeGreaterThan(certIndex);
    expect(beatCaptionIndex).toBeGreaterThan(certIndex);
    expect(frameCounterIndex).toBeGreaterThan(beatCaptionIndex);
  });

  it("VIZ_REGISTRY keys match full catalog module ids", () => {
    expect(Object.keys(VIZ_REGISTRY).sort()).toEqual([...CATALOG_VIZ_MODULE_IDS].sort());
    expect(CATALOG_VIZ_MODULE_IDS).toHaveLength(11);
    expect(HUD_MODULE_IDS).toHaveLength(4);
  });

  it("HUD component sources do not contain hardcoded hex literals", () => {
    for (const relativePath of HUD_COMPONENT_PATHS) {
      const absolutePath = resolve(REPO_ROOT, relativePath);
      expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
      const content = readFileSync(absolutePath, "utf-8");
      expect(content).not.toMatch(HEX_PATTERN);
      expect(content).toContain("STYLE_TOKENS");
    }
  });
});
