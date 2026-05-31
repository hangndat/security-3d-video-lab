import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { validateSceneSpec } from "../src/engine/contracts/validate-scene-spec.js";

describe("scene spec validation", () => {
  it("validates the golden fixture deterministically across repeated runs", () => {
    const first = validateSceneSpec(goldenSceneSpec);
    const second = validateSceneSpec(goldenSceneSpec);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.errors).toEqual([]);
    expect(second.errors).toEqual([]);
    expect(first).toEqual(second);
  });

  it("fails unknown fields with structured error metadata", () => {
    const mutated = {
      ...goldenSceneSpec,
      unknownTopLevelField: "not-allowed"
    };

    const result = validateSceneSpec(mutated);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatchObject({
      code: "UNKNOWN_FIELD"
    });
  });

  it("fails missing deterministic seed", () => {
    const withoutSeed = {
      ...goldenSceneSpec
    } as Record<string, unknown>;
    delete withoutSeed.seed;

    const result = validateSceneSpec(withoutSeed);
    expect(result.ok).toBe(false);
    expect(result.errors.some((err) => err.path === "seed")).toBe(true);
  });

  it("fails unsupported schema versions with explicit guidance", () => {
    const result = validateSceneSpec({
      ...goldenSceneSpec,
      schemaVersion: "2.0.0"
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatchObject({
      path: "schemaVersion",
      code: "UNSUPPORTED_SCHEMA_VERSION"
    });
  });
});
