#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase24/3d-render.json");

const quickMode = process.argv.includes("--quick");
const DOCUMENTED_LOCAL_3D_COMMAND =
  "npm run test -- tests/tls-production-export.test.ts --testNamePattern=\"3D production export\"";

const gateEnv = {
  ...process.env,
  SECURITY_LAB_RENDER_BACKEND: "trace-hash"
};

function runSuite(label, command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    shell: false,
    env: gateEnv
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

const subGateArgs = quickMode ? ["--quick"] : [];

const suites = [
  runSuite("verify-headless-capture", "node", [
    "scripts/verify-headless-capture.mjs",
    ...subGateArgs
  ]),
  runSuite("verify-headless-scene-parity", "node", [
    "scripts/verify-headless-scene-parity.mjs",
    ...subGateArgs
  ]),
  runSuite("verify-tls-3d-production", "node", [
    "scripts/verify-tls-3d-production.mjs",
    ...subGateArgs
  ])
];

const headlessCapturePassed = suites[0]?.passed ?? false;
const sceneParityPassed = suites[1]?.passed ?? false;
const tls3dProductionPassed = suites[2]?.passed ?? false;
const gatePassed = suites.every((suite) => suite.passed);

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  backendPolicy: {
    ci: "trace-hash",
    localDefault: "r3f-headless",
    documentedLocal3dCommand: DOCUMENTED_LOCAL_3D_COMMAND
  },
  blockingCriteria: {
    headlessCapturePassed,
    sceneParityPassed,
    tls3dProductionPassed
  },
  suites: suites.map(({ label, passed }) => ({ label, passed }))
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("3D render verification gate: FAIL");
  for (const suite of suites.filter((entry) => !entry.passed)) {
    console.error(`  ${suite.label} failed (exit ${suite.exitCode})`);
  }
  process.exit(1);
}

console.log("3D render verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
