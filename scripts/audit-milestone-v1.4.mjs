#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import {
  buildV14MilestoneAuditReport,
  renderV14MilestoneAuditMarkdown
} from "../src/verification/milestone-audit.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.4-MILESTONE-AUDIT.md");
const ROADMAP_SNAPSHOT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.4-ROADMAP.md");
const ROADMAP_SOURCE = resolve(REPO_ROOT, ".planning/ROADMAP.md");

function snapshotRoadmap() {
  if (!existsSync(ROADMAP_SOURCE)) {
    throw new Error("Missing .planning/ROADMAP.md for v1.4 snapshot.");
  }
  mkdirSync(dirname(ROADMAP_SNAPSHOT_OUT), { recursive: true });
  copyFileSync(ROADMAP_SOURCE, ROADMAP_SNAPSHOT_OUT);
}

function main() {
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

  const report = buildV14MilestoneAuditReport(REPO_ROOT);
  mkdirSync(dirname(AUDIT_OUT), { recursive: true });
  writeFileSync(AUDIT_OUT, renderV14MilestoneAuditMarkdown(report), "utf-8");
  snapshotRoadmap();

  process.stdout.write(`Wrote ${AUDIT_OUT}\n`);
  process.stdout.write(`Wrote ${ROADMAP_SNAPSHOT_OUT}\n`);
  process.stdout.write(`Milestone audit verdict: ${report.verdict}\n`);

  if (report.verdict !== "PASS") {
    process.exit(1);
  }
}

main();
