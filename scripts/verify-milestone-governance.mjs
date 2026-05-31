#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { buildV12MilestoneAuditReport } from "../src/verification/milestone-audit.ts";
import { validateRequirementTraceability } from "../src/verification/requirement-traceability.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase12/milestone-governance.json");
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/12-v12-verification-governance/VERIFICATION.md"
);
const AUDIT_PATH = resolve(REPO_ROOT, ".planning/milestones/v1.2-MILESTONE-AUDIT.md");

const quickMode = process.argv.includes("--quick");

function runSuite(label, command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    shell: false
  });
  return {
    label,
    command: [command, ...args].join(" "),
    startedAt,
    completedAt: new Date().toISOString(),
    exitCode: result.status ?? 1,
    passed: (result.status ?? 1) === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 12 Governance Milestone Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    "| Gate | Status |",
    "| --- | --- |",
    `| Phase 12 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Traceability (milestone-close) | ${report.blockingCriteria.traceabilityPassed ? "yes" : "no"} |`,
    `| Milestone audit verdict | ${report.blockingCriteria.auditVerdict} |`,
    `| Governance test suites | ${report.blockingCriteria.suitesPassed ? "yes" : "no"} |`,
    "",
    "## Suite Results",
    "",
    "| Suite | Command | Exit | Status |",
    "| --- | --- | ---: | --- |"
  ];

  for (const suite of report.suites) {
    const status = suite.skipped ? "SKIP" : suite.passed ? "PASS" : "FAIL";
    lines.push(`| ${suite.label} | \`${suite.command}\` | ${suite.exitCode} | ${status} |`);
  }

  lines.push(
    "",
    "## Milestone Audit",
    "",
    `- Verdict: **${report.audit.verdict}**`,
    `- Artifact: \`.planning/milestones/v1.2-MILESTONE-AUDIT.md\``,
    "",
    "## Machine Evidence",
    "",
    `- JSON artifact: \`${report.jsonArtifact.replace(`${REPO_ROOT}/`, "")}\``,
    ""
  );

  if (report.errors.length > 0) {
    lines.push("## Blocking Errors", "");
    for (const error of report.errors) {
      lines.push(`- ${error}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const betweenMilestones = validateRequirementTraceability().skipped === true;

  const suites = betweenMilestones
    ? [
        {
          label: "requirement-traceability",
          command: "node scripts/validate-requirement-traceability.mjs --milestone-close",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          exitCode: 0,
          passed: true,
          skipped: true,
          stdout: "Between milestones: traceability validation skipped.",
          stderr: ""
        },
        {
          label: "milestone-governance-tests",
          command:
            "npm run test -- tests/requirement-traceability.test.ts tests/milestone-governance.test.ts",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          exitCode: 0,
          passed: true,
          skipped: true,
          stdout: "Between milestones: governance test suite skipped in orchestrator.",
          stderr: ""
        }
      ]
    : [
        runSuite("requirement-traceability", "node", [
          "scripts/validate-requirement-traceability.mjs",
          "--milestone-close"
        ]),
        runSuite("milestone-governance-tests", "npm", [
          "run",
          "test",
          "--",
          "tests/requirement-traceability.test.ts",
          "tests/milestone-governance.test.ts"
        ])
      ];

  if (!quickMode) {
    suites.push(
      runSuite("refresh-phase-evidence", "npm", [
        "run",
        "verify:content-authoring",
        "--",
        "--quick"
      ]),
      runSuite("refresh-narrative-evidence", "npm", [
        "run",
        "verify:narrative-composition",
        "--",
        "--quick"
      ]),
      runSuite("refresh-narration-evidence", "npm", [
        "run",
        "verify:narration-pipeline",
        "--",
        "--quick"
      ]),
      runSuite("refresh-content-depth-evidence", "npm", [
        "run",
        "verify:content-depth",
        "--",
        "--quick"
      ])
    );
    suites.push(runSuite("audit-milestone", "node", ["scripts/audit-milestone-v1.2.mjs"]));
  } else {
    suites.push({
      label: "refresh-phase-evidence",
      command: "npm run verify:content-authoring -- --quick",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      exitCode: 0,
      passed: false,
      skipped: true,
      stdout: "Skipped in --quick mode.",
      stderr: ""
    });
    const auditSuite = runSuite("audit-milestone", "node", ["scripts/audit-milestone-v1.2.mjs"]);
    suites.push(auditSuite);
  }

  const traceabilitySuite = suites.find((suite) => suite.label === "requirement-traceability");
  const traceabilityPassed =
    traceabilitySuite?.skipped === true || traceabilitySuite?.passed === true;
  const audit = existsSync(AUDIT_PATH)
    ? buildV12MilestoneAuditReport(REPO_ROOT)
    : { verdict: "FAIL", errors: ["Missing v1.2-MILESTONE-AUDIT.md"] };
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const gateStatus =
    traceabilityPassed && audit.verdict === "PASS" && suitesPassed ? "pass" : "fail";

  const report = {
    phase: "12-v12-verification-governance",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    betweenMilestones,
    blockingCriteria: {
      traceabilityPassed,
      auditVerdict: audit.verdict,
      suitesPassed
    },
    audit,
    suites,
    errors: [
      ...suites
        .filter((suite) => !suite.skipped && !suite.passed)
        .map((suite) => `${suite.label} failed (${suite.command})`),
      ...audit.errors
    ],
    jsonArtifact: JSON_OUT
  };

  mkdirSync(dirname(JSON_OUT), { recursive: true });
  mkdirSync(dirname(MARKDOWN_OUT), { recursive: true });
  writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  writeFileSync(MARKDOWN_OUT, buildMarkdown(report), "utf-8");

  process.stdout.write(`Wrote ${JSON_OUT}\n`);
  process.stdout.write(`Wrote ${MARKDOWN_OUT}\n`);

  if (gateStatus !== "pass") {
    process.exit(1);
  }
}

main();
