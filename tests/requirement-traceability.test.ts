import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  EXPECTED_V15_REQUIREMENT_IDS,
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
  it("skips when between milestones with no active requirement ids", () => {
    expect(isBetweenMilestones()).toBe(true);
    const result = validateRequirementTraceability();
    expect(result.skipped).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("valid archived v1.5 requirements pass milestone-close when all Complete", () => {
    const archived = readFileSync(
      resolve(REPO_ROOT, ".planning/milestones/v1.5-REQUIREMENTS.md"),
      "utf-8"
    );
    const result = validateRequirementTraceability({
      requirementsContent: archived,
      roadmapContent: loadRoadmap(),
      milestoneClose: true
    });
    expect(result.errors).toEqual([]);
    expect(result.pendingCount).toBe(0);
  });

  it("fails when a v1.5 requirement row is missing from traceability table", () => {
    const archived = readFileSync(
      resolve(REPO_ROOT, ".planning/milestones/v1.5-REQUIREMENTS.md"),
      "utf-8"
    );
    const requirements = archived.replace("| VER-08 | Phase 24 | Complete |", "");
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
      "**Requirements:** `RENDER-01`",
      "**Requirements:** `RENDER-02`"
    );
    const result = validateRequirementTraceability({
      requirementsContent: loadRequirements(),
      roadmapContent: roadmap
    });

    expect(result.errors.some((issue) => issue.path.includes("ROADMAP.md#phase-21"))).toBe(true);
  });

  it("milestone-close mode enforces zero Pending requirements", () => {
    const archived = readFileSync(
      resolve(REPO_ROOT, ".planning/milestones/v1.5-REQUIREMENTS.md"),
      "utf-8"
    );
    const pendingRows = parseTraceabilityTable(archived).filter((row) => row.status === "Pending");
    const result = validateRequirementTraceability({
      requirementsContent: archived,
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
    const archived = readFileSync(
      resolve(REPO_ROOT, ".planning/milestones/v1.5-REQUIREMENTS.md"),
      "utf-8"
    );
    const requirements = archived.replace(
      "- [x] **VER-08**:",
      "- [ ] **VER-08**:"
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

  it("parses roadmap phase requirements for phases 21 through 24", () => {
    const phases = parseRoadmapPhaseRequirements(loadRoadmap());
    expect(phases["21"]).toEqual(["RENDER-01"]);
    expect(phases["24"]).toEqual(["RENDER-04", "VER-08"]);
  });
});
