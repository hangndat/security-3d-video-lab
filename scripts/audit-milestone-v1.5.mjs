#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  buildV15MilestoneAuditReport,
  renderV15MilestoneAuditMarkdown
} from "../src/verification/milestone-audit.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.5-MILESTONE-AUDIT.md");
const ROADMAP_SNAPSHOT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.5-ROADMAP.md");
const ROADMAP_SOURCE = resolve(REPO_ROOT, ".planning/ROADMAP.md");

const PHASE_EVIDENCE = [
  ".artifacts/verification/phase21/headless-capture.json",
  ".artifacts/verification/phase22/scene-parity.json",
  ".artifacts/verification/phase23/tls-3d-production.json",
  ".artifacts/verification/phase24/3d-render.json"
];

function snapshotRoadmap() {
  if (!existsSync(ROADMAP_SOURCE)) {
    throw new Error("Missing .planning/ROADMAP.md for v1.5 snapshot.");
  }
  mkdirSync(dirname(ROADMAP_SNAPSHOT_OUT), { recursive: true });
  copyFileSync(ROADMAP_SOURCE, ROADMAP_SNAPSHOT_OUT);
}

function main() {
  const verify3d = spawnSync("node", ["scripts/verify-3d-render.mjs", "--quick"], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    env: { ...process.env, SECURITY_LAB_RENDER_BACKEND: "trace-hash" }
  });
  if ((verify3d.status ?? 1) !== 0) {
    console.error(verify3d.stdout);
    console.error(verify3d.stderr);
    process.exit(1);
  }

  for (const path of PHASE_EVIDENCE) {
    if (!existsSync(resolve(REPO_ROOT, path))) {
      console.error(`Missing phase evidence: ${path}`);
      process.exit(1);
    }
  }

  const traceability = spawnSync(
    "node",
    ["scripts/validate-requirement-traceability.mjs", "--milestone-close"],
    { cwd: REPO_ROOT, encoding: "utf-8" }
  );
  if ((traceability.status ?? 1) !== 0) {
    console.error(traceability.stdout);
    console.error(traceability.stderr);
    process.exit(1);
  }

  const report = buildV15MilestoneAuditReport(REPO_ROOT);
  mkdirSync(dirname(AUDIT_OUT), { recursive: true });
  writeFileSync(AUDIT_OUT, renderV15MilestoneAuditMarkdown(report), "utf-8");
  snapshotRoadmap();

  process.stdout.write(`Wrote ${AUDIT_OUT}\n`);
  process.stdout.write(`Wrote ${ROADMAP_SNAPSHOT_OUT}\n`);
  process.stdout.write(`Milestone audit verdict: ${report.verdict}\n`);

  if (report.verdict !== "PASS") {
    process.exit(1);
  }
}

main();
