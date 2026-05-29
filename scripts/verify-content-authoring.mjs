#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import Ajv from "ajv";

import schema from "../src/content/contracts/topic-contract.schema.json" with { type: "json" };

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_ROOT = resolve(REPO_ROOT, "src/content/topics");
const MANIFEST_PATH = resolve(TOPICS_ROOT, "manifest.json");
const JSON_OUT = resolve(
  REPO_ROOT,
  ".artifacts/verification/phase05/content-authoring-foundation.json"
);
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/05-content-authoring-foundation/VERIFICATION.md"
);

const DRAFT_MODULE_IDS = ["auth-session", "pki-trust-chain", "mitm-defense"];
const FPS = 30;
const SOFT_DRIFT_RATIO = 0.1;
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

function loadManifest() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  if (!Array.isArray(manifest.order)) {
    throw new Error("Manifest order must be an array.");
  }
  return manifest;
}

function loadContract(topic) {
  const contractPath = resolve(TOPICS_ROOT, topic, "contract.json");
  return {
    contractPath,
    contract: JSON.parse(readFileSync(contractPath, "utf-8"))
  };
}

function countDurationDriftWarnings(manifestOrder) {
  let warningCount = 0;

  for (const topicId of manifestOrder) {
    const { contract } = loadContract(topicId);
    if (!Array.isArray(contract.storyboardBeats) || contract.storyboardBeats.length === 0) {
      continue;
    }

    const beatStart = Math.min(...contract.storyboardBeats.map((beat) => beat.startFrame));
    const beatEnd = Math.max(...contract.storyboardBeats.map((beat) => beat.endFrame));
    const estimatedSeconds = (beatEnd - beatStart) / FPS;
    const targetSeconds = contract.durationBudget?.targetSeconds;
    if (typeof targetSeconds !== "number" || targetSeconds <= 0) {
      continue;
    }

    const driftRatio = Math.abs(estimatedSeconds - targetSeconds) / targetSeconds;
    if (driftRatio > SOFT_DRIFT_RATIO) {
      warningCount += 1;
    }
  }

  return warningCount;
}

function summarizeModules(manifestOrder) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateSchema = ajv.compile(schema);
  const modules = [];

  for (const topicId of manifestOrder) {
    const { contractPath, contract } = loadContract(topicId);
    const schemaValid = validateSchema(contract) === true;
    const schemaErrors = (validateSchema.errors ?? []).map(
      (issue) => `${issue.instancePath || "/"}: ${issue.message ?? "Schema validation failed."}`
    );

    modules.push({
      id: topicId,
      slug: contract.slug,
      draft: DRAFT_MODULE_IDS.includes(topicId),
      schemaValid,
      schemaErrors,
      beatCount: contract.storyboardBeats?.length ?? 0,
      placeholderCount: contract.narrationPlaceholders?.length ?? 0,
      contractPath: contractPath.replace(`${REPO_ROOT}/`, "")
    });
  }

  return modules;
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 05 Content Authoring Foundation Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    `| Gate | Status |`,
    `| --- | --- |`,
    `| D-11 blocking gate (contract + E2E smoke) | **${report.gateStatus.toUpperCase()}** |`,
    `| Blocking contract errors | ${report.blockingCriteria.contractErrors} |`,
    `| E2E smoke suites passed | ${report.blockingCriteria.e2eSmokePassed ? "yes" : "no"} |`,
    `| Warning count (contract drift policy) | ${report.warningCount} |`,
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
    "## Module Coverage",
    "",
    "| Module ID | Slug | Draft | Schema | Beats | Placeholders |",
    "| --- | --- | --- | --- | ---: | ---: |"
  );

  for (const moduleEntry of report.modules) {
    lines.push(
      `| ${moduleEntry.id} | ${moduleEntry.slug} | ${moduleEntry.draft ? "yes" : "no"} | ${moduleEntry.schemaValid ? "valid" : "invalid"} | ${moduleEntry.beatCount} | ${moduleEntry.placeholderCount} |`
    );
  }

  lines.push(
    "",
    "## New Draft Modules (CONT-01)",
    "",
    ...DRAFT_MODULE_IDS.map((moduleId) => {
      const moduleEntry = report.modules.find((entry) => entry.id === moduleId);
      if (!moduleEntry) {
        return `- ${moduleId}: missing`;
      }
      return `- ${moduleId}: ${moduleEntry.schemaValid ? "valid" : "invalid"} (${moduleEntry.slug})`;
    }),
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
  const manifest = loadManifest();
  const modules = summarizeModules(manifest.order);

  const suites = [
    runSuite(
      "content-authoring-foundation",
      "npm",
      [
        "run",
        "test",
        "--",
        "tests/content-authoring-foundation.test.ts",
        "--testNamePattern",
        "scaffold|manifest|draft|blocking|repository"
      ]
    ),
    runSuite("content-contracts", "npm", ["run", "test", "--", "tests/content-contracts.test.ts"])
  ];

  if (!quickMode) {
    suites.push(runSuite("e2e-canonical-smoke", "npm", ["run", "test:e2e:all", "--", "--smoke"]));
  } else {
    suites.push({
      label: "e2e-canonical-smoke",
      command: "npm run test:e2e:all -- --smoke",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      exitCode: 0,
      passed: false,
      skipped: true,
      stdout: "Skipped in --quick mode; enforced by CI pr-full-validation job.",
      stderr: ""
    });
  }

  const schemaErrors = modules.flatMap((moduleEntry) =>
    moduleEntry.schemaValid
      ? []
      : moduleEntry.schemaErrors.map((reason) => `${moduleEntry.id}: ${reason}`)
  );

  const contractErrors = schemaErrors.length;
  const e2eSuite = suites.find((suite) => suite.label === "e2e-canonical-smoke");
  const e2eSmokePassed = e2eSuite?.skipped ? false : (e2eSuite?.passed ?? false);
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const warningCount = countDurationDriftWarnings(manifest.order);
  const gateStatus =
    contractErrors === 0 && (quickMode || e2eSmokePassed) && suitesPassed ? "pass" : "fail";

  const report = {
    phase: "05-content-authoring-foundation",
    generatedAt: new Date().toISOString(),
    gateStatus,
    blockingCriteria: {
      contractErrors,
      e2eSmokePassed,
      suitesPassed
    },
    warningCount,
    quickMode,
    errors: [
      ...schemaErrors,
      ...suites.filter((suite) => !suite.passed).map((suite) => `${suite.label} failed (${suite.command})`)
    ],
    suites,
    modules,
    draftModuleIds: DRAFT_MODULE_IDS,
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
