#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSEMBLIES_ROOT = resolve(REPO_ROOT, "src/content/assemblies");
const CAPTION_CANONICAL = resolve(REPO_ROOT, ".artifacts/captions/network-foundations-long-v1.json");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase06/narrative-composition.json");
const MARKDOWN_OUT = resolve(
  REPO_ROOT,
  ".planning/phases/06-narrative-cinematic-composition/VERIFICATION.md"
);

const ASSEMBLY_SLUGS = [
  "network-foundations-long-v1",
  "security-expansion-long-v1",
  "content-depth-branched-v1"
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

function summarizeAssemblies() {
  return ASSEMBLY_SLUGS.map((slug) => {
    const assemblyPath = resolve(ASSEMBLIES_ROOT, `${slug}.json`);
    const assembly = JSON.parse(readFileSync(assemblyPath, "utf-8"));
    return {
      slug,
      sequenceLength: assembly.sequence?.length ?? 0,
      topicCount:
        assembly.sequence?.length ??
        assembly.branches?.find((branch) => branch.id === assembly.defaultBranchId)?.sequence
          .length ??
        assembly.branches?.[0]?.sequence.length ??
        0,
      branchCount: assembly.branches?.length ?? 0,
      defaultBranchId: assembly.defaultBranchId ?? null,
      targetWindowMinutes: assembly.targetWindowMinutes ?? null,
      assemblyPath: assemblyPath.replace(`${REPO_ROOT}/`, "")
    };
  });
}

function summarizeCaptions() {
  const summaries = [];
  if (existsSync(CAPTION_CANONICAL)) {
    const captionMap = JSON.parse(readFileSync(CAPTION_CANONICAL, "utf-8"));
    summaries.push({
      assemblySlug: captionMap.assemblySlug,
      entryCount: captionMap.entries?.length ?? 0,
      path: CAPTION_CANONICAL.replace(`${REPO_ROOT}/`, "")
    });
  } else {
    summaries.push({
      assemblySlug: "network-foundations-long-v1",
      entryCount: 0,
      path: CAPTION_CANONICAL.replace(`${REPO_ROOT}/`, ""),
      missing: true
    });
  }
  return summaries;
}

function buildMarkdown(report) {
  const lines = [
    "# Phase 06 Narrative Composition Verification",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Gate Status",
    "",
    `| Gate | Status |`,
    `| --- | --- |`,
    `| Phase 06 blocking gate | **${report.gateStatus.toUpperCase()}** |`,
    `| Assembly profiles valid | ${report.blockingCriteria.assembliesValid ? "yes" : "no"} |`,
    `| Caption map present | ${report.blockingCriteria.captionMapPresent ? "yes" : "no"} |`,
    `| Replay suites passed | ${report.blockingCriteria.replaySuitesPassed ? "yes" : "no"} |`,
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
    "| Slug | Topics | Branches | Default branch | Window (min-max) |",
    "| --- | ---: | ---: | --- | --- |"
  );

  for (const assembly of report.assemblies) {
    const window = assembly.targetWindowMinutes
      ? `${assembly.targetWindowMinutes.min}-${assembly.targetWindowMinutes.max} min`
      : "n/a";
    const branches = assembly.branchCount > 0 ? String(assembly.branchCount) : "—";
    const defaultBranch = assembly.defaultBranchId ?? "—";
    lines.push(
      `| ${assembly.slug} | ${assembly.topicCount} | ${branches} | ${defaultBranch} | ${window} |`
    );
  }

  lines.push(
    "",
    "## Caption Maps",
    "",
    "| Assembly | Entries | Artifact |",
    "| --- | ---: | --- |"
  );

  for (const caption of report.captions) {
    lines.push(
      `| ${caption.assemblySlug} | ${caption.entryCount} | \`${caption.path}\`${caption.missing ? " (missing)" : ""} |`
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
  const assemblies = summarizeAssemblies();
  const captions = summarizeCaptions();

  const suites = [
    runSuite("long-form-assembly", "npm", ["run", "test", "--", "tests/long-form-assembly.test.ts"]),
    runSuite("caption-timing-map", "npm", ["run", "test", "--", "tests/caption-timing-map.test.ts"]),
    runSuite("narrative-composition-replay", "npm", [
      "run",
      "test",
      "--",
      "tests/narrative-composition-replay.test.ts"
    ])
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

  const assembliesValid = suites.find((suite) => suite.label === "long-form-assembly")?.passed ?? false;
  const captionMapPresent = captions.every((entry) => !entry.missing && entry.entryCount > 0);
  const replaySuitesPassed =
    suites.find((suite) => suite.label === "narrative-composition-replay")?.passed ?? false;
  const suitesPassed = suites.every((suite) => suite.skipped || suite.passed);
  const gateStatus =
    assembliesValid && captionMapPresent && replaySuitesPassed && suitesPassed ? "pass" : "fail";

  const report = {
    phase: "06-narrative-cinematic-composition",
    generatedAt: new Date().toISOString(),
    gateStatus,
    quickMode,
    blockingCriteria: {
      assembliesValid,
      captionMapPresent,
      replaySuitesPassed,
      suitesPassed
    },
    assemblies,
    captions,
    errors: [
      ...suites
        .filter((suite) => !suite.skipped && !suite.passed)
        .map((suite) => `${suite.label} failed (${suite.command})`),
      ...captions
        .filter((entry) => entry.missing)
        .map((entry) => `Missing caption map for ${entry.assemblySlug}`)
    ],
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
