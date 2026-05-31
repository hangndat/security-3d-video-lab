import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import tlsProductionSceneSpec from "../src/fixtures/tls-production-scene-spec.json";
import { validateSceneSpec } from "../src/engine/contracts/validate-scene-spec.js";
import { captureVizFramePng } from "../src/render/headless/capture-viz-frame-png.js";
import {
  resolveFrameSource,
  resolveProductionRenderBackend
} from "../src/render/headless/resolve-production-render-backend.js";
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
  buildTlsOnlyCaptionMap,
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
const LEGACY_NARRATION_ENV = { SECURITY_LAB_INCLUDE_NARRATION: "true" };
const TRACE_HASH_ENV = { SECURITY_LAB_RENDER_BACKEND: "trace-hash" };
const HEADLESS_RENDER_TIMEOUT_MS = 180_000;

function headlessGlAvailable(): boolean {
  try {
    captureVizFramePng(goldenSceneSpec, 0, { width: 64, height: 36 });
    return true;
  } catch {
    return false;
  }
}

const glAvailable = headlessGlAvailable();

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

  it("each beat uses a dedicated packet id aligned to narrative direction", () => {
    const byCue = Object.fromEntries(
      tlsProductionSceneSpec.timeline.map((cue) => [cue.id, cue.payload.packetId])
    );
    expect(byCue["tls-hook-cue"]).toBe("packet-cleartext-sniff");
    expect(byCue["tls-client-hello-beat-cue"]).toBe("packet-client-hello");
    expect(byCue["tls-server-hello-beat-cue"]).toBe("packet-server-hello");
    expect(byCue["tls-app-data-beat-cue"]).toBe("packet-app-encrypted");
  });
});

describe("PROD-01 production scene viz trace", () => {
  it("vizRenderTraceInput is deterministic on production fixture frames 0, 75, 200", () => {
    const captionMap = buildTlsProductionCaptionMap();
    for (const frame of [0, 270, 525]) {
      const first = buildVizRenderTraceInput(tlsProductionSceneSpec, frame, captionMap);
      const second = buildVizRenderTraceInput(tlsProductionSceneSpec, frame, captionMap);
      expect(first).toEqual(second);
    }
  });

  it("vizRenderTraceInput differs from timelineTraceInput when viz modules enrich compose plan", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const state = deriveRenderFrameState(tlsProductionSceneSpec, 270, { captionMap });
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
    renderCompositionProductionMp4(tlsProductionSceneSpec, PRODUCTION_MP4, {
      captionMap,
      backend: "trace-hash"
    });
    expect(statSync(PRODUCTION_MP4).size).toBeGreaterThan(0);
  });
});

describe("RENDER-03 frameSource", () => {
  it("maps r3f-headless to png", () => {
    expect(resolveFrameSource("r3f-headless")).toBe("png");
  });

  it("maps trace-hash to ppm-trace-hash", () => {
    expect(resolveFrameSource("trace-hash")).toBe("ppm-trace-hash");
  });

  it("resolveProductionRenderBackend honors trace-hash env", () => {
    expect(resolveProductionRenderBackend({ SECURITY_LAB_RENDER_BACKEND: "trace-hash" })).toBe(
      "trace-hash"
    );
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

  it("assertTlsProductionRubric passes in videoOnly mode without narration alignment", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const { signoff } = assertTlsProductionRubric(tlsProductionSceneSpec, captionMap, {
      videoOnly: true
    });
    expect(signoff.beatsPassed).toBe(TLS_BEAT_MODULE_EXPECTATIONS.length);
    expect(signoff.narrationAlignmentValid).toBeNull();
    expect(signoff.approvedForProduction).toBe(true);
  });

  it("productionPolicyForScene exceeds short export-gate duration window", () => {
    const policy = productionPolicyForScene(tlsProductionSceneSpec);
    expect(policy.minDurationSeconds).toBeGreaterThan(PRODUCTION_EXPORT_QUALITY_POLICY.minDurationSeconds);
    expect(policy.maxDurationSeconds).toBeGreaterThan(1.2);
  });
});

describe("RENDER-03 videoOnly manifest", () => {
  it("generateTlsProductionArtifacts writes video-only manifest without narration fields", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      SECURITY_LAB_RENDER_BACKEND: "trace-hash"
    });
    expect(result.manifest.schemaVersion).toBe("1.1.0");
    expect(result.manifest.videoOnly).toBe(true);
    expect(result.manifest.frameSource).toBe("ppm-trace-hash");
    expect(result.manifest.narrationTrackPath).toBeUndefined();
    expect(result.manifest.narrationProviderId).toBeUndefined();
    expect(result.narrationTrackPath).toBeUndefined();
  });

  it("trace-hash env yields frameSource ppm-trace-hash in manifest", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      SECURITY_LAB_RENDER_BACKEND: "trace-hash"
    });
    expect(result.manifest.renderBackend).toBe("trace-hash");
    expect(result.manifest.frameSource).toBe("ppm-trace-hash");
  });
});

describe("PROD-01 publish-ready TLS", () => {
  it("renderCompositionProductionMp4 passes production export quality policy", () => {
    const captionMap = buildTlsProductionCaptionMap();
    renderCompositionProductionMp4(tlsProductionSceneSpec, PRODUCTION_MP4, {
      captionMap,
      backend: "trace-hash"
    });
    const policy = productionPolicyForScene(tlsProductionSceneSpec);
    assertExportQuality(PRODUCTION_MP4, "tls-production-scene.mp4", policy);
  });

  it("generateTlsProductionArtifacts writes expected video-only crew pipeline file set", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      SECURITY_LAB_RENDER_BACKEND: "trace-hash"
    });
    const expectedFiles = [
      "tls-production.mp4",
      "production-manifest.json",
      "security-signoff.json",
      "caption-timing-map.json",
      "beat-sheet.md",
      "render-handoff.md",
      "audio-layer-handoff.md",
      "tls-production-scene-spec.json"
    ];

    for (const fileName of expectedFiles) {
      expect(existsSync(resolve(result.artifactRoot, fileName)), fileName).toBe(true);
    }
    expect(existsSync(resolve(result.artifactRoot, "narration-track.json"))).toBe(false);
  });

  it("security-signoff.json lists five beats all passed on video-only export", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      SECURITY_LAB_RENDER_BACKEND: "trace-hash"
    });
    const signoff = JSON.parse(readFileSync(result.securitySignoffPath, "utf-8")) as {
      beats: Array<{ passed: boolean }>;
      beatsPassed: number;
      narrationAlignmentValid: boolean | null;
    };
    expect(signoff.beats).toHaveLength(5);
    expect(signoff.beats.every((beat) => beat.passed)).toBe(true);
    expect(signoff.beatsPassed).toBe(5);
    expect(signoff.narrationAlignmentValid).toBeNull();
  });
});

describe("PROD-01 legacy narration path", () => {
  it("generateTlsProductionArtifacts writes narration-track.json with stub provider when INCLUDE_NARRATION", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      ...LEGACY_NARRATION_ENV,
      ...TRACE_HASH_ENV
    });
    const track = JSON.parse(readFileSync(result.narrationTrackPath!, "utf-8")) as {
      providerId: string;
      segments: Array<{ audioArtifactPath: string }>;
    };
    expect(result.manifest.videoOnly).toBe(false);
    expect(track.providerId).toBe("deterministic-stub");
    expect(track.segments.length).toBeGreaterThan(0);
    for (const segment of track.segments) {
      expect(existsSync(resolve(REPO_ROOT, segment.audioArtifactPath))).toBe(true);
    }
  });

  it("security-signoff.json includes narration provider and alignment fields with INCLUDE_NARRATION", () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {
      ...LEGACY_NARRATION_ENV,
      ...TRACE_HASH_ENV
    });
    const signoff = JSON.parse(readFileSync(result.securitySignoffPath, "utf-8")) as {
      narrationProviderId: string;
      narrationAlignmentValid: boolean;
    };
    expect(signoff.narrationProviderId).toBe("deterministic-stub");
    expect(signoff.narrationAlignmentValid).toBe(true);
  });
});

describe.skipIf(!glAvailable)("RENDER-03 3D production export", () => {
  it(
    "default env export uses r3f-headless and frameSource png",
    () => {
    const result = generateTlsProductionArtifacts(REPO_ROOT, tlsProductionSceneSpec, {});
    expect(result.manifest.renderBackend).toBe("r3f-headless");
    expect(result.manifest.frameSource).toBe("png");
    expect(result.manifest.videoOnly).toBe(true);
    const policy = productionPolicyForScene(tlsProductionSceneSpec);
    assertExportQuality(result.mp4Path, "tls-production.mp4", policy);
    },
    HEADLESS_RENDER_TIMEOUT_MS
  );
});
