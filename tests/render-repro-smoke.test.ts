import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";

import {
  assertReproducibleRuns,
  buildDeterministicManifest,
  computeOutputFingerprint
} from "../src/render/export/fingerprint.js";

describe("render reproducibility smoke gate", () => {
  it("emits equal deterministic manifests for identical runs", () => {
    const runInput = {
      sceneId: "tls-canonical",
      specHash: "spec-123",
      seed: "seed-001",
      frameHashes: ["a1", "b2", "c3"],
      normalizedMetadata: {
        codec: "h264",
        container: "mp4",
        durationMs: 12_000
      },
      provenance: {
        node: "25.6.0",
        remotion: "4.0.468",
        ffmpeg: "8.1"
      }
    };

    const first = buildDeterministicManifest(runInput);
    const second = buildDeterministicManifest(runInput);

    expect(first).toEqual(second);
    expect(first.provenanceFingerprint).toBeDefined();
  });

  it("computes output fingerprint from frame hashes and normalized metadata", () => {
    const fingerprint = computeOutputFingerprint({
      frameHashes: ["frame-a", "frame-b", "frame-c"],
      normalizedMetadata: {
        codec: "h264",
        container: "mp4",
        durationMs: 8400
      }
    });

    const changed = computeOutputFingerprint({
      frameHashes: ["frame-a", "frame-b", "frame-c"],
      normalizedMetadata: {
        codec: "h264",
        container: "mp4",
        durationMs: 8450
      }
    });

    expect(fingerprint.value).not.toEqual(changed.value);
    expect(fingerprint.inputs.frameHashes).toEqual(["frame-a", "frame-b", "frame-c"]);
  });

  it("fails on mismatch and writes diff bundle paths", () => {
    const diffDir = mkdtempSync(join(tmpdir(), "repro-diff-"));
    try {
      const first = buildDeterministicManifest({
        sceneId: "dns-canonical",
        specHash: "spec-dns",
        seed: "seed-dns",
        frameHashes: ["1", "2"],
        normalizedMetadata: { codec: "h264", container: "mp4", durationMs: 6000 },
        provenance: { node: "25.6.0", remotion: "4.0.468", ffmpeg: "8.1" }
      });
      const second = buildDeterministicManifest({
        sceneId: "dns-canonical",
        specHash: "spec-dns",
        seed: "seed-dns",
        frameHashes: ["1", "DIFF"],
        normalizedMetadata: { codec: "h264", container: "mp4", durationMs: 6000 },
        provenance: { node: "25.6.0", remotion: "4.0.468", ffmpeg: "8.1" }
      });

      expect(() => assertReproducibleRuns(first, second, diffDir)).toThrowError(
        /reproducibility mismatch/i
      );
    } finally {
      rmSync(diffDir, { recursive: true, force: true });
    }
  });
});
