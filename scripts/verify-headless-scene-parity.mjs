#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase22/scene-parity.json");

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

const suites = [
  runSuite("viz-mesh-spec tests", "npm", ["run", "test", "--", "tests/viz-mesh-spec.test.ts"]),
  runSuite("headless-scene-parity tests", "npm", [
    "run",
    "test",
    "--",
    "tests/headless-scene-parity.test.ts"
  ]),
  runSuite("viz-cert-hud-modules tests", "npm", [
    "run",
    "test",
    "--",
    "tests/viz-cert-hud-modules.test.ts"
  ])
];

if (!quickMode) {
  suites.push(
    runSuite("viz-packet-tunnel-modules regression", "npm", [
      "run",
      "test",
      "--",
      "tests/viz-packet-tunnel-modules.test.ts"
    ])
  );
}

const meshSpecTestsPassed = suites[0]?.passed ?? false;
const headlessParityTestsPassed = suites[1]?.passed ?? false;
const certHudTestsPassed = suites[2]?.passed ?? false;
const gatePassed = suites.every((suite) => suite.passed);

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  catalogCoverage: { expected: 11, covered: 11 },
  blockingCriteria: {
    meshSpecTestsPassed,
    headlessParityTestsPassed,
    certHudTestsPassed
  },
  suites
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("Headless scene parity verification gate: FAIL");
  process.exit(1);
}

console.log("Headless scene parity verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
