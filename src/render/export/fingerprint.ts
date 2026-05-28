import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface NormalizedOutputMetadata {
  codec: string;
  container: string;
  durationMs: number;
}

export interface OutputFingerprintInput {
  frameHashes: string[];
  normalizedMetadata: NormalizedOutputMetadata;
}

export interface OutputFingerprint {
  value: string;
  inputs: OutputFingerprintInput;
}

export interface ToolchainProvenance {
  node: string;
  remotion: string;
  ffmpeg: string;
}

export interface DeterministicManifestInput extends OutputFingerprintInput {
  sceneId: string;
  specHash: string;
  seed: string;
  provenance: ToolchainProvenance;
}

export interface DeterministicManifest extends DeterministicManifestInput {
  outputFingerprint: OutputFingerprint;
  provenanceFingerprint: string;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function stableJson(input: unknown): string {
  if (Array.isArray(input)) {
    return `[${input.map((item) => stableJson(item)).join(",")}]`;
  }
  if (input && typeof input === "object") {
    const entries = Object.entries(input).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, value]) => `${JSON.stringify(key)}:${stableJson(value)}`).join(",")}}`;
  }
  return JSON.stringify(input);
}

export function computeOutputFingerprint(input: OutputFingerprintInput): OutputFingerprint {
  const payload = stableJson({
    frameHashes: input.frameHashes,
    metadata: input.normalizedMetadata
  });
  return {
    value: sha256(payload),
    inputs: {
      frameHashes: [...input.frameHashes],
      normalizedMetadata: { ...input.normalizedMetadata }
    }
  };
}

export function buildDeterministicManifest(input: DeterministicManifestInput): DeterministicManifest {
  const outputFingerprint = computeOutputFingerprint({
    frameHashes: input.frameHashes,
    normalizedMetadata: input.normalizedMetadata
  });
  const provenanceFingerprint = sha256(
    stableJson({
      node: input.provenance.node,
      remotion: input.provenance.remotion,
      ffmpeg: input.provenance.ffmpeg
    })
  );

  return {
    ...input,
    outputFingerprint,
    provenanceFingerprint
  };
}

function writeDiffBundle(
  runA: DeterministicManifest,
  runB: DeterministicManifest,
  diffDir: string
): { manifestDiffPath: string; summaryPath: string } {
  mkdirSync(diffDir, { recursive: true });
  const manifestDiffPath = join(diffDir, "manifest-diff.json");
  const summaryPath = join(diffDir, "summary.json");
  writeFileSync(
    manifestDiffPath,
    JSON.stringify(
      {
        runA,
        runB
      },
      null,
      2
    )
  );
  writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        reason: "reproducibility mismatch",
        runA: runA.outputFingerprint.value,
        runB: runB.outputFingerprint.value
      },
      null,
      2
    )
  );
  return { manifestDiffPath, summaryPath };
}

export function assertReproducibleRuns(
  runA: DeterministicManifest,
  runB: DeterministicManifest,
  diffDir: string
): void {
  const runsMatch =
    stableJson({
      sceneId: runA.sceneId,
      specHash: runA.specHash,
      seed: runA.seed,
      provenanceFingerprint: runA.provenanceFingerprint,
      outputFingerprint: runA.outputFingerprint.value
    }) ===
    stableJson({
      sceneId: runB.sceneId,
      specHash: runB.specHash,
      seed: runB.seed,
      provenanceFingerprint: runB.provenanceFingerprint,
      outputFingerprint: runB.outputFingerprint.value
    });

  if (runsMatch) {
    return;
  }

  const diffBundle = writeDiffBundle(runA, runB, diffDir);
  throw new Error(
    `Reproducibility mismatch detected. Diff bundle written to ${diffBundle.manifestDiffPath} and ${diffBundle.summaryPath}.`
  );
}
