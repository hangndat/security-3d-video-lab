import tlsContract from "../content/topics/tls/contract.json";
import type { CaptionTimingMap } from "../content/composition/generate-caption-timing-map.js";
import { generateCaptionTimingMap } from "../content/composition/generate-caption-timing-map.js";
import { generateNarrationTrack } from "../content/narration/generate-narration-track.js";
import { DETERMINISTIC_STUB_PROVIDER_ID } from "../content/narration/providers/deterministic-stub-provider.js";
import type { NarrationProvider } from "../content/narration/providers/types.js";
import { validateNarrationAlignment } from "../content/narration/validate-narration-alignment.js";
import type { SceneSpec } from "../engine/contracts/scene-spec.js";
import { getComposePlan } from "../client/viz/compose-scene.js";
import dnsSceneSpec from "../fixtures/dns-scene-spec.json";
import sshSceneSpec from "../fixtures/ssh-scene-spec.json";
import tlsProductionSceneSpec from "../fixtures/tls-production-scene-spec.json";

export type TlsBeatModuleExpectation = {
  beatId: string;
  representativeFrame: number;
  expectedModules: string[];
};

export type TlsBeatSignoffEntry = {
  beatId: string;
  representativeFrame: number;
  expectedModules: string[];
  renderOrder: string[];
  passed: boolean;
  failures: string[];
};

export type TlsSecuritySignoff = {
  schemaVersion: "1.0.0";
  topic: "tls";
  contractPath: "src/content/topics/tls/contract.json";
  sceneSpecPath: "src/fixtures/tls-production-scene-spec.json";
  reviewedAt: string;
  beatsReviewed: number;
  beatsPassed: number;
  narrationProviderId?: string;
  narrationAlignmentValid: boolean | null;
  approvedForProduction: boolean;
  beats: TlsBeatSignoffEntry[];
};

export const TLS_BEAT_MODULE_EXPECTATIONS: TlsBeatModuleExpectation[] = [
  { beatId: "tls-hook", representativeFrame: 45, expectedModules: ["viz-packet-threat"] },
  {
    beatId: "tls-client-hello-beat",
    representativeFrame: 150,
    expectedModules: ["viz-packet-flow", "viz-tunnel-handshake"]
  },
  {
    beatId: "tls-server-hello-beat",
    representativeFrame: 270,
    expectedModules: ["viz-cert-single", "viz-tunnel-handshake"]
  },
  {
    beatId: "tls-finished-beat",
    representativeFrame: 390,
    expectedModules: ["viz-tunnel-secure"]
  },
  {
    beatId: "tls-app-data-beat",
    representativeFrame: 525,
    expectedModules: ["viz-packet-encrypted", "viz-tunnel-secure"]
  }
];

const TLS_CONTRACT_BEAT_IDS = tlsContract.storyboardBeats.map((beat) => beat.id);

export function buildTlsProductionCaptionMap(
  sceneSpec: SceneSpec = tlsProductionSceneSpec
): CaptionTimingMap {
  return generateCaptionTimingMap("network-foundations-long-v1", {
    tls: sceneSpec,
    ssh: sshSceneSpec,
    dns: dnsSceneSpec
  });
}

/** TLS-only captions for publish export (no SSH/DNS entries on short scene frames). */
export function buildTlsOnlyCaptionMap(
  sceneSpec: SceneSpec = tlsProductionSceneSpec
): CaptionTimingMap {
  const full = buildTlsProductionCaptionMap(sceneSpec);
  return {
    ...full,
    entries: full.entries.filter((entry) => entry.topic === "tls")
  };
}

export function assertTlsBeatCoverage(sceneSpec: SceneSpec): void {
  const cueIds = sceneSpec.timeline.map((cue) => cue.id);
  const missing = TLS_CONTRACT_BEAT_IDS.filter(
    (beatId) => !cueIds.some((cueId) => cueId.includes(beatId))
  );
  if (missing.length > 0) {
    throw new Error(`TLS production scene missing timeline cues for beats: ${missing.join(", ")}`);
  }
}

export function evaluateTlsModuleMapping(
  sceneSpec: SceneSpec,
  captionMap?: CaptionTimingMap
): TlsBeatSignoffEntry[] {
  const map = captionMap ?? buildTlsOnlyCaptionMap(sceneSpec);

  return TLS_BEAT_MODULE_EXPECTATIONS.map((expectation) => {
    const plan = getComposePlan(sceneSpec, expectation.representativeFrame, {
      captionMap: map
    });
    const failures = expectation.expectedModules.filter(
      (moduleId) => !plan.renderOrder.includes(moduleId)
    );

    return {
      beatId: expectation.beatId,
      representativeFrame: expectation.representativeFrame,
      expectedModules: expectation.expectedModules,
      renderOrder: plan.renderOrder,
      passed: failures.length === 0,
      failures
    };
  });
}

export function assertTlsModuleMapping(
  sceneSpec: SceneSpec,
  captionMap?: CaptionTimingMap
): TlsBeatSignoffEntry[] {
  const entries = evaluateTlsModuleMapping(sceneSpec, captionMap);
  const failed = entries.filter((entry) => !entry.passed);
  if (failed.length > 0) {
    const details = failed
      .map(
        (entry) =>
          `${entry.beatId}@${entry.representativeFrame}: missing ${entry.failures.join(", ")} (renderOrder=${entry.renderOrder.join("→")})`
      )
      .join("; ");
    throw new Error(`TLS module mapping rubric failed: ${details}`);
  }
  return entries;
}

export function assertTlsNarrationAlignment(captionMap: CaptionTimingMap): void {
  const track = generateNarrationTrack(captionMap);
  const alignment = validateNarrationAlignment(captionMap, track);
  if (!alignment.valid) {
    throw new Error(`TLS narration alignment failed:\n${alignment.errors.join("\n")}`);
  }
}

export function buildTlsSecuritySignoff(
  sceneSpec: SceneSpec,
  captionMap?: CaptionTimingMap,
  options: { provider?: NarrationProvider; videoOnly?: boolean } = {}
): TlsSecuritySignoff {
  const map = captionMap ?? buildTlsOnlyCaptionMap(sceneSpec);
  const beatEntries = evaluateTlsModuleMapping(sceneSpec, map);
  const beatsPassed = beatEntries.filter((entry) => entry.passed).length;

  if (options.videoOnly) {
    return {
      schemaVersion: "1.0.0",
      topic: "tls",
      contractPath: "src/content/topics/tls/contract.json",
      sceneSpecPath: "src/fixtures/tls-production-scene-spec.json",
      reviewedAt: new Date().toISOString(),
      beatsReviewed: beatEntries.length,
      beatsPassed,
      narrationAlignmentValid: null,
      approvedForProduction: beatsPassed === beatEntries.length,
      beats: beatEntries
    };
  }

  const provider = options.provider;
  const track = provider ? generateNarrationTrack(map, provider) : generateNarrationTrack(map);
  const narrationAlignment = validateNarrationAlignment(map, track);

  return {
    schemaVersion: "1.0.0",
    topic: "tls",
    contractPath: "src/content/topics/tls/contract.json",
    sceneSpecPath: "src/fixtures/tls-production-scene-spec.json",
    reviewedAt: new Date().toISOString(),
    beatsReviewed: beatEntries.length,
    beatsPassed,
    narrationProviderId: provider?.id ?? track.providerId ?? DETERMINISTIC_STUB_PROVIDER_ID,
    narrationAlignmentValid: narrationAlignment.valid,
    approvedForProduction:
      beatsPassed === beatEntries.length && narrationAlignment.valid,
    beats: beatEntries
  };
}

export function assertTlsProductionRubric(
  sceneSpec: SceneSpec,
  captionMap?: CaptionTimingMap,
  options: { videoOnly?: boolean } = {}
): { signoff: TlsSecuritySignoff } {
  assertTlsBeatCoverage(sceneSpec);
  assertTlsModuleMapping(sceneSpec, captionMap);
  const map = captionMap ?? buildTlsOnlyCaptionMap(sceneSpec);
  if (!options.videoOnly) {
    assertTlsNarrationAlignment(map);
  }
  const signoff = buildTlsSecuritySignoff(sceneSpec, map, options);
  if (!signoff.approvedForProduction) {
    throw new Error("TLS production rubric sign-off not approved.");
  }
  return { signoff };
}
