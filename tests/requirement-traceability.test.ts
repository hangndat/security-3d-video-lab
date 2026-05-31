import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_V12_REQUIREMENT_IDS,
  isBetweenMilestones,
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
  it("does not skip when active REQUIREMENTS.md exists", () => {
    expect(isBetweenMilestones()).toBe(false);
  });

  it("valid v1.2 REQUIREMENTS.md and ROADMAP.md return zero errors and unmappedCount 0", () => {
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: loadRoadmap()
    });

    expect(result.skipped).toBeUndefined();
    expect(result.errors).toEqual([]);
    expect(result.unmappedCount).toBe(0);
    expect(result.pendingCount).toBe(EXPECTED_V12_REQUIREMENT_IDS.length);
    expect(parseTraceabilityTable(loadRequirements())).toHaveLength(
      EXPECTED_V12_REQUIREMENT_IDS.length
    );
  });

  it("fails when a v1.2 requirement row is missing from traceability table", () => {
    const requirements = loadRequirements().replace("| VER-05 | Phase 12 | Pending |", "");
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
      "**Requirements:** `CONT-04`, `CONT-05`, `CONT-06`",
      "**Requirements:** `CONT-04`, `CONT-05`"
    );
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: roadmap
    });

    expect(result.errors.some((issue) => issue.path.includes("ROADMAP.md#phase-09"))).toBe(true);
  });

  it("milestone-close mode fails when any v1.2 requirement is still Pending", () => {
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: loadRoadmap(),
      milestoneClose: true
    });

    expect(result.pendingCount).toBeGreaterThan(0);
    expect(result.errors.some((issue) => issue.reason.includes("still Pending"))).toBe(true);
  });

  it("fails when checkbox and traceability status are out of sync", () => {
    const requirements = loadRequirements().replace(
      "| CONT-04 | Phase 09 | Pending |",
      "| CONT-04 | Phase 09 | Complete |"
    );
    const result = validateRequirementTraceability({
      requirementsContent: requirements,
      roadmapContent: loadRoadmap()
    });

    expect(
      result.errors.some((issue) =>
        issue.reason.includes("Checkbox is unchecked but traceability status is Complete")
      )
    ).toBe(true);
  });

  it("parses roadmap phase requirements for phases 09 through 12", () => {
    const phases = parseRoadmapPhaseRequirements(loadRoadmap());
    expect(phases["09"]).toEqual(["CONT-04", "CONT-05", "CONT-06"]);
    expect(phases["12"]).toEqual(["VER-04", "VER-05"]);
  });
});
