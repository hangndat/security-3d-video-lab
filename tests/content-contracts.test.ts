import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { validateTopicContracts } from "../src/content/contracts/validate-topic-contracts.js";

const TEST_TOPICS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/content/topics"
);

function loadFixtureContracts() {
  return loadTopicContracts(TEST_TOPICS_ROOT);
}

function loadFixtureManifest() {
  return loadTopicManifest(TEST_TOPICS_ROOT);
}

describe("content contracts schema and preset validation", () => {
  it("schema rejects non-literal schemaVersion and invalid slug format", () => {
    const contracts = loadFixtureContracts();
    contracts[0]!.contract.schemaVersion = "2.0.0" as "1.0.0";
    contracts[0]!.contract.slug = "tls-v1";

    const result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.errors.some((item) => item.reason.includes("must be equal to constant"))).toBe(true);
    expect(result.errors.some((item) => item.reason.includes("must match pattern"))).toBe(true);
  });

  it("schema rejects beat arrays with invalid frame windows", () => {
    const contracts = loadFixtureContracts();
    contracts[1]!.contract.storyboardBeats[0]!.endFrame = contracts[1]!.contract.storyboardBeats[0]!.startFrame;

    const result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.errors.some((item) => item.reason.includes("greater than startFrame"))).toBe(true);
  });

  it("preset validator rejects unknown transition IDs", () => {
    const contracts = loadFixtureContracts();
    contracts[0]!.contract.transitionToNext!.presetId = "made-up-preset";

    const result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.errors.some((item) => item.reason.includes("Unknown transition preset"))).toBe(true);
  });
});

describe("content contracts collect-all validation", () => {
  it("collect-all returns schema/order/placeholder failures in one pass", () => {
    const contracts = loadFixtureContracts();
    contracts[0]!.contract.schemaVersion = "0.9.0" as "1.0.0";
    contracts[0]!.contract.topic = "ssh";
    contracts[2]!.contract.narrationPlaceholders = [];

    const result = validateTopicContracts(contracts, loadFixtureManifest().order);

    expect(result.errors.length).toBeGreaterThanOrEqual(3);
    expect(result.errors.some((item) => item.reason.includes("must be equal to constant"))).toBe(true);
    expect(result.errors.some((item) => item.reason.includes("Topic order mismatch"))).toBe(true);
    expect(result.errors.some((item) => item.reason.includes("Missing narration placeholder"))).toBe(true);
  });

  it("duration drift over 10% warns while hard drift fails", () => {
    const contracts = loadFixtureContracts();
    contracts[0]!.contract.durationBudget.targetSeconds = 12;
    contracts[0]!.contract.durationBudget.minSeconds = 7;
    contracts[0]!.contract.durationBudget.maxSeconds = 9;

    let result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.warnings.some((item) => item.reason.includes("drifts more than 10%"))).toBe(true);
    expect(result.errors.some((item) => item.reason.includes("falls outside hard range"))).toBe(false);

    contracts[0]!.contract.durationBudget.maxSeconds = 6;
    result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.errors.some((item) => item.reason.includes("falls outside hard range"))).toBe(true);
  });

  it("ordering mismatch against manifest lock fails without reordering", () => {
    const contracts = loadFixtureContracts();
    const swapped = [contracts[1]!, contracts[0]!, contracts[2]!];

    const result = validateTopicContracts(swapped, loadFixtureManifest().order);
    expect(result.errors.some((item) => item.reason.includes("Topic order mismatch"))).toBe(true);
  });

  it("valid contracts return zero blocking errors", () => {
    const contracts = loadFixtureContracts();
    const result = validateTopicContracts(contracts, loadFixtureManifest().order);
    expect(result.errors).toEqual([]);
  });
});

describe("validateTopicContracts manifest root alignment", () => {
  it("uses manifest from the same topics root as loaded contracts", () => {
    const contracts = loadFixtureContracts();
    const manifest = loadFixtureManifest();
    const result = validateTopicContracts(contracts, undefined, TEST_TOPICS_ROOT);
    expect(result.errors).toEqual([]);
    expect(manifest.order).toEqual(contracts.map((entry) => entry.contract.topic));
  });
});

describe("loader coverage", () => {
  it("loads topic contracts from topic folders", () => {
    const contracts = loadTopicContracts(TEST_TOPICS_ROOT);
    expect(contracts.map((entry) => entry.contract.topic)).toEqual(loadFixtureManifest().order);
    expect(contracts.every((entry) => readFileSync(entry.contractPath, "utf-8").includes("\"schemaVersion\""))).toBe(
      true
    );
  });
});
