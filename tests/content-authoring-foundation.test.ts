import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { validateTopicContracts } from "../src/content/contracts/validate-topic-contracts.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_ROOT = resolve(REPO_ROOT, "src/content/topics");
const SCAFFOLD_SCRIPT = resolve(REPO_ROOT, "scripts/scaffold-topic-contract.mjs");
const VERIFY_SCRIPT = resolve(REPO_ROOT, "scripts/verify-content-authoring.mjs");
const VERIFY_JSON = resolve(
  REPO_ROOT,
  ".artifacts/verification/phase05/content-authoring-foundation.json"
);
const VERIFY_MARKDOWN = resolve(
  REPO_ROOT,
  ".planning/phases/05-content-authoring-foundation/VERIFICATION.md"
);

function runScaffold(args: string[], cwd: string = REPO_ROOT) {
  return spawnSync("node", [SCAFFOLD_SCRIPT, ...args], {
    cwd,
    encoding: "utf-8"
  });
}

describe("scaffold CLI and manifest-locked drafts", () => {
  it("scaffold command creates topic folder + contract template + beat stubs", () => {
    const tempRoot = mkdtempSync(resolve(TOPICS_ROOT, "scaffold-"));
    try {
      const result = runScaffold([
        "--topic",
        "auth-session",
        "--major",
        "1",
        "--topics-root",
        tempRoot
      ]);
      expect(result.status).toBe(0);

      const contractPath = resolve(tempRoot, "auth-session", "contract.json");
      const contract = JSON.parse(readFileSync(contractPath, "utf-8")) as {
        topic: string;
        storyboardBeats: Array<{ id: string }>;
        narrationPlaceholders: Array<{ beatId: string }>;
      };

      expect(contract.topic).toBe("auth-session");
      expect(contract.storyboardBeats.length).toBeGreaterThanOrEqual(3);
      expect(contract.narrationPlaceholders).toHaveLength(contract.storyboardBeats.length);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects --topics-root outside the repository topics directory", () => {
    const tempRoot = mkdtempSync(resolve(tmpdir(), "topic-scaffold-"));
    try {
      const result = runScaffold([
        "--topic",
        "escape-topic",
        "--major",
        "1",
        "--topics-root",
        tempRoot
      ]);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/must stay within the repository topics directory/);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("requires --force before overwriting an existing contract", () => {
    const tempRoot = mkdtempSync(resolve(TOPICS_ROOT, "scaffold-"));
    try {
      const first = runScaffold([
        "--topic",
        "mitm-defense",
        "--major",
        "1",
        "--topics-root",
        tempRoot
      ]);
      expect(first.status).toBe(0);

      const second = runScaffold([
        "--topic",
        "mitm-defense",
        "--major",
        "2",
        "--topics-root",
        tempRoot
      ]);
      expect(second.status).not.toBe(0);
      expect(second.stderr).toMatch(/--force to overwrite/);

      const forced = runScaffold([
        "--topic",
        "mitm-defense",
        "--major",
        "2",
        "--topics-root",
        tempRoot,
        "--force"
      ]);
      expect(forced.status).toBe(0);

      const contract = JSON.parse(
        readFileSync(resolve(tempRoot, "mitm-defense", "contract.json"), "utf-8")
      ) as { slug: string };
      expect(contract.slug).toBe("mitm-defense-short-v2");
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("generated slug follows <topic>-short-v<major> naming", () => {
    const tempRoot = mkdtempSync(resolve(TOPICS_ROOT, "scaffold-"));
    try {
      const result = runScaffold([
        "--topic",
        "pki-trust-chain",
        "--major",
        "2",
        "--topics-root",
        tempRoot
      ]);
      expect(result.status).toBe(0);

      const contract = JSON.parse(
        readFileSync(resolve(tempRoot, "pki-trust-chain", "contract.json"), "utf-8")
      ) as { slug: string };
      expect(contract.slug).toBe("pki-trust-chain-short-v2");
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("manifest lock rejects reordering not present in manifest file", () => {
    const manifest = loadTopicManifest(TOPICS_ROOT);
    const contracts = loadTopicContracts(TOPICS_ROOT);
    const reordered = [contracts[1]!, contracts[0]!, ...contracts.slice(2)];

    const result = validateTopicContracts(reordered, manifest.order);
    expect(result.errors.some((item) => item.reason.includes("Topic order mismatch"))).toBe(true);
  });

  it("three new module drafts validate without blocking errors", () => {
    const manifest = loadTopicManifest(TOPICS_ROOT);
    const contracts = loadTopicContracts(TOPICS_ROOT);
    const draftIds = ["auth-session", "pki-trust-chain", "mitm-defense"];

    expect(manifest.order.filter((topic) => draftIds.includes(topic))).toEqual(draftIds);

    const result = validateTopicContracts(contracts, manifest.order);
    expect(result.errors).toEqual([]);

    for (const draftId of draftIds) {
      const draft = contracts.find((entry) => entry.contract.topic === draftId);
      expect(draft).toBeDefined();
      expect(draft!.contract.slug).toMatch(new RegExp(`^${draftId}-short-v\\d+$`));
    }
  });
});

describe("blocking validation gate and PR policy", () => {
  it("contract suite fails when any blocking validation error exists", () => {
    const manifest = loadTopicManifest(TOPICS_ROOT);
    const contracts = loadTopicContracts(TOPICS_ROOT);
    contracts[0]!.contract.schemaVersion = "0.9.0" as "1.0.0";

    const result = validateTopicContracts(contracts, manifest.order);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("warning-only validation does not add blocking errors", () => {
    const manifest = loadTopicManifest(TOPICS_ROOT);
    const contracts = loadTopicContracts(TOPICS_ROOT);
    contracts[0]!.contract.durationBudget.targetSeconds = 12;

    const result = validateTopicContracts(contracts, manifest.order);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.errors.some((item) => item.reason.includes("drifts more than 10%"))).toBe(false);
  });

  it("CI PR workflow runs full validation every time", () => {
    const ci = readFileSync(resolve(REPO_ROOT, ".github/workflows/ci.yml"), "utf-8");
    expect(ci).toMatch(/pull_request/);
    expect(ci).toMatch(/content-authoring-foundation\.test\.ts/);
    expect(ci).toMatch(/content-contracts\.test\.ts/);
    expect(ci).toMatch(/test:e2e:all/);
    expect(ci).not.toMatch(/continue-on-error:\s*true/);
  });

  it("E2E smoke remains part of required pass criteria", () => {
    const ci = readFileSync(resolve(REPO_ROOT, ".github/workflows/ci.yml"), "utf-8");
    expect(ci).toMatch(/e2e-canonical-flows\.test\.ts/);
    expect(ci).toMatch(/Run canonical E2E smoke gate/);
  });

  it("repository authoring gate passes with zero blocking errors", () => {
    const manifest = loadTopicManifest(TOPICS_ROOT);
    const contracts = loadTopicContracts(TOPICS_ROOT);
    const result = validateTopicContracts(contracts, manifest.order);
    expect(result.errors).toEqual([]);
  });
});

describe("dual-format verification evidence", () => {
  it("verification script emits consistent JSON and markdown outcomes", () => {
    const result = spawnSync("node", [VERIFY_SCRIPT, "--quick"], {
      cwd: REPO_ROOT,
      encoding: "utf-8"
    });
    expect(result.status).toBe(0);

    const jsonReport = JSON.parse(readFileSync(VERIFY_JSON, "utf-8")) as {
      gateStatus: string;
      quickMode: boolean;
      warningCount: number;
      blockingCriteria: { e2eSmokePassed: boolean };
      suites: Array<{ label: string; skipped?: boolean; passed: boolean }>;
      modules: Array<{ id: string; draft: boolean }>;
      draftModuleIds: string[];
    };
    const markdown = readFileSync(VERIFY_MARKDOWN, "utf-8");

    expect(jsonReport.gateStatus).toBe("pass");
    expect(jsonReport.quickMode).toBe(true);
    expect(jsonReport.warningCount).toBeGreaterThanOrEqual(0);
    expect(jsonReport.blockingCriteria.e2eSmokePassed).toBe(false);
    expect(jsonReport.draftModuleIds).toEqual(["auth-session", "pki-trust-chain", "mitm-defense"]);
    expect(jsonReport.modules.filter((entry) => entry.draft)).toHaveLength(3);

    const e2eSuite = jsonReport.suites.find((suite) => suite.label === "e2e-canonical-smoke");
    expect(e2eSuite?.skipped).toBe(true);
    expect(e2eSuite?.passed).toBe(false);

    for (const draftId of jsonReport.draftModuleIds) {
      expect(markdown).toContain(draftId);
    }
    expect(markdown).toContain("Gate Status");
    expect(markdown).toContain("| e2e-canonical-smoke |");
    expect(markdown).toContain("| SKIP |");
  });
});
