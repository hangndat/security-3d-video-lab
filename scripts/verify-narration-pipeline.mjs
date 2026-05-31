#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase11/narration-pipeline.json");
const MARKDOWN_OUT = resolve(REPO_ROOT, ".planning/phases/11-narration-pipeline/VERIFICATION.md");

const COVERAGE_TARGETS = [
  { assemblySlug: "network-foundations-long-v1", branchId: null, label: "canonical" },
  {
    assemblySlug: "content-depth-branched-v1",
    branchId: "defense-path",
    label: "branched-defense-path"
  }
];

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
    "# Phase 11 Narration Pipeline Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    "| Gate | Status |",
    "| --- | --- |",
    `| Phase 11 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Narration track tests passed | ${report.blockingCriteria.narrationTrackPassed ? "yes" : "no"} |`,
    `| Export bundle tests passed | ${report.blockingCriteria.exportBundlePassed ? "yes" : "no"} |`,
    `| Replay suites passed | ${report.blockingCriteria.suitesPassed ? "yes" : "no"} |`,
    "",
    "## Suite Results",
    "",
    "| Suite | Command | Exit | Pass |",
    "| --- | --- | ---: | --- |"
  ];

  for (const suite of report.suites) {
    const status = suite.skipped ? "SKIP" : suite.passed ? "PASS" : "FAIL";
    lines.push(`| ${suite.label} | \`${suite.command}\` | ${suite.exitCode} | ${status} |`);
  }

  lines.push(
    "",
    "## Assembly Coverage",
    "",
    "| Target | Assembly | Branch |",
    "| --- | --- | --- |"
  );

  for (const target of report.coverage) {
    lines.push(`| ${target.label} | ${target.assemblySlug} | ${target.branchId ?? "—"} |`);
  }

  lines.push(
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
  const suites = [
    runSuite("narration-track", "npm", ["run", "test", "--", "tests/narration-track.test.ts"]),
    runSuite("narration-export", "npm", ["run", "test", "--", "tests/narration-export.test.ts"])
  ];

  const narrationTrackPassed =
    suites.find((suite) => suite.label === "narration-track")?.passed ?? false;
  const exportBundlePassed =
    suites.find((suite) => suite.label === "narration-export")?.passed ?? false;
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const gateStatus =
    narrationTrackPassed && exportBundlePassed && suitesPassed ? "pass" : "fail";

  const report = {
    phase: "11-narration-pipeline",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    blockingCriteria: {
      narrationTrackPassed,
      exportBundlePassed,
      suitesPassed
    },
    coverage: COVERAGE_TARGETS,
    errors: suites
      .filter((suite) => !suite.skipped && !suite.passed)
      .map((suite) => `${suite.label} failed (${suite.command})`),
    suites,
    jsonArtifact: JSON_OUT
  };

  mkdirSync(dirname(JSON_OUT), { recursive: true });
  writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  writeFileSync(MARKDOWN_OUT, buildMarkdown(report), "utf-8");

  process.stdout.write(`Wrote ${JSON_OUT}\n`);
  process.stdout.write(`Wrote ${MARKDOWN_OUT}\n`);

  if (gateStatus !== "pass") {
    process.exit(1);
  }
}

main();
