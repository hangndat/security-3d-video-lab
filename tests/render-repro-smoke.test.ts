import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, it } from "vitest";
import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { buildDeterministicTraceInputs } from "../src/render/remotion/render-composition.js";

import {
  assertReproducibleRuns,
  buildDeterministicManifest,
  buildOutputFingerprintInputFromTraceInputs,
  computeOutputFingerprint
} from "../src/render/export/fingerprint.js";

describe("render reproducibility smoke gate", () => {
  it("emits equal deterministic manifests for identical runs", () => {
    const traceInputs = buildDeterministicTraceInputs(goldenSceneSpec, [0, 5, 10, 15, 20, 25]);
    const fingerprintInput = buildOutputFingerprintInputFromTraceInputs(traceInputs, {
      codec: "h264",
      container: "mp4",
      durationMs: 1000
    });
    const runInput = {
      sceneId: "tls-canonical",
      specHash: "spec-123",
      seed: "seed-001",
      frameHashes: fingerprintInput.frameHashes,
      normalizedMetadata: fingerprintInput.normalizedMetadata,
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
    const traceInputs = buildDeterministicTraceInputs(goldenSceneSpec, [0, 10, 20]);
    const baseInput = buildOutputFingerprintInputFromTraceInputs(traceInputs, {
      codec: "h264",
      container: "mp4",
      durationMs: 8400
    });
    const fingerprint = computeOutputFingerprint({
      frameHashes: baseInput.frameHashes,
      normalizedMetadata: baseInput.normalizedMetadata
    });

    const changedTraceInputs = buildDeterministicTraceInputs(goldenSceneSpec, [0, 10, 21]);
    const changedInput = buildOutputFingerprintInputFromTraceInputs(changedTraceInputs, {
      codec: "h264",
      container: "mp4",
      durationMs: 8450
    });
    const changed = computeOutputFingerprint({
      frameHashes: changedInput.frameHashes,
      normalizedMetadata: changedInput.normalizedMetadata
    });

    expect(fingerprint.value).not.toEqual(changed.value);
    expect(fingerprint.inputs.frameHashes).toEqual(baseInput.frameHashes);
  });

  it("fails on mismatch and writes diff bundle paths", () => {
    const diffDir = mkdtempSync(join(tmpdir(), "repro-diff-"));
    try {
      const first = buildDeterministicManifest({
        sceneId: "dns-canonical",
        specHash: "spec-dns",
        seed: "seed-dns",
        frameHashes: buildOutputFingerprintInputFromTraceInputs(
          buildDeterministicTraceInputs(goldenSceneSpec, [0, 4]),
          { codec: "h264", container: "mp4", durationMs: 6000 }
        ).frameHashes,
        normalizedMetadata: { codec: "h264", container: "mp4", durationMs: 6000 },
        provenance: { node: "25.6.0", remotion: "4.0.468", ffmpeg: "8.1" }
      });
      const second = buildDeterministicManifest({
        sceneId: "dns-canonical",
        specHash: "spec-dns",
        seed: "seed-dns",
        frameHashes: buildOutputFingerprintInputFromTraceInputs(
          buildDeterministicTraceInputs(goldenSceneSpec, [0, 5]),
          { codec: "h264", container: "mp4", durationMs: 6000 }
        ).frameHashes,
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
