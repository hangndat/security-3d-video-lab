import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveProductionRenderBackend } from "../src/render/headless/resolve-production-render-backend.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("render CI backend policy", () => {
  it("defaults to r3f-headless when env is unset", () => {
    expect(resolveProductionRenderBackend({})).toBe("r3f-headless");
  });

  it("maps SECURITY_LAB_RENDER_BACKEND=trace-hash for CI runners", () => {
    expect(
      resolveProductionRenderBackend({ SECURITY_LAB_RENDER_BACKEND: "trace-hash" })
    ).toBe("trace-hash");
  });

  it("exposes verify:3d-render npm script", () => {
    const pkg = JSON.parse(readFileSync(resolve(REPO_ROOT, "package.json"), "utf-8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["verify:3d-render"]).toBe("node scripts/verify-3d-render.mjs");
  });
});
