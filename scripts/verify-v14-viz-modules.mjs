#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PHASE17_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase17/viz-modules.json");
const PHASE18_OUT = resolve(REPO_ROOT, ".artifacts/verification/phase18/viz-modules.json");

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
  runSuite("viz-packet-tunnel modules", "npm", [
    "run",
    "test",
    "--",
    "tests/viz-packet-tunnel-modules.test.ts"
  ]),
  runSuite("viz-cert-hud modules", "npm", [
    "run",
    "test",
    "--",
    "tests/viz-cert-hud-modules.test.ts"
  ])
];

const gatePassed = suites.every((suite) => suite.passed);

function writeEvidence(outPath, phase, name, moduleFamilies) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        gateStatus: gatePassed ? "pass" : "fail",
        quickMode,
        phase,
        name,
        moduleFamilies,
        suites
      },
      null,
      2
    )}\n`,
    "utf-8"
  );
}

writeEvidence(PHASE17_OUT, "17", "R3F Packet & Tunnel Modules", ["packet", "tunnel"]);
writeEvidence(PHASE18_OUT, "18", "R3F Certificate & HUD Modules", ["cert", "hud"]);

if (!gatePassed) {
  console.error("v1.4 viz module verification gate: FAIL");
  process.exit(1);
}

console.log("v1.4 viz module verification gate: PASS");
console.log(`Evidence: ${PHASE17_OUT}`);
console.log(`Evidence: ${PHASE18_OUT}`);
