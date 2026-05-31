import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
import { resolveProductionRenderBackend } from "../headless/resolve-production-render-backend.js";
import { productionPolicyForScene } from "../../verification/export-quality.js";
import {
  assertTlsProductionRubric,
  buildTlsProductionCaptionMap,
  buildTlsSecuritySignoff,
  type TlsSecuritySignoff
} from "../../verification/tls-production-rubric.js";

const TLS_NARRATION_ARTIFACTS_ROOT = ".artifacts/production/tls/narration";
const TLS_NARRATION_TRACK_PATH = ".artifacts/production/tls/narration-track.json";

export type TlsProductionManifest = {
  schemaVersion: "1.0.0";
  sceneId: string;
  sceneSpecPath: string;
  mp4Path: string;
  captionMapPath: string;
  narrationTrackPath: string;
  narrationProviderId: string;
  securitySignoffPath: string;
  productionPolicy: ReturnType<typeof productionPolicyForScene>;
  mp4Bytes: number;
  renderBackend: ReturnType<typeof resolveProductionRenderBackend>;
  bundleHash: string;
  generatedAt: string;
};

export type GenerateTlsProductionArtifactsResult = {
  artifactRoot: string;
  mp4Path: string;
  manifestPath: string;
  securitySignoffPath: string;
  captionMapPath: string;
  narrationTrackPath: string;
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

  const captionMap = buildTlsProductionCaptionMap(sceneSpec);
  writeFileSync(captionMapPath, `${JSON.stringify(captionMap, null, 2)}\n`, "utf-8");

  const provider = resolveNarrationProvider(env);
  const narrationTrack = generateNarrationTrack(captionMap, provider, {
    artifactsRoot: TLS_NARRATION_ARTIFACTS_ROOT
  });
  writeNarrationArtifacts(narrationTrack, captionMap, provider, repoRoot, {
    artifactsRoot: TLS_NARRATION_ARTIFACTS_ROOT,
    manifestRelativePath: TLS_NARRATION_TRACK_PATH
  });

  renderCompositionProductionMp4(sceneSpec, mp4Path, { captionMap });

  assertTlsProductionRubric(sceneSpec, captionMap);
  const signoff = buildTlsSecuritySignoff(sceneSpec, captionMap, { provider });
  writeFileSync(securitySignoffPath, `${JSON.stringify(signoff, null, 2)}\n`, "utf-8");

  const productionPolicy = productionPolicyForScene(sceneSpec);
  const mp4Bytes = readFileSync(mp4Path).length;
  const renderBackend = resolveProductionRenderBackend(env);

  const manifest: TlsProductionManifest = {
    schemaVersion: "1.0.0",
    sceneId: sceneSpec.sceneId,
    sceneSpecPath: "src/fixtures/tls-production-scene-spec.json",
    mp4Path: ".artifacts/production/tls/tls-production.mp4",
    captionMapPath: ".artifacts/production/tls/caption-timing-map.json",
    narrationTrackPath: TLS_NARRATION_TRACK_PATH,
    narrationProviderId: provider.id,
    securitySignoffPath: ".artifacts/production/tls/security-signoff.json",
    productionPolicy,
    mp4Bytes,
    renderBackend,
    bundleHash: sha256(
      `${sceneSpec.seed}:${mp4Bytes}:${signoff.beatsPassed}:${provider.id}:${narrationTrack.captionMapHash}`
    ),
    generatedAt: new Date().toISOString()
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  writeFileSync(
    beatSheetPath,
    `# TLS Production Beat Sheet\n\n| Beat id | Frames | Module focus |\n| --- | --- | --- |\n| tls-hook | 0–30 | viz-packet-threat |\n| tls-client-hello-beat | 12–48 | viz-packet-flow, viz-tunnel-handshake |\n| tls-server-hello-beat | 54–98 | viz-cert-single, viz-tunnel-handshake |\n| tls-finished-beat | 110–168 | viz-tunnel-secure |\n| tls-app-data-beat | 170–236 | viz-packet-encrypted, viz-tunnel-secure |\n\nContract: src/content/topics/tls/contract.json\nSceneSpec: src/fixtures/tls-production-scene-spec.json\n`,
    "utf-8"
  );

  writeFileSync(
    renderHandoffPath,
    `# TLS Production Render Handoff\n\n| Field | Value |\n| --- | --- |\n| SceneSpec | src/fixtures/tls-production-scene-spec.json |\n| Render | renderCompositionProductionMp4 (640×360, ${sceneSpec.totalFrames} frames) |\n| Backend | ${renderBackend} (default r3f-headless; set SECURITY_LAB_RENDER_BACKEND=trace-hash for CI) |\n| MP4 | .artifacts/production/tls/tls-production.mp4 |\n| Quality policy | productionPolicyForScene (≈${productionPolicy.minDurationSeconds}–${productionPolicy.maxDurationSeconds}s) |\n| Verify | npm run verify:tls-production |\n`,
    "utf-8"
  );

  writeFileSync(
    audioHandoffPath,
    `# TLS Production Audio Layer Handoff\n\n| Field | Value |\n| --- | --- |\n| Caption map | .artifacts/production/tls/caption-timing-map.json |\n| Narration track | ${TLS_NARRATION_TRACK_PATH} |\n| Provider | ${provider.id} (resolveNarrationProvider) |\n| Alignment | validateNarrationAlignment pass in security-signoff.json |\n| Policy | ElevenLabs when ELEVENLABS_API_KEY set; deterministic-stub dummy audio otherwise |\n`,
    "utf-8"
  );

  return {
    artifactRoot,
    mp4Path,
    manifestPath,
    securitySignoffPath,
    captionMapPath,
    narrationTrackPath,
    manifest,
    signoff
  };
}
