#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase20/tts-integration.json");

const quickMode = process.argv.includes("--quick");
const gateEnv = { ...process.env, ELEVENLABS_API_KEY: "" };

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

const providerId = "deterministic-stub";
const stubProviderUsed = !gateEnv.ELEVENLABS_API_KEY?.trim();

const suites = [
  runSuite("tts-provider tests", "npm", [
    "run",
    "test",
    "--",
    "tests/tts-provider.test.ts"
  ]),
  runSuite("tls-production narration tests", "npm", [
    "run",
    "test",
    "--",
    "tests/tls-production-export.test.ts",
    "--testNamePattern=narration"
  ])
];

if (!quickMode) {
  suites.push(
    runSuite("narration-track regression", "npm", [
      "run",
      "test",
      "--",
      "tests/narration-track.test.ts"
    ])
  );
}

const allSuitesPassed = suites.every((suite) => suite.passed);
const gatePassed = allSuitesPassed && stubProviderUsed;

mkdirSync(dirname(JSON_OUT), { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gateStatus: gatePassed ? "pass" : "fail",
  quickMode,
  providerId,
  blockingCriteria: {
    stubProviderUsed,
    ttsTestsPassed: suites[0]?.passed ?? false,
    tlsNarrationTestsPassed: suites[1]?.passed ?? false,
    narrationTrackRegressionPassed: quickMode ? null : suites[2]?.passed ?? null
  },
  suites
};

writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

if (!gatePassed) {
  console.error("TTS integration verification gate: FAIL");
  if (!stubProviderUsed) {
    console.error("Expected deterministic-stub provider when ELEVENLABS_API_KEY is unset.");
  }
  process.exit(1);
}

console.log("TTS integration verification gate: PASS");
console.log(`Evidence: ${JSON_OUT}`);
