import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import { describe, expect, it } from "vitest";

import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import authSessionSceneSpec from "../src/fixtures/auth-session-scene-spec.json";
import pkiTrustChainSceneSpec from "../src/fixtures/pki-trust-chain-scene-spec.json";
import mitmDefenseSceneSpec from "../src/fixtures/mitm-defense-scene-spec.json";
import captionSchema from "../src/content/composition/caption-timing-map.schema.json";
import {
  generateCaptionTimingMap,
  type CaptionTimingMap
} from "../src/content/composition/generate-caption-timing-map.js";
import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import { computeTopicFrameSpan } from "../src/content/composition/frame-offsets.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAPTION_OUT = resolve(REPO_ROOT, ".artifacts/captions/network-foundations-long-v1.json");

function countBeatsForTopics(topics: string[]): number {
  const contracts = loadTopicContracts();
  return contracts
    .filter((entry) => topics.includes(entry.contract.topic))
    .reduce((sum, entry) => sum + entry.contract.storyboardBeats.length, 0);
}

function validateCaptionMap(map: CaptionTimingMap): boolean {
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(captionSchema)(map) === true;
}

describe("caption timing map generation", () => {
  it("canonical assembly caption map includes every tls, ssh, dns beat with monotonic frame ranges", () => {
    const map = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });

    expect(validateCaptionMap(map)).toBe(true);
    expect(map.entries).toHaveLength(countBeatsForTopics(["tls", "ssh", "dns"]));

    for (let index = 1; index < map.entries.length; index += 1) {
      expect(map.entries[index]!.startFrame).toBeGreaterThanOrEqual(map.entries[index - 1]!.startFrame);
    }
  });

  it("stitched offsets match scene-based spans for the second topic", () => {
    const contracts = loadTopicContracts();
    const tlsContract = contracts.find((entry) => entry.contract.topic === "tls")!.contract;
    const tlsSpan = computeTopicFrameSpan(tlsContract, goldenSceneSpec);

    const map = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });

    const firstSshBeat = map.entries.find((entry) => entry.topic === "ssh");
    expect(firstSshBeat).toBeDefined();
    expect(firstSshBeat!.startFrame).toBeGreaterThanOrEqual(tlsSpan);
  });

  it("schema validation rejects entries missing scriptIntent", () => {
    const map = generateCaptionTimingMap("network-foundations-long-v1");
    const invalid = {
      ...map,
      entries: map.entries.map((entry, index) =>
        index === 0 ? { ...entry, scriptIntent: "" } : entry
      )
    };
    expect(validateCaptionMap(invalid as CaptionTimingMap)).toBe(false);
  });

  it("expansion assembly map entry count equals sum of beats across six topics", () => {
    const map = generateCaptionTimingMap("security-expansion-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec,
      "auth-session": authSessionSceneSpec,
      "pki-trust-chain": pkiTrustChainSceneSpec,
      "mitm-defense": mitmDefenseSceneSpec
    });

    expect(map.entries).toHaveLength(
      countBeatsForTopics([
        "tls",
        "ssh",
        "dns",
        "auth-session",
        "pki-trust-chain",
        "mitm-defense"
      ])
    );
  });

  it("writes canonical caption artifact for verification evidence", () => {
    const map = generateCaptionTimingMap("network-foundations-long-v1", {
      tls: goldenSceneSpec,
      ssh: sshSceneSpec,
      dns: dnsSceneSpec
    });
    mkdirSync(dirname(CAPTION_OUT), { recursive: true });
    writeFileSync(CAPTION_OUT, `${JSON.stringify(map, null, 2)}\n`, "utf-8");
    expect(CAPTION_OUT).toContain("network-foundations-long-v1.json");
  });
});
