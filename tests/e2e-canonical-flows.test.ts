import { mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";
import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import type { SceneSpec } from "../src/engine/contracts/scene-spec.js";
import dnsSceneSpec from "../src/fixtures/dns-scene-spec.json";
import tlsSceneSpec from "../src/fixtures/golden-scene-spec.json";
import sshSceneSpec from "../src/fixtures/ssh-scene-spec.json";
import {
  buildOutputFingerprintInputFromTraceInputs,
  buildDeterministicManifest
} from "../src/render/export/fingerprint.js";
import { buildDeterministicTraceInputs, renderCompositionDemoMp4 } from "../src/render/remotion/render-composition.js";

type ScenarioId = "tls" | "ssh" | "dns";

interface E2eScenario {
  id: ScenarioId;
  scene: SceneSpec;
  expectedPrefix: `${ScenarioId}-canonical`;
}

const SCENARIOS: E2eScenario[] = [
  { id: "tls", scene: tlsSceneSpec, expectedPrefix: "tls-canonical" },
  { id: "ssh", scene: sshSceneSpec, expectedPrefix: "ssh-canonical" },
  { id: "dns", scene: dnsSceneSpec, expectedPrefix: "dns-canonical" }
];

const TRACE_FRAMES = [0, 5, 10, 15, 20, 25];
const EXPECTED_CODEC = "h264";
const EXPECTED_CONTAINER = "mp4";
const MIN_DURATION_SECONDS = 0.9;
const MAX_DURATION_SECONDS = 1.2;
const MIN_DURATION_MS = 900;
const MAX_DURATION_MS = 1200;

function probeExport(videoPath: string): { codec: string; durationMs: number; formatNames: string[] } {
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name:format=format_name,duration",
      "-of",
      "default=noprint_wrappers=1:nokey=0",
      videoPath
    ],
    { encoding: "utf8" }
  );

  if (probe.status !== 0) {
    throw new Error(`ffprobe failed for ${videoPath}: ${probe.stderr || probe.stdout}`);
  }

  const lines = probe.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const codec = lines.find((line) => line.startsWith("codec_name="))?.slice("codec_name=".length);
  const format = lines.find((line) => line.startsWith("format_name="))?.slice("format_name=".length);
  const durationValue = lines.find((line) => line.startsWith("duration="))?.slice("duration=".length);
  const durationSeconds = Number(durationValue);

  if (!codec || !format || Number.isNaN(durationSeconds)) {
    throw new Error(`ffprobe returned incomplete metadata for ${videoPath}: ${probe.stdout}`);
  }

  return {
    codec,
    formatNames: format.split(",").map((entry) => entry.trim()),
    durationMs: Math.round(durationSeconds * 1000)
  };
}

function buildTimelineHash(scene: SceneSpec): string {
  const traceInputs = buildDeterministicTraceInputs(scene, TRACE_FRAMES);
  const digest = createHash("sha256");
  for (const traceInput of traceInputs) {
    digest.update(traceInput);
  }
  return digest.digest("hex");
}

function assertNamingConvention(scenario: E2eScenario, outputPath: string): void {
  const name = basename(outputPath);
  expect(name).toBe(`${scenario.expectedPrefix}-e2e.mp4`);
}

function assertArtifact(scenario: E2eScenario): { outputPath: string; durationMs: number } {
  const outputPath = `artifacts/e2e/${scenario.id}/${scenario.expectedPrefix}-e2e.mp4`;
  mkdirSync(`artifacts/e2e/${scenario.id}`, { recursive: true });
  renderCompositionDemoMp4(scenario.scene, outputPath);

  const fileStats = statSync(outputPath);
  expect(fileStats.size).toBeGreaterThan(0);

  assertNamingConvention(scenario, outputPath);

  const metadata = probeExport(outputPath);
  expect(metadata.codec).toBe(EXPECTED_CODEC);
  expect(metadata.formatNames).toContain(EXPECTED_CONTAINER);
  expect(metadata.durationMs / 1000).toBeGreaterThanOrEqual(MIN_DURATION_SECONDS);
  expect(metadata.durationMs / 1000).toBeLessThanOrEqual(MAX_DURATION_SECONDS);

  return { outputPath, durationMs: metadata.durationMs };
}

function assertDeterministicReplay(scenario: E2eScenario, durationMs: number): void {
  const firstTraceInputs = buildDeterministicTraceInputs(scenario.scene, TRACE_FRAMES);
  const secondTraceInputs = buildDeterministicTraceInputs(scenario.scene, TRACE_FRAMES);

  const firstManifest = buildDeterministicManifest({
    sceneId: `${scenario.id}-canonical`,
    specHash: buildTimelineHash(scenario.scene),
    seed: scenario.scene.seed,
    ...buildOutputFingerprintInputFromTraceInputs(firstTraceInputs, {
      codec: EXPECTED_CODEC,
      container: EXPECTED_CONTAINER,
      durationMs
    }),
    provenance: {
      node: process.version,
      remotion: "4.0.468",
      ffmpeg: "8.1"
    }
  });

  const secondManifest = buildDeterministicManifest({
    sceneId: `${scenario.id}-canonical`,
    specHash: buildTimelineHash(scenario.scene),
    seed: scenario.scene.seed,
    ...buildOutputFingerprintInputFromTraceInputs(secondTraceInputs, {
      codec: EXPECTED_CODEC,
      container: EXPECTED_CONTAINER,
      durationMs
    }),
    provenance: {
      node: process.version,
      remotion: "4.0.468",
      ffmpeg: "8.1"
    }
  });

  expect(firstManifest.outputFingerprint.value).toBe(secondManifest.outputFingerprint.value);
  expect(firstManifest.frameHashes).toEqual(secondManifest.frameHashes);
  expect(firstManifest.seed).toBe(secondManifest.seed);
  expect(firstManifest.specHash).toBe(secondManifest.specHash);
}

describe("canonical e2e scenarios", () => {
  it("TLS canonical flow runs export and deterministic replay checks", () => {
    const tls = SCENARIOS.find((scenario) => scenario.id === "tls");
    if (!tls) {
      throw new Error("TLS scenario missing");
    }

    const artifact = assertArtifact(tls);
    assertDeterministicReplay(tls, artifact.durationMs);
  });

  it("SSH canonical flow runs export and deterministic replay checks", () => {
    const ssh = SCENARIOS.find((scenario) => scenario.id === "ssh");
    if (!ssh) {
      throw new Error("SSH scenario missing");
    }

    const artifact = assertArtifact(ssh);
    assertDeterministicReplay(ssh, artifact.durationMs);
  });

  it("DNS canonical flow runs export and deterministic replay checks", () => {
    const dns = SCENARIOS.find((scenario) => scenario.id === "dns");
    if (!dns) {
      throw new Error("DNS scenario missing");
    }

    const artifact = assertArtifact(dns);
    assertDeterministicReplay(dns, artifact.durationMs);
  });
});
