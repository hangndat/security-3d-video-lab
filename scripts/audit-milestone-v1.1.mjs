#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildMilestoneAuditReport,
  renderMilestoneAuditMarkdown
} from "../src/verification/milestone-audit.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.1-MILESTONE-AUDIT.md");
const ROADMAP_SNAPSHOT_OUT = resolve(REPO_ROOT, ".planning/milestones/v1.1-ROADMAP.md");
const ROADMAP_SOURCE = resolve(REPO_ROOT, ".planning/ROADMAP.md");

function snapshotRoadmap() {
  if (!existsSync(ROADMAP_SOURCE)) {
    throw new Error("Missing .planning/ROADMAP.md for v1.1 snapshot.");
  }
  mkdirSync(dirname(ROADMAP_SNAPSHOT_OUT), { recursive: true });
  copyFileSync(ROADMAP_SOURCE, ROADMAP_SNAPSHOT_OUT);
}

function main() {
  const report = buildMilestoneAuditReport(REPO_ROOT);
  mkdirSync(dirname(AUDIT_OUT), { recursive: true });
  writeFileSync(AUDIT_OUT, renderMilestoneAuditMarkdown(report), "utf-8");
  snapshotRoadmap();

  process.stdout.write(`Wrote ${AUDIT_OUT}\n`);
  process.stdout.write(`Wrote ${ROADMAP_SNAPSHOT_OUT}\n`);
  process.stdout.write(`Milestone audit verdict: ${report.verdict}\n`);

  if (report.verdict !== "PASS") {
    process.exit(1);
  }
}

main();
