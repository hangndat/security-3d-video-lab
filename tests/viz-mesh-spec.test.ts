import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CATALOG_VIZ_MODULE_IDS,
  CERT_MODULE_IDS,
  HUD_MODULE_IDS,
  PACKET_MODULE_IDS,
  TUNNEL_MODULE_IDS
} from "../src/client/viz/registry.js";
import {
  catalogMeshSpecCoverage,
  CERT_MESH_SPEC,
  createHeadlessModuleMeshes,
  HUD_MESH_SPEC,
  PACKET_MESH_SPEC,
  TUNNEL_MESH_SPEC,
  VIZ_MESH_SPEC
} from "../src/client/viz/viz-mesh-spec.js";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { getComposePlan } from "../src/client/viz/compose-scene.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

describe("viz-mesh-spec catalog coverage", () => {
  it("defines packet module geometry for all PACKET_MODULE_IDS", () => {
    for (const moduleId of PACKET_MODULE_IDS) {
      expect(PACKET_MESH_SPEC[moduleId]).toBeDefined();
      expect(PACKET_MESH_SPEC[moduleId].radius).toBeGreaterThan(0);
    }
  });

  it("defines tunnel module geometry for all TUNNEL_MODULE_IDS", () => {
    for (const moduleId of TUNNEL_MODULE_IDS) {
      expect(TUNNEL_MESH_SPEC[moduleId]).toBeDefined();
      expect(TUNNEL_MESH_SPEC[moduleId].radius).toBeGreaterThan(0);
    }
  });

  it("defines cert module geometry for all CERT_MODULE_IDS", () => {
    for (const moduleId of CERT_MODULE_IDS) {
      expect(CERT_MESH_SPEC[moduleId]).toBeDefined();
    }
  });

  it("defines HUD module geometry for all HUD_MODULE_IDS", () => {
    for (const moduleId of HUD_MODULE_IDS) {
      expect(HUD_MESH_SPEC[moduleId]).toBeDefined();
    }
  });

  it("covers all eleven CATALOG_VIZ_MODULE_IDS in VIZ_MESH_SPEC", () => {
    for (const moduleId of CATALOG_VIZ_MODULE_IDS) {
      expect(moduleId in VIZ_MESH_SPEC).toBe(true);
    }
    expect(catalogMeshSpecCoverage()).toEqual({ expected: 11, covered: 11 });
  });

  it("viz-mesh-spec source uses token keys only (no raw hex literals)", () => {
    const content = readFileSync(resolve(REPO_ROOT, "src/client/viz/viz-mesh-spec.ts"), "utf-8");
    expect(content).not.toMatch(HEX_PATTERN);
  });

  it("createHeadlessModuleMeshes handles every catalog id without throwing", () => {
    const plan = getComposePlan(goldenSceneSpec, 0);
    const context = { sceneSpec: goldenSceneSpec, frame: 0, plan };

    for (const moduleId of CATALOG_VIZ_MODULE_IDS) {
      expect(() => createHeadlessModuleMeshes(moduleId, context)).not.toThrow();
    }
  });
});
