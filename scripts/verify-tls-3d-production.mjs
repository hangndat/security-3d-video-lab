#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase23/tls-3d-production.json");

const quickMode = process.argv.includes("--quick");
const gateEnv = {
  ...process.env,
  SECURITY_LAB_RENDER_BACKEND: "trace-hash"
};

function runSuite(label, command, args, env = gateEnv) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    shell: false,
    env
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

const suites = [
  runSuite("frameSource mapping tests", "npm", [
    "run",
    "test",
    "--",
    "tests/tls-production-export.test.ts",
    "--testNamePattern=frameSource"
  ]),
  runSuite("videoOnly manifest tests", "npm", [
    "run",
    "test",
    "--",
    "tests/tls-production-export.test.ts",
    "--testNamePattern=videoOnly"
  ]),
  runSuite("video-only rubric tests", "npm", [
    "run",
    "test",
    "--",
    "tests/tls-production-export.test.ts",
    "--testNamePattern=rubric"
  ])
];

if (!quickMode) {
  suites.push(
    runSuite("3D production GL smoke", "npm", [
      "run",
      "test",
      "--",
      "tests/tls-production-export.test.ts",
      "--testNamePattern=3D production"
    ])
  );
}

const videoOnlyManifestTestsPassed = suites[1]?.passed ?? false;
const tls3dSmokeTestsPassed = quickMode ? null : suites[3]?.passed ?? null;
const gatePassed = suites.every((suite) => suite.passed);

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  manifestChecks: {
    expectsVideoOnly: true,
    expectsFrameSourceWhenR3f: "png"
  },
  blockingCriteria: {
    videoOnlyManifestTestsPassed,
    frameSourceTestsPassed: suites[0]?.passed ?? false,
    moduleRubricPassed: suites[2]?.passed ?? false,
    tls3dSmokeTestsPassed
  },
  suites
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("TLS 3D production verification gate: FAIL");
  process.exit(1);
}

console.log("TLS 3D production verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
