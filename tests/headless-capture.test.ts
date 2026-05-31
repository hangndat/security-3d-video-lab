import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import tlsProductionSceneSpec from "../src/fixtures/tls-production-scene-spec.json";
import { captureVizFramePng } from "../src/render/headless/capture-viz-frame-png.js";
import {
  resolveProductionRenderBackend
} from "../src/render/headless/resolve-production-render-backend.js";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function isPng(buffer: Buffer): boolean {
  return buffer.length >= PNG_MAGIC.length && buffer.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC);
}

function headlessGlAvailable(): boolean {
  try {
    captureVizFramePng(goldenSceneSpec, 0, { width: 64, height: 36 });
    return true;
  } catch {
    return false;
  }
}

const glAvailable = headlessGlAvailable();

describe("resolveProductionRenderBackend", () => {
  it("returns r3f-headless when env is unset", () => {
    expect(resolveProductionRenderBackend({})).toBe("r3f-headless");
  });

  it("returns trace-hash when SECURITY_LAB_RENDER_BACKEND=trace-hash", () => {
    expect(
      resolveProductionRenderBackend({ SECURITY_LAB_RENDER_BACKEND: "trace-hash" })
    ).toBe("trace-hash");
  });

  it("returns trace-hash when SECURITY_LAB_RENDER_BACKEND=hash", () => {
    expect(resolveProductionRenderBackend({ SECURITY_LAB_RENDER_BACKEND: "hash" })).toBe(
      "trace-hash"
    );
  });
});

describe.skipIf(!glAvailable)("captureVizFramePng", () => {
  it("returns PNG magic header for golden-scene-spec frame 0", () => {
    const buffer = captureVizFramePng(goldenSceneSpec, 0, { width: 320, height: 180 });
    expect(buffer.length).toBeGreaterThan(44);
    expect(isPng(buffer)).toBe(true);
  });

  it("produces identical sha256 hash for repeated captures", () => {
    const first = captureVizFramePng(goldenSceneSpec, 0, { width: 320, height: 180 });
    const second = captureVizFramePng(goldenSceneSpec, 0, { width: 320, height: 180 });
    expect(sha256(second)).toBe(sha256(first));
  });

  it("returns non-empty PNG for tls-production-scene-spec frame 75", () => {
    const buffer = captureVizFramePng(tlsProductionSceneSpec, 75, { width: 320, height: 180 });
    expect(buffer.length).toBeGreaterThan(44);
    expect(isPng(buffer)).toBe(true);
  });
});
