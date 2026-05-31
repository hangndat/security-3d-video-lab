import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  buildMilestoneAuditReport,
  buildV12MilestoneAuditReport,
  buildV13MilestoneAuditReport,
  buildV14MilestoneAuditReport,
  buildV15MilestoneAuditReport,
  renderMilestoneAuditMarkdown,
  renderV12MilestoneAuditMarkdown,
  renderV13MilestoneAuditMarkdown,
  renderV14MilestoneAuditMarkdown,
  renderV15MilestoneAuditMarkdown
} from "../src/verification/milestone-audit.js";
import { validateRequirementTraceability, parseTraceabilityTable } from "../src/verification/requirement-traceability.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("milestone audit aggregation", () => {
  it("reports PASS when phase05/06/07 JSON gateStatus values are pass", () => {
    const report = buildMilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    expect(report.phases).toHaveLength(3);
    expect(report.phases.every((phase) => phase.passed)).toBe(true);
    expect(report.verdict).toBe("PASS");
  });

  it("fails verdict when any phase JSON gateStatus is missing", () => {
    const report = buildMilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    const broken = {
      ...report,
      phases: report.phases.map((phase, index) =>
        index === 0 ? { ...phase, passed: false, gateStatus: "missing" } : phase
      ),
      errors: ["Phase 05 gateStatus=missing"],
      verdict: "FAIL" as const
    };
    expect(broken.verdict).toBe("FAIL");
  });

  it("generated audit markdown includes requirements coverage and deferred debt section", () => {
    const report = buildMilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    const markdown = renderMilestoneAuditMarkdown(report);
    expect(markdown).toContain("12/12");
    expect(markdown).toContain("Deferred Debt Resolution");
    expect(markdown).toContain("v1.0-MILESTONE-AUDIT.md missing");
  });

  it("renders PASS verdict in audit markdown from live phase evidence", () => {
    const markdown = renderMilestoneAuditMarkdown(
      buildMilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true })
    );
    expect(markdown).toMatch(/\*\*PASS\*\*/);
    expect(markdown).toContain("Phase Verification Summary");
  });
});

describe("v1.2 milestone audit aggregation", () => {
  it("reports PASS when phase09–12 JSON gateStatus values are pass", () => {
    const report = buildV12MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    expect(report.phases).toHaveLength(4);
    expect(report.phases.every((phase) => phase.passed)).toBe(true);
    expect(report.verdict).toBe("PASS");
  });

  it("generated v1.2 audit markdown includes nine-requirement coverage", () => {
    const markdown = renderV12MilestoneAuditMarkdown(
      buildV12MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true })
    );
    expect(markdown).toContain("9/9");
    expect(markdown).toContain("Content Depth");
    expect(markdown).toMatch(/\*\*PASS\*\*/);
  });
});

describe("v1.3 milestone audit aggregation", () => {
  it("reports PASS when phase13–16 JSON gateStatus values are pass", () => {
    const report = buildV13MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    expect(report.phases).toHaveLength(4);
    expect(report.phases.every((phase) => phase.passed)).toBe(true);
    expect(report.verdict).toBe("PASS");
  });

  it("generated v1.3 audit markdown includes eight-requirement coverage", () => {
    const markdown = renderV13MilestoneAuditMarkdown(
      buildV13MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true })
    );
    expect(markdown).toContain("8/8");
    expect(markdown).toContain("Cinematic Crew Skills");
    expect(markdown).toMatch(/\*\*PASS\*\*/);
  });
});

describe("v1.4 milestone audit aggregation", () => {
  it("reports PASS when phase17–20 JSON gateStatus values are pass", () => {
    const report = buildV14MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    expect(report.phases).toHaveLength(4);
    expect(report.phases.every((phase) => phase.passed)).toBe(true);
    expect(report.verdict).toBe("PASS");
  });

  it("generated v1.4 audit markdown includes seven-requirement coverage", () => {
    const markdown = renderV14MilestoneAuditMarkdown(
      buildV14MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true })
    );
    expect(markdown).toContain("7/7");
    expect(markdown).toContain("Production Content");
    expect(markdown).toMatch(/\*\*PASS\*\*/);
  });
});

describe("milestone governance policy", () => {
  it("requirement traceability milestone-close reflects Pending row count", () => {
    const result = validateRequirementTraceability();
    expect(result.skipped).toBe(true);
    expect(result.errors).toEqual([]);

    const closeResult = validateRequirementTraceability({ milestoneClose: true });
    expect(closeResult.skipped).toBe(true);
    expect(closeResult.errors).toEqual([]);
  });

  it("package.json exposes governance scripts", () => {
    const pkg = readFileSync(resolve(REPO_ROOT, "package.json"), "utf-8");
    expect(pkg).toContain("validate:requirements");
    expect(pkg).toContain("verify:crew-skills");
    expect(pkg).toContain("verify:tts-integration");
    expect(pkg).toContain("verify:3d-render");
    expect(pkg).toContain("verify:milestone-governance");
  });
});

describe("v1.5 milestone audit aggregation", () => {
  it("reports PASS when phase21–24 JSON gateStatus values are pass", () => {
    const report = buildV15MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true });
    expect(report.phases).toHaveLength(4);
    expect(report.phases.every((phase) => phase.passed)).toBe(true);
    expect(report.verdict).toBe("PASS");
  });

  it("generated v1.5 audit markdown includes five-requirement coverage", () => {
    const markdown = renderV15MilestoneAuditMarkdown(
      buildV15MilestoneAuditReport(REPO_ROOT, { skipTraceabilityCheck: true })
    );
    expect(markdown).toContain("5/5");
    expect(markdown).toContain("Real 3D Render");
    expect(markdown).toMatch(/\*\*PASS\*\*/);
  });
});
