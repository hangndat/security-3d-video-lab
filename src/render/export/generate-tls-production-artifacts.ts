import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

import tlsProductionSceneSpec from "../../fixtures/tls-production-scene-spec.json";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import {
  generateNarrationTrack,
  writeNarrationArtifacts
} from "../../content/narration/generate-narration-track.js";
import {
  resolveNarrationProvider,
  type NarrationProviderEnv
} from "../../content/narration/providers/resolve-narration-provider.js";
import {
  renderCompositionProductionMp4
} from "../remotion/render-composition.js";
import {
  resolveFrameSource,
  resolveProductionRenderBackend,
  shouldIncludeNarration,
  type ProductionFrameSource,
  type ProductionRenderBackend
} from "../headless/resolve-production-render-backend.js";
import { productionPolicyForScene } from "../../verification/export-quality.js";
import {
  assertTlsProductionRubric,
  buildTlsOnlyCaptionMap,
  buildTlsSecuritySignoff,
  type TlsSecuritySignoff
} from "../../verification/tls-production-rubric.js";

const TLS_NARRATION_ARTIFACTS_ROOT = ".artifacts/production/tls/narration";
const TLS_NARRATION_TRACK_PATH = ".artifacts/production/tls/narration-track.json";

export type TlsProductionManifest = {
  schemaVersion: "1.1.0";
  sceneId: string;
  sceneSpecPath: string;
  mp4Path: string;
  captionMapPath: string;
  securitySignoffPath: string;
  productionPolicy: ReturnType<typeof productionPolicyForScene>;
  mp4Bytes: number;
  renderBackend: ProductionRenderBackend;
  frameSource: ProductionFrameSource;
  videoOnly: boolean;
  narrationTrackPath?: string;
  narrationProviderId?: string;
  bundleHash: string;
  generatedAt: string;
};

export type GenerateTlsProductionArtifactsResult = {
  artifactRoot: string;
  mp4Path: string;
  manifestPath: string;
  securitySignoffPath: string;
  captionMapPath: string;
  narrationTrackPath?: string;
  manifest: TlsProductionManifest;
  signoff: TlsSecuritySignoff;
};

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function generateTlsProductionArtifacts(
  repoRoot: string,
  sceneSpec: SceneSpec = tlsProductionSceneSpec,
  env: NarrationProviderEnv = process.env
): GenerateTlsProductionArtifactsResult {
  const artifactRoot = resolve(repoRoot, ".artifacts/production/tls");
  mkdirSync(artifactRoot, { recursive: true });

  const includeNarration = shouldIncludeNarration(env);
  const videoOnly = !includeNarration;

  const sceneSpecPath = resolve(repoRoot, "src/fixtures/tls-production-scene-spec.json");
  const mp4Path = resolve(artifactRoot, "tls-production.mp4");
  const manifestPath = resolve(artifactRoot, "production-manifest.json");
  const securitySignoffPath = resolve(artifactRoot, "security-signoff.json");
  const captionMapPath = resolve(artifactRoot, "caption-timing-map.json");
  const narrationTrackPath = resolve(artifactRoot, "narration-track.json");
  const beatSheetPath = resolve(artifactRoot, "beat-sheet.md");
  const renderHandoffPath = resolve(artifactRoot, "render-handoff.md");
  const audioHandoffPath = resolve(artifactRoot, "audio-layer-handoff.md");

  copyFileSync(sceneSpecPath, resolve(artifactRoot, "tls-production-scene-spec.json"));

  const captionMap = buildTlsOnlyCaptionMap(sceneSpec);
  writeFileSync(captionMapPath, `${JSON.stringify(captionMap, null, 2)}\n`, "utf-8");

  let narrationTrack: ReturnType<typeof generateNarrationTrack> | undefined;
  let provider: ReturnType<typeof resolveNarrationProvider> | undefined;

  if (includeNarration) {
    provider = resolveNarrationProvider(env);
    narrationTrack = generateNarrationTrack(captionMap, provider, {
      artifactsRoot: TLS_NARRATION_ARTIFACTS_ROOT
    });
    writeNarrationArtifacts(narrationTrack, captionMap, provider, repoRoot, {
      artifactsRoot: TLS_NARRATION_ARTIFACTS_ROOT,
      manifestRelativePath: TLS_NARRATION_TRACK_PATH
    });
  } else if (existsSync(narrationTrackPath)) {
    unlinkSync(narrationTrackPath);
  }

  const renderBackend = resolveProductionRenderBackend(env);
  const frameSource = resolveFrameSource(renderBackend);
  renderCompositionProductionMp4(sceneSpec, mp4Path, {
    captionMap,
    backend: renderBackend
  });

  assertTlsProductionRubric(sceneSpec, captionMap, { videoOnly });
  const signoff = buildTlsSecuritySignoff(sceneSpec, captionMap, {
    videoOnly,
    provider
  });
  writeFileSync(securitySignoffPath, `${JSON.stringify(signoff, null, 2)}\n`, "utf-8");

  const productionPolicy = productionPolicyForScene(sceneSpec);
  const mp4Bytes = readFileSync(mp4Path).length;

  const manifest: TlsProductionManifest = {
    schemaVersion: "1.1.0",
    sceneId: sceneSpec.sceneId,
    sceneSpecPath: "src/fixtures/tls-production-scene-spec.json",
    mp4Path: ".artifacts/production/tls/tls-production.mp4",
    captionMapPath: ".artifacts/production/tls/caption-timing-map.json",
    securitySignoffPath: ".artifacts/production/tls/security-signoff.json",
    productionPolicy,
    mp4Bytes,
    renderBackend,
    frameSource,
    videoOnly,
    bundleHash: sha256(
      videoOnly
        ? `${sceneSpec.seed}:${mp4Bytes}:${signoff.beatsPassed}:${renderBackend}:${frameSource}`
        : `${sceneSpec.seed}:${mp4Bytes}:${signoff.beatsPassed}:${provider!.id}:${narrationTrack!.captionMapHash}:${renderBackend}:${frameSource}`
    ),
    generatedAt: new Date().toISOString()
  };

  if (includeNarration) {
    manifest.narrationTrackPath = TLS_NARRATION_TRACK_PATH;
    manifest.narrationProviderId = provider!.id;
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  writeFileSync(
    beatSheetPath,
    `# TLS Production Beat Sheet\n\n| Beat id | Frames | Module focus |\n| --- | --- | --- |\n| tls-hook | 0–89 | viz-packet-threat |\n| tls-client-hello-beat | 90–209 | viz-packet-flow, viz-tunnel-handshake |\n| tls-server-hello-beat | 210–329 | viz-cert-single, viz-tunnel-handshake |\n| tls-finished-beat | 330–449 | viz-tunnel-secure |\n| tls-app-data-beat | 450–599 | viz-packet-encrypted, viz-tunnel-secure |\n\nContract: src/content/topics/tls/contract.json\nSceneSpec: src/fixtures/tls-production-scene-spec.json\n`,
    "utf-8"
  );

  writeFileSync(
    renderHandoffPath,
    `# TLS Production Render Handoff\n\n| Field | Value |\n| --- | --- |\n| SceneSpec | src/fixtures/tls-production-scene-spec.json |\n| Render | renderCompositionProductionMp4 (640×360, ${sceneSpec.totalFrames} frames) |\n| Backend | ${renderBackend} |\n| Frame source | ${frameSource} |\n| Video only | ${videoOnly} |\n| MP4 | .artifacts/production/tls/tls-production.mp4 |\n| Quality policy | productionPolicyForScene (≈${productionPolicy.minDurationSeconds}–${productionPolicy.maxDurationSeconds}s) |\n| Verify | npm run verify:tls-3d-production -- --quick |\n`,
    "utf-8"
  );

  writeFileSync(
    audioHandoffPath,
    videoOnly
      ? `# TLS Production Audio Layer Handoff\n\n| Field | Value |\n| --- | --- |\n| Status | Deferred for v1.5 video-only milestone |\n| Caption map | .artifacts/production/tls/caption-timing-map.json (HUD beats only) |\n| Narration mux | Out of scope — set SECURITY_LAB_INCLUDE_NARRATION=true for legacy v1.4 path |\n`
      : `# TLS Production Audio Layer Handoff\n\n| Field | Value |\n| --- | --- |\n| Caption map | .artifacts/production/tls/caption-timing-map.json |\n| Narration track | ${TLS_NARRATION_TRACK_PATH} |\n| Provider | ${provider!.id} (resolveNarrationProvider) |\n| Alignment | validateNarrationAlignment pass in security-signoff.json |\n| Policy | ElevenLabs when ELEVENLABS_API_KEY set; deterministic-stub dummy audio otherwise |\n`,
    "utf-8"
  );

  return {
    artifactRoot,
    mp4Path,
    manifestPath,
    securitySignoffPath,
    captionMapPath,
    narrationTrackPath: includeNarration ? narrationTrackPath : undefined,
    manifest,
    signoff
  };
}
