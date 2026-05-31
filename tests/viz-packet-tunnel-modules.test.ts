import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { buildVizFrameState } from "../src/client/viz/build-viz-frame-state.js";
import { getComposePlan } from "../src/client/viz/compose-scene.js";
import {
  PACKET_MODULE_IDS,
  PHASE_17_MODULE_IDS,
  TUNNEL_MODULE_IDS
} from "../src/client/viz/registry.js";
import { resolveTunnelModuleId, resolveVizModuleStack } from "../src/client/viz/resolve-modules.js";
import { deriveRenderFrameState } from "../src/render/remotion/render-composition.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PACKET_COMPONENT_PATHS = [
  "src/client/viz/packet/viz-packet-flow.tsx",
  "src/client/viz/packet/viz-packet-encrypted.tsx",
  "src/client/viz/packet/viz-packet-threat.tsx"
];

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

describe("buildVizFrameState", () => {
  it("produces deterministic viz frame state on golden fixture", () => {
    const first = buildVizFrameState(goldenSceneSpec, 15);
    const second = buildVizFrameState(goldenSceneSpec, 15);
    expect(first).toEqual(second);
    expect(first.packets).toHaveLength(1);
    expect(first.packets[0]?.moduleId).toBe("viz-packet-flow");
    expect(first.activeTimelineIds).toEqual(["tls-main-handshake"]);
  });
});

describe("VIZ-01 packet modules", () => {
  it("registry includes all three viz-packet-* ids", () => {
    expect(PACKET_MODULE_IDS).toEqual([
      "viz-packet-flow",
      "viz-packet-encrypted",
      "viz-packet-threat"
    ]);
  });

  it("packet component sources do not contain hardcoded hex literals", () => {
    for (const relativePath of PACKET_COMPONENT_PATHS) {
      const absolutePath = resolve(REPO_ROOT, relativePath);
      expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
      const content = readFileSync(absolutePath, "utf-8");
      expect(content).not.toMatch(HEX_PATTERN);
      expect(content).toContain("STYLE_TOKENS");
    }
  });

  it("deriveRenderFrameState preserves stable timelineTraceInput with vizFrameState", () => {
    const state = deriveRenderFrameState(goldenSceneSpec, 42);
    expect(state.timelineTraceInput).toBe("golden-seed-001:42:tls-main-handshake");
    expect(state.vizFrameState.packets).toHaveLength(1);
  });

  it("buildVizFrameState is deterministic across repeated calls per frame", () => {
    for (const frame of [0, 15, 29]) {
      expect(buildVizFrameState(goldenSceneSpec, frame)).toEqual(
        buildVizFrameState(goldenSceneSpec, frame)
      );
    }
  });
});

describe("resolveVizModuleStack", () => {
  it("returns deterministic module stacks on golden fixture frames 0, 15, 29", () => {
    for (const frame of [0, 15, 29]) {
      const vizFrameState = buildVizFrameState(goldenSceneSpec, frame);
      const first = resolveVizModuleStack(vizFrameState, goldenSceneSpec);
      const second = resolveVizModuleStack(vizFrameState, goldenSceneSpec);
      expect(first).toEqual(second);
      expect(first.zOrder.slice(0, 2)).toEqual(["viz-tunnel-handshake", "viz-packet-flow"]);
      expect(first.zOrder).toContain("viz-hud-actor-label");
    }
  });
});

describe("VIZ-02 tunnel modules", () => {
  it("selects handshake tunnel during active packet cue window", () => {
    const vizFrameState = buildVizFrameState(goldenSceneSpec, 15);
    expect(resolveTunnelModuleId(vizFrameState, goldenSceneSpec)).toBe("viz-tunnel-handshake");
  });

  it("selects secure tunnel after handshake window completes", () => {
    const vizFrameState = buildVizFrameState(goldenSceneSpec, 120);
    expect(resolveTunnelModuleId(vizFrameState, goldenSceneSpec)).toBe("viz-tunnel-secure");
  });

  it("getComposePlan keeps packet positions unchanged when tunnel is composed", () => {
    const frame = 15;
    const vizOnly = buildVizFrameState(goldenSceneSpec, frame);
    const plan = getComposePlan(goldenSceneSpec, frame);
    expect(plan.vizFrameState.packets).toEqual(vizOnly.packets);
    expect(plan.renderOrder.indexOf("viz-tunnel-handshake")).toBeLessThan(
      plan.renderOrder.indexOf("viz-packet-flow")
    );
  });

  it("registry includes all five Phase 17 catalog ids", () => {
    expect(PHASE_17_MODULE_IDS).toEqual([
      ...PACKET_MODULE_IDS,
      ...TUNNEL_MODULE_IDS
    ]);
    expect(PHASE_17_MODULE_IDS).toHaveLength(5);
  });
});

describe("compose scene", () => {
  it("lists modules back-to-front matching catalog z-order", () => {
    const plan = getComposePlan(goldenSceneSpec, 15);
    expect(plan.renderOrder.slice(0, 2)).toEqual(["viz-tunnel-handshake", "viz-packet-flow"]);
    expect(plan.renderOrder).toContain("viz-hud-actor-label");
    expect(plan.renderOrder.at(-1)).toBe("viz-hud-packet-id");
    expect(plan.moduleStack.primary).toHaveLength(2);
  });
});
