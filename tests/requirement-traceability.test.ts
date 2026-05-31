import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_V13_REQUIREMENT_IDS,
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

  it("valid v1.3 REQUIREMENTS.md and ROADMAP.md return zero errors and unmappedCount 0", () => {
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: loadRoadmap()
    });

    expect(result.skipped).toBeUndefined();
    expect(result.errors).toEqual([]);
    expect(result.unmappedCount).toBe(0);
    expect(result.pendingCount).toBe(
      parseTraceabilityTable(loadRequirements()).filter((row) => row.status === "Pending").length
    );
    expect(parseTraceabilityTable(loadRequirements())).toHaveLength(
      EXPECTED_V13_REQUIREMENT_IDS.length
    );
  });

  it("fails when a v1.3 requirement row is missing from traceability table", () => {
    const requirements = loadRequirements().replace("| VER-06 | Phase 16 | Pending |", "");
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
      "**Requirements:** `CREW-01`, `CREW-02`",
      "**Requirements:** `CREW-01`"
    );
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: roadmap
    });

    expect(result.errors.some((issue) => issue.path.includes("ROADMAP.md#phase-13"))).toBe(true);
  });

  it("milestone-close mode enforces zero Pending requirements", () => {
    const pendingRows = parseTraceabilityTable(loadRequirements()).filter(
      (row) => row.status === "Pending"
    );
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: loadRoadmap(),
      milestoneClose: true
    });

    expect(result.pendingCount).toBe(pendingRows.length);
    if (pendingRows.length > 0) {
      expect(result.errors.some((issue) => issue.reason.includes("still Pending"))).toBe(true);
    } else {
      expect(result.errors).toEqual([]);
    }
  });

  it("fails when checkbox and traceability status are out of sync", () => {
    const requirements = loadRequirements().replace(
      "| CREW-05 | Phase 15 | Pending |",
      "| CREW-05 | Phase 15 | Complete |"
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

  it("parses roadmap phase requirements for phases 13 through 16", () => {
    const phases = parseRoadmapPhaseRequirements(loadRoadmap());
    expect(phases["13"]).toEqual(["CREW-01", "CREW-02"]);
    expect(phases["16"]).toEqual(["CREW-07", "VER-06"]);
  });
});
