#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase16/crew-skills.json");
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/16-production-orchestrator-verification/VERIFICATION.md"
);

const WALKTHROUGH_PATH = resolve(REPO_ROOT, "docs/tls-crew-walkthrough.md");
const AGENTS_PATH = resolve(REPO_ROOT, "AGENTS.md");

const CREW_SKILL_NAMES = [
  "cinematic-director",
  "cinematic-art-director",
  "cinematic-storyboard-artist",
  "cinematic-3d-motion-designer",
  "cinematic-creative-technologist",
  "cinematic-security-sme-audio",
  "cinematic-production-orchestrator"
];

const WALKTHROUGH_SECTIONS = [
  "## Step 1: Director",
  "## Step 2: Art Director",
  "## Step 3: Storyboard Artist",
  "## Step 4: 3D Motion Designer",
  "## Step 5: Creative Technologist",
  "## Step 6: Security SME + Audio",
  "## Step 7: Orchestrator Review",
  "## Verification Commands"
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

function checkWalkthroughSections(content) {
  const missing = WALKTHROUGH_SECTIONS.filter((section) => !content.includes(section));
  return { passed: missing.length === 0, missing };
}

function checkAgentsIndex(content) {
  const missing = CREW_SKILL_NAMES.filter((name) => !content.includes(name));
  return { passed: missing.length === 0, missing };
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 16 Crew Skills Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    "| Gate | Status |",
    "| --- | --- |",
    `| Phase 16 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Crew smoke tests | ${report.blockingCriteria.smokeTestsPassed ? "yes" : "no"} |`,
    `| AGENTS.md index | ${report.blockingCriteria.agentsIndexPassed ? "yes" : "no"} |`,
    `| TLS walkthrough sections | ${report.blockingCriteria.walkthroughPassed ? "yes" : "no"} |`,
    "",
    "## Suite Results",
    "",
    "| Suite | Command | Exit | Status |",
    "| --- | --- | ---: | --- |"
  ];

  for (const suite of report.suites) {
    const status = suite.passed ? "PASS" : "FAIL";
    lines.push(`| ${suite.label} | \`${suite.command}\` | ${suite.exitCode} | ${status} |`);
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
    runSuite("cinematic-crew-skills-tests", "npm", [
      "run",
      "test",
      "--",
      "tests/cinematic-crew-skills.test.ts"
    ])
  ];

  const agentsContent = readFileSync(AGENTS_PATH, "utf-8");
  const walkthroughContent = readFileSync(WALKTHROUGH_PATH, "utf-8");
  const agentsCheck = checkAgentsIndex(agentsContent);
  const walkthroughCheck = checkWalkthroughSections(walkthroughContent);

  const structuralErrors = [];
  if (!agentsCheck.passed) {
    structuralErrors.push(`AGENTS.md missing skills: ${agentsCheck.missing.join(", ")}`);
  }
  if (!walkthroughCheck.passed) {
    structuralErrors.push(`Walkthrough missing sections: ${walkthroughCheck.missing.join(", ")}`);
  }
  if (!walkthroughContent.includes("tls/contract.json")) {
    structuralErrors.push("Walkthrough must reference tls/contract.json");
  }
  if (!walkthroughContent.includes("tls-hook")) {
    structuralErrors.push("Walkthrough must reference tls-hook beat");
  }

  const smokeTestsPassed = suites.every((suite) => suite.passed);
  const gateStatus =
    smokeTestsPassed && agentsCheck.passed && walkthroughCheck.passed && structuralErrors.length === 0
      ? "pass"
      : "fail";

  const report = {
    phase: "16-production-orchestrator-verification",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    blockingCriteria: {
      smokeTestsPassed,
      agentsIndexPassed: agentsCheck.passed,
      walkthroughPassed: walkthroughCheck.passed
    },
    suites,
    errors: [
      ...suites.filter((suite) => !suite.passed).map((suite) => `${suite.label} failed`),
      ...structuralErrors
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
