#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_ROOT = resolve(REPO_ROOT, "src/content/topics");
const MANIFEST_PATH = resolve(TOPICS_ROOT, "manifest.json");
const EXPORT_ROOT = resolve(REPO_ROOT, ".artifacts/export/phase07");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase07/batch-quality.json");
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/07-batch-quality-verification-expansion/VERIFICATION.md"
);

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
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
}

function loadContract(topic) {
  const contractPath = resolve(TOPICS_ROOT, topic, "contract.json");
  return JSON.parse(readFileSync(contractPath, "utf-8"));
}

function summarizeModules(manifestOrder) {
  return manifestOrder.map((topicId) => {
    const contract = loadContract(topicId);
    const exportPath = resolve(EXPORT_ROOT, `${contract.slug}.mp4`);
    const exportExists = existsSync(exportPath);

    return {
      id: topicId,
      slug: contract.slug,
      packetComplete: contract.storyboardBeats?.length > 0 &&
        contract.narrationPlaceholders?.length === contract.storyboardBeats?.length,
      beatCount: contract.storyboardBeats?.length ?? 0,
      placeholderCount: contract.narrationPlaceholders?.length ?? 0,
      exportPath: exportPath.replace(`${REPO_ROOT}/`, ""),
      exportExists,
      kpi: {
        assetId: contract.slug,
        retentionCheckpoints: {
          p25: null,
          p50: null,
          p75: null,
          completion: null
        },
        pacingVerdict: null,
        feedbackTags: [],
        acceptanceReady: false,
        note: "Populate KPI via populateKpiCapture before publish acceptance."
      }
    };
  });
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 07 Batch Quality Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    "| Gate | Status |",
    "| --- | --- |",
    `| Phase 07 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Module packet completeness | ${report.blockingCriteria.packetComplete ? "yes" : "no"} |`,
    `| Export artifacts present | ${report.blockingCriteria.exportsPresent ? "yes" : "no"} |`,
    `| Verification suites passed | ${report.blockingCriteria.suitesPassed ? "yes" : "no"} |`,
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
    "## Module Coverage",
    "",
    "| Module | Slug | Packet | Export | KPI Ready | Beats |",
    "| --- | --- | --- | --- | --- | ---: |"
  );

  for (const moduleEntry of report.modules) {
    lines.push(
      `| ${moduleEntry.id} | ${moduleEntry.slug} | ${moduleEntry.packetComplete ? "ok" : "fail"} | ${moduleEntry.exportExists ? "ok" : "missing"} | ${moduleEntry.kpi.acceptanceReady ? "yes" : "no"} | ${moduleEntry.beatCount} |`
    );
  }

  lines.push(
    "",
    "## KPI Acceptance Signals",
    "",
    "Skeleton KPI rows are expected until publish data is captured. Tests prove acceptance path via `populateKpiCapture` + `validateKpiCaptureCompleteness`.",
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

  const suites = [
    runSuite("expansion-module-e2e", "npm", ["run", "test", "--", "tests/expansion-module-e2e.test.ts"]),
    runSuite("expansion-batch-export", "npm", ["run", "test", "--", "tests/expansion-batch-export.test.ts"]),
    runSuite("batch-kpi-acceptance", "npm", ["run", "test", "--", "tests/batch-kpi-acceptance.test.ts"])
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

  const modules = summarizeModules(manifest.order);

  const packetComplete = modules.every((entry) => entry.packetComplete);
  const exportsPresent =
    modules.every((entry) => entry.exportExists) &&
    existsSync(resolve(EXPORT_ROOT, "network-foundations-long-v1.mp4")) &&
    existsSync(resolve(EXPORT_ROOT, "security-expansion-long-v1.mp4"));
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const gateStatus = packetComplete && exportsPresent && suitesPassed ? "pass" : "fail";

  const report = {
    phase: "07-batch-quality-verification-expansion",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    blockingCriteria: {
      packetComplete,
      exportsPresent,
      suitesPassed
    },
    modules,
    errors: [
      ...suites
        .filter((suite) => !suite.skipped && !suite.passed)
        .map((suite) => `${suite.label} failed (${suite.command})`),
      ...modules
        .filter((entry) => !entry.exportExists)
        .map((entry) => `Missing export artifact for ${entry.slug}`)
    ],
    suites,
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
