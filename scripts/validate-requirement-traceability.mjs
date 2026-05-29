#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateRequirementTraceability } from "../src/verification/requirement-traceability.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_OUT = resolve(
  REPO_ROOT,
  ".artifacts/verification/phase08/requirement-traceability.json"
);

const milestoneClose = process.argv.includes("--milestone-close");

function main() {
  const result = validateRequirementTraceability({ milestoneClose });
  const gateStatus = result.errors.length === 0 ? "pass" : "fail";

  const report = {
    phase: "08-governance-milestone-hardening",
    generatedAt: new Date().toISOString(),
    gateStatus,
    milestoneClose,
    unmappedCount: result.unmappedCount,
    pendingCount: result.pendingCount,
    errors: result.errors,
    warnings: result.warnings,
    rows: result.rows
  };

  mkdirSync(dirname(JSON_OUT), { recursive: true });
  writeFileSync(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  process.stdout.write(`Wrote ${JSON_OUT}\n`);
  process.stdout.write(`Traceability gate: ${gateStatus.toUpperCase()}\n`);

  if (gateStatus !== "pass") {
    for (const issue of result.errors) {
      process.stderr.write(`${issue.path}: ${issue.reason}\n`);
    }
    process.exit(1);
  }
}

main();
