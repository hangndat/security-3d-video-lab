#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase21/headless-capture.json");

const quickMode = process.argv.includes("--quick");
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

const suites = [
  runSuite("headless-capture resolver tests", "npm", [
    "run",
    "test",
    "--",
    "tests/headless-capture.test.ts",
    "--testNamePattern=resolveProductionRenderBackend"
  ]),
  runSuite("render-composition trace-hash smoke", "npm", [
    "run",
    "test",
    "--",
    "tests/render-composition.test.ts",
    "--testNamePattern=trace-hash"
  ])
];

if (!quickMode) {
  suites.push(
    runSuite("render-composition full", "npm", [
      "run",
      "test",
      "--",
      "tests/render-composition.test.ts"
    ]),
    runSuite("headless-capture full", "npm", ["run", "test", "--", "tests/headless-capture.test.ts"])
  );
}

const resolverTestsPassed = suites[0]?.passed ?? false;
const renderCompositionTestsPassed = suites[1]?.passed ?? false;
const gatePassed = suites.every((suite) => suite.passed);

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  backendPolicy: {
    ci: "trace-hash",
    localDefault: "r3f-headless"
  },
  blockingCriteria: {
    resolverTestsPassed,
    renderCompositionTestsPassed
  },
  suites
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("Headless capture verification gate: FAIL");
  process.exit(1);
}

console.log("Headless capture verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
