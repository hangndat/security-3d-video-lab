import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import tlsProductionSceneSpec from "../src/fixtures/tls-production-scene-spec.json";
import { validateSceneSpec } from "../src/engine/contracts/validate-scene-spec.js";
import {
  buildVizRenderTraceInput,
  deriveRenderFrameState,
  renderCompositionProductionMp4
} from "../src/render/remotion/render-composition.js";
import {
  assertExportQuality,
  productionPolicyForScene,
  PRODUCTION_EXPORT_QUALITY_POLICY
} from "../src/verification/export-quality.js";
import { generateTlsProductionArtifacts } from "../src/render/export/generate-tls-production-artifacts.js";
import {
  assertTlsProductionRubric,
  buildTlsProductionCaptionMap,
  TLS_BEAT_MODULE_EXPECTATIONS
} from "../src/verification/tls-production-rubric.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TLS_CONTRACT_BEAT_IDS = [
  "tls-hook",
  "tls-client-hello-beat",
  "tls-server-hello-beat",
  "tls-finished-beat",
  "tls-app-data-beat"
];
const PRODUCTION_EXPORT_ROOT = resolve(REPO_ROOT, ".artifacts/export/phase19");
const PRODUCTION_MP4 = resolve(PRODUCTION_EXPORT_ROOT, "tls-production-scene.mp4");

describe("PROD-01 production scene fixture", () => {
  it("tls-production-scene-spec passes validateSceneSpec", () => {
    const result = validateSceneSpec(tlsProductionSceneSpec);
    expect(result.ok).toBe(true);
  });

  it("beat coverage includes all five TLS contract beat ids in timeline cues", () => {
    const cueIds = tlsProductionSceneSpec.timeline.map((cue) => cue.id).join(" ");
    for (const beatId of TLS_CONTRACT_BEAT_IDS) {
      expect(cueIds).toContain(beatId);
    }
  });
});

describe("PROD-01 production scene viz trace", () => {
  it("vizRenderTraceInput is deterministic on production fixture frames 0, 75, 200", () => {
    const captionMap = buildTlsProductionCaptionMap();
    for (const frame of [0, 75, 200]) {
      const first = buildVizRenderTraceInput(tlsProductionSceneSpec, frame, captionMap);
      const second = buildVizRenderTraceInput(tlsProductionSceneSpec, frame, captionMap);
      expect(first).toEqual(second);
    }
  });

  it("vizRenderTraceInput differs from timelineTraceInput when viz modules enrich compose plan", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const state = deriveRenderFrameState(tlsProductionSceneSpec, 75, { captionMap });
    expect(state.vizRenderTraceInput).not.toEqual(state.timelineTraceInput);
    expect(state.vizRenderTraceInput).toContain("viz-cert-single");
  });

  it("deriveRenderFrameState on golden fixture preserves stable timelineTraceInput", () => {
    const state = deriveRenderFrameState(goldenSceneSpec, 42);
    expect(state.timelineTraceInput).toBe("golden-seed-001:42:tls-main-handshake");
  });
});

describe("PROD-01 production render", () => {
  it("renderCompositionProductionMp4 writes non-empty MP4 for production fixture", () => {
    const captionMap = buildTlsProductionCaptionMap();
    renderCompositionProductionMp4(tlsProductionSceneSpec, PRODUCTION_MP4, { captionMap });
    expect(statSync(PRODUCTION_MP4).size).toBeGreaterThan(0);
  });
});

describe("PROD-01 rubric and security", () => {
  it("assertTlsProductionRubric passes on production fixture and TLS caption map", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const { signoff } = assertTlsProductionRubric(tlsProductionSceneSpec, captionMap);
    expect(signoff.beatsPassed).toBe(TLS_BEAT_MODULE_EXPECTATIONS.length);
    expect(signoff.narrationAlignmentValid).toBe(true);
    expect(signoff.approvedForProduction).toBe(true);
  });

  it("productionPolicyForScene exceeds short export-gate duration window", () => {
    const policy = productionPolicyForScene(tlsProductionSceneSpec);
    expect(policy.minDurationSeconds).toBeGreaterThan(PRODUCTION_EXPORT_QUALITY_POLICY.minDurationSeconds);
    expect(policy.maxDurationSeconds).toBeGreaterThan(1.2);
  });
});

describe("PROD-01 publish-ready TLS", () => {
  it("renderCompositionProductionMp4 passes production export quality policy", () => {
    const captionMap = buildTlsProductionCaptionMap();
    renderCompositionProductionMp4(tlsProductionSceneSpec, PRODUCTION_MP4, { captionMap });
    const policy = productionPolicyForScene(tlsProductionSceneSpec);
    assertExportQuality(PRODUCTION_MP4, "tls-production-scene.mp4", policy);
  });

  it("generateTlsProductionArtifacts writes expected crew pipeline file set", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT);
    const expectedFiles = [
      "tls-production.mp4",
      "production-manifest.json",
      "security-signoff.json",
      "caption-timing-map.json",
      "narration-track.json",
      "beat-sheet.md",
      "render-handoff.md",
      "audio-layer-handoff.md",
      "tls-production-scene-spec.json"
    ];

    for (const fileName of expectedFiles) {
      expect(existsSync(resolve(result.artifactRoot, fileName)), fileName).toBe(true);
    }
  });

  it("generateTlsProductionArtifacts writes narration-track.json with stub provider when key unset", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {});
    const track = JSON.parse(readFileSync(result.narrationTrackPath, "utf-8")) as {
      providerId: string;
      segments: Array<{ audioArtifactPath: string }>;
    };
    expect(track.providerId).toBe("deterministic-stub");
    expect(track.segments.length).toBeGreaterThan(0);
    for (const segment of track.segments) {
      expect(existsSync(resolve(REPO_ROOT, segment.audioArtifactPath))).toBe(true);
    }
  });

  it("security-signoff.json includes narration provider and alignment fields", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {});
    const signoff = JSON.parse(readFileSync(result.securitySignoffPath, "utf-8")) as {
      narrationProviderId: string;
      narrationAlignmentValid: boolean;
    };
    expect(signoff.narrationProviderId).toBe("deterministic-stub");
    expect(signoff.narrationAlignmentValid).toBe(true);
  });

  it("security-signoff.json lists five beats all passed", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT);
    const signoff = JSON.parse(readFileSync(result.securitySignoffPath, "utf-8")) as {
      beats: Array<{ passed: boolean }>;
      beatsPassed: number;
    };
    expect(signoff.beats).toHaveLength(5);
    expect(signoff.beats.every((beat) => beat.passed)).toBe(true);
    expect(signoff.beatsPassed).toBe(5);
  });
});
