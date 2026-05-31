#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_ROOT = resolve(REPO_ROOT, "src/content/topics");
const MANIFEST_PATH = resolve(TOPICS_ROOT, "manifest.json");
const EXPORT_ROOT = resolve(REPO_ROOT, ".artifacts/export/phase12");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase12/content-depth.json");
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/12-v12-verification-governance/VERIFICATION.md"
);

const BRANCH_IDS = ["attack-path", "defense-path"];
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

function summarizeExports(manifestOrder) {
  return manifestOrder.map((topicId) => {
    const contract = loadContract(topicId);
    const exportPath = resolve(EXPORT_ROOT, `${contract.slug}.mp4`);
    return {
      id: topicId,
      slug: contract.slug,
      exportPath: exportPath.replace(`${REPO_ROOT}/`, ""),
      exportExists: existsSync(exportPath)
    };
  });
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 12 Content Depth Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    "| Gate | Status |",
    "| --- | --- |",
    `| Phase 12 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Nine-topic short exports | ${report.blockingCriteria.shortExportsPresent ? "yes" : "no"} |`,
    `| Depth assembly export | ${report.blockingCriteria.depthExportPresent ? "yes" : "no"} |`,
    `| Branched exports | ${report.blockingCriteria.branchedExportsPresent ? "yes" : "no"} |`,
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
    "## Module Export Coverage",
    "",
    "| Module | Slug | Export |",
    "| --- | --- | --- |"
  );

  for (const moduleEntry of report.modules) {
    lines.push(
      `| ${moduleEntry.id} | ${moduleEntry.slug} | ${moduleEntry.exportExists ? "ok" : "missing"} |`
    );
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
  const manifest = loadManifest();

  const suites = [
    runSuite("v12-content-depth-export", "npm", [
      "run",
      "test",
      "--",
      "tests/v12-content-depth-export.test.ts"
    ]),
    runSuite("expansion-module-e2e-v12", "npm", [
      "run",
      "test",
      "--",
      "tests/expansion-module-e2e.test.ts",
      "--testNamePattern",
      "v1.2|zero-trust|oauth|api-gateway"
    ])
  ];

  if (!quickMode) {
    suites.push(
      runSuite("expansion-batch-export-nine", "npm", [
        "run",
        "test",
        "--",
        "tests/expansion-batch-export.test.ts"
      ])
    );
  }

  const modules = summarizeExports(manifest.order);
  const shortExportsPresent = modules.every((entry) => entry.exportExists);
  const depthExportPresent = existsSync(resolve(EXPORT_ROOT, "content-depth-long-v1.mp4"));
  const branchedExportsPresent = BRANCH_IDS.every((branchId) =>
    existsSync(resolve(EXPORT_ROOT, `content-depth-branched-v1-${branchId}.mp4`))
  );
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const gateStatus =
    shortExportsPresent && depthExportPresent && branchedExportsPresent && suitesPassed
      ? "pass"
      : "fail";

  const report = {
    phase: "12-v12-verification-governance",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    blockingCriteria: {
      shortExportsPresent,
      depthExportPresent,
      branchedExportsPresent,
      suitesPassed
    },
    modules,
    assemblyExports: {
      depth: "content-depth-long-v1.mp4",
      branched: BRANCH_IDS.map((branchId) => `content-depth-branched-v1-${branchId}.mp4`)
    },
    errors: [
      ...suites
        .filter((suite) => !suite.skipped && !suite.passed)
        .map((suite) => `${suite.label} failed (${suite.command})`),
      ...modules
        .filter((entry) => !entry.exportExists)
        .map((entry) => `Missing export artifact for ${entry.slug}`),
      ...(depthExportPresent ? [] : ["Missing content-depth-long-v1 export artifact"]),
      ...(branchedExportsPresent
        ? []
        : ["Missing one or more branched export artifacts for content-depth-branched-v1"])
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
