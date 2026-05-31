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
import zeroTrustAccessSceneSpec from "../src/fixtures/zero-trust-access-scene-spec.json";
import oauthJwtSessionSceneSpec from "../src/fixtures/oauth-jwt-session-scene-spec.json";
import apiGatewayWafSceneSpec from "../src/fixtures/api-gateway-waf-scene-spec.json";
import {
  generateCaptionTimingMap,
  type CaptionTimingMap
} from "../src/content/composition/generate-caption-timing-map.js";
import narrationSchema from "../src/content/narration/narration-track.schema.json";
import {
  generateNarrationTrack,
  type NarrationTrackManifest
} from "../src/content/narration/generate-narration-track.js";
import {
  createDeterministicStubProvider,
  synthesizeStubSegmentBytes
} from "../src/content/narration/providers/deterministic-stub-provider.js";
import {
  NARRATION_DURATION_TOLERANCE_MS,
  validateNarrationAlignment
} from "../src/content/narration/validate-narration-alignment.js";
import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CANONICAL_SCENES = {
  tls: goldenSceneSpec,
  ssh: sshSceneSpec,
  dns: dnsSceneSpec
};

const BRANCHED_SCENES = {
  tls: goldenSceneSpec,
  ssh: sshSceneSpec,
  dns: dnsSceneSpec,
  "auth-session": authSessionSceneSpec,
  "pki-trust-chain": pkiTrustChainSceneSpec,
  "mitm-defense": mitmDefenseSceneSpec,
  "zero-trust-access": zeroTrustAccessSceneSpec,
  "oauth-jwt-session": oauthJwtSessionSceneSpec,
  "api-gateway-waf": apiGatewayWafSceneSpec
};

function countBeatsForTopics(topics: string[]): number {
  const contracts = loadTopicContracts();
  return contracts
    .filter((entry) => topics.includes(entry.contract.topic))
    .reduce((sum, entry) => sum + entry.contract.storyboardBeats.length, 0);
}

function validateNarrationTrack(track: NarrationTrackManifest): boolean {
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(narrationSchema)(track) === true;
}

describe("narration track generation", () => {
  it("generateNarrationTrack from canonical caption map produces one segment per beat", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);

    expect(track.segments).toHaveLength(captionMap.entries.length);
    expect(track.segments).toHaveLength(countBeatsForTopics(["tls", "ssh", "dns"]));
    expect(validateNarrationTrack(track)).toBe(true);
  });

  it("segment targetDurationSeconds equals caption endSeconds - startSeconds", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);

    for (let index = 0; index < captionMap.entries.length; index += 1) {
      const entry = captionMap.entries[index]!;
      const segment = track.segments[index]!;
      const expected = Number((entry.endSeconds - entry.startSeconds).toFixed(3));
      expect(segment.targetDurationSeconds).toBe(expected);
    }
  });

  it("two runs produce identical contentHash values for all segments", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const first = generateNarrationTrack(captionMap);
    const second = generateNarrationTrack(captionMap);

    expect(second.segments.map((segment) => segment.contentHash)).toEqual(
      first.segments.map((segment) => segment.contentHash)
    );
  });

  it("stub WAV bytes are deterministic for same analyticKey and duration", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const entry = captionMap.entries[0]!;
    const duration = Number((entry.endSeconds - entry.startSeconds).toFixed(3));
    const first = synthesizeStubSegmentBytes(entry, duration);
    const second = synthesizeStubSegmentBytes(entry, duration);
    expect(second.equals(first)).toBe(true);
  });
});

describe("narration alignment validation", () => {
  it("validateNarrationAlignment passes for stub-generated canonical track", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    const result = validateNarrationAlignment(captionMap, track);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("validator fails when segment count != caption entry count", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    const invalid = { ...track, segments: track.segments.slice(0, 1) };
    const result = validateNarrationAlignment(captionMap, invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Segment count mismatch"))).toBe(true);
  });

  it("validator fails when actualDuration exceeds 50ms tolerance", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    const invalid = {
      ...track,
      segments: track.segments.map((segment, index) =>
        index === 0
          ? { ...segment, actualDurationSeconds: segment.targetDurationSeconds + 0.2 }
          : segment
      )
    };
    const result = validateNarrationAlignment(captionMap, invalid, NARRATION_DURATION_TOLERANCE_MS);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Duration tolerance exceeded"))).toBe(true);
  });

  it("validator fails when beatId/analyticKey mismatch between caption and narration", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    const invalid = {
      ...track,
      segments: track.segments.map((segment, index) =>
        index === 0 ? { ...segment, beatId: "wrong-beat-id" } : segment
      )
    };
    const result = validateNarrationAlignment(captionMap, invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Beat id mismatch"))).toBe(true);
  });
});

describe("caption timing map branch support for narration", () => {
  it("generateCaptionTimingMap with branchId uses branch sequence beat count", () => {
    const attack = generateCaptionTimingMap("content-depth-branched-v1", BRANCHED_SCENES, {
      branchId: "attack-path"
    });
    expect(attack.branchId).toBe("attack-path");
    expect(attack.entries).toHaveLength(
      countBeatsForTopics([
        "tls",
        "ssh",
        "dns",
        "auth-session",
        "mitm-defense",
        "oauth-jwt-session",
        "api-gateway-waf"
      ])
    );
  });

  it("defense-path caption map differs from attack-path entry count", () => {
    const attack = generateCaptionTimingMap("content-depth-branched-v1", BRANCHED_SCENES, {
      branchId: "attack-path"
    });
    const defense = generateCaptionTimingMap("content-depth-branched-v1", BRANCHED_SCENES, {
      branchId: "defense-path"
    });
    expect(defense.entries.length).toBeGreaterThan(attack.entries.length);
    expect(defense.branchId).toBe("defense-path");
  });

  it("narration track schema validates minimal valid manifest", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    expect(validateNarrationTrack(track)).toBe(true);
  });

  it("schema rejects segment missing contentHash or actualDurationSeconds", () => {
    const captionMap = generateCaptionTimingMap("network-foundations-long-v1", CANONICAL_SCENES);
    const track = generateNarrationTrack(captionMap);
    const invalid = {
      ...track,
      segments: track.segments.map((segment, index) =>
        index === 0 ? { ...segment, contentHash: "" } : segment
      )
    };
    expect(validateNarrationTrack(invalid as NarrationTrackManifest)).toBe(false);
  });
});
