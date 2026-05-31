#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase19/tls-production.json");
const ARTIFACT_ROOT = resolve(REPO_ROOT, ".artifacts/production/tls");

const quickMode = process.argv.includes("--quick");

const REQUIRED_ARTIFACTS = [
  "tls-production.mp4",
  "production-manifest.json",
  "security-signoff.json",
  "caption-timing-map.json",
  "narration-track.json",
  "beat-sheet.md",
  "render-handoff.md",
  "audio-layer-handoff.md",
  "tls-production-scene-spec.json"
];

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

function checkArtifacts() {
  const missing = REQUIRED_ARTIFACTS.filter((fileName) => !existsSync(resolve(ARTIFACT_ROOT, fileName)));
  let signoff = null;
  if (existsSync(resolve(ARTIFACT_ROOT, "security-signoff.json"))) {
    signoff = JSON.parse(readFileSync(resolve(ARTIFACT_ROOT, "security-signoff.json"), "utf-8"));
  }
  return {
    passed: missing.length === 0 && signoff?.approvedForProduction === true,
    missing,
    signoff
  };
}

const suites = [
  runSuite(
    "tls-production-export tests",
    "npm",
    ["run", "test", "--", "tests/tls-production-export.test.ts"]
  )
];

if (!quickMode) {
  suites.push(
    runSuite("requirement traceability", "npm", ["run", "validate:requirements"])
  );
}

const artifactCheck = checkArtifacts();
const allSuitesPassed = suites.every((suite) => suite.passed);
const gatePassed = allSuitesPassed && artifactCheck.passed;

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  blockingCriteria: {
    tlsProductionTestsPassed: suites[0]?.passed ?? false,
    traceabilityPassed: quickMode ? null : suites[1]?.passed ?? null,
    artifactsPresent: artifactCheck.missing.length === 0,
    securitySignoffApproved: artifactCheck.signoff?.approvedForProduction === true
  },
  artifactRoot: ".artifacts/production/tls",
  missingArtifacts: artifactCheck.missing,
  securitySignoff: artifactCheck.signoff,
  suites
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("TLS production verification gate: FAIL");
  if (artifactCheck.missing.length > 0) {
    console.error(`Missing artifacts: ${artifactCheck.missing.join(", ")}`);
  }
  process.exit(1);
}

console.log("TLS production verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
