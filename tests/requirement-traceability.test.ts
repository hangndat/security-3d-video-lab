import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_V11_REQUIREMENT_IDS,
  parseRoadmapPhaseRequirements,
  parseTraceabilityTable,
  validateRequirementTraceability
} from "../src/verification/requirement-traceability.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REQUIREMENTS_PATH = resolve(REPO_ROOT, ".planning/REQUIREMENTS.md");
const ROADMAP_PATH = resolve(REPO_ROOT, ".planning/ROADMAP.md");

function loadRequirements(): string {
  return readFileSync(REQUIREMENTS_PATH, "utf-8");
}

function loadRoadmap(): string {
  return readFileSync(ROADMAP_PATH, "utf-8");
}

describe("requirement traceability validation", () => {
  it("valid REQUIREMENTS.md and ROADMAP.md return zero errors and unmappedCount 0", () => {
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: loadRoadmap()
    });

    expect(result.errors).toEqual([]);
    expect(result.unmappedCount).toBe(0);
    expect(parseTraceabilityTable(loadRequirements())).toHaveLength(
      EXPECTED_V11_REQUIREMENT_IDS.length
    );
  });

  it("fails when a v1.1 requirement row is missing from traceability table", () => {
    const requirements = loadRequirements().replace("| VER-02 | Phase 08 | Complete |", "");
    const result = validateRequirementTraceability({
      requirementsContent: requirements,
      roadmapContent: loadRoadmap()
    });

    expect(result.errors.some((issue) => issue.reason.includes("Missing traceability row"))).toBe(
      true
    );
  });

  it("fails when ROADMAP phase requirement list drifts from expected mapping", () => {
    const roadmap = loadRoadmap().replace(
      "**Requirements:** `CINE-02`, `VER-01`, `VER-03`",
      "**Requirements:** `CINE-02`, `VER-01`"
    );
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: roadmap
    });

    expect(result.errors.some((issue) => issue.path.includes("ROADMAP.md#phase-07"))).toBe(true);
  });

  it("milestone-close mode fails when any v1.1 requirement is still Pending", () => {
    const requirements = loadRequirements().replace(
      "| VER-03 | Phase 07 | Complete |",
      "| VER-03 | Phase 07 | Pending |"
    );
    const result = validateRequirementTraceability({
      requirementsContent: requirements,
      roadmapContent: loadRoadmap(),
      milestoneClose: true
    });

    expect(result.pendingCount).toBeGreaterThan(0);
    expect(result.errors.some((issue) => issue.reason.includes("still Pending"))).toBe(true);
  });

  it("fails when checkbox and traceability status are out of sync", () => {
    const requirements = loadRequirements().replace(
      "| VER-03 | Phase 07 | Complete |",
      "| VER-03 | Phase 07 | Pending |"
    );
    const result = validateRequirementTraceability({
      requirementsContent: requirements,
      roadmapContent: loadRoadmap()
    });

    expect(
      result.errors.some((issue) =>
        issue.reason.includes("Checkbox is checked but traceability status is 'Pending'")
      )
    ).toBe(true);
  });

  it("parses roadmap phase requirements for phases 05 through 08", () => {
    const phases = parseRoadmapPhaseRequirements(loadRoadmap());
    expect(phases["05"]).toEqual(["AUTHR-01", "AUTHR-02", "CONT-01", "CONT-03"]);
    expect(phases["08"]).toEqual(["VER-02"]);
  });
});
