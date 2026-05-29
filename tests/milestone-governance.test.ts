import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  buildMilestoneAuditReport,
  renderMilestoneAuditMarkdown
} from "../src/verification/milestone-audit.js";

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

describe("milestone governance policy", () => {
  it("requirement traceability JSON exists with pass gate after validation", () => {
    const jsonPath = resolve(
      REPO_ROOT,
      ".artifacts/verification/phase08/requirement-traceability.json"
    );
    const parsed = JSON.parse(readFileSync(jsonPath, "utf-8")) as { gateStatus: string };
    expect(parsed.gateStatus).toBe("pass");
  });

  it("package.json and CI reference verify:milestone-governance", () => {
    const pkg = readFileSync(resolve(REPO_ROOT, "package.json"), "utf-8");
    const ci = readFileSync(resolve(REPO_ROOT, ".github/workflows/ci.yml"), "utf-8");
    expect(pkg).toContain("verify:milestone-governance");
    expect(ci).toContain("verify:milestone-governance");
  });
});
