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
  buildLongFormExportBundle,
  buildSceneId,
  hashExportBundleEnvelope
} from "../src/render/export/build-long-form-export-bundle.js";

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

describe("long-form export bundle", () => {
  it("network-foundations-long-v1 includes caption + narration with matching beat counts", () => {
    const bundle = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES);

    expect(bundle.captionTimingMap.entries.length).toBe(bundle.narrationTrack.segments.length);
    expect(bundle.captionMapHash).toHaveLength(64);
    expect(bundle.narrationTrackHash).toHaveLength(64);
    expect(bundle.bundleHash).toHaveLength(64);
    expect(bundle.captionTimingMapPath).toContain("network-foundations-long-v1");
    expect(bundle.narrationTrackPath).toContain("network-foundations-long-v1");
  });

  it("bundleHash identical on two runs with same inputs", () => {
    const first = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES);
    const second = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES);

    expect(second.bundleHash).toBe(first.bundleHash);
    expect(second.narrationTrackHash).toBe(first.narrationTrackHash);
    expect(second.captionMapHash).toBe(first.captionMapHash);
  });

  it("branched defense-path bundle sceneId matches stitch convention", () => {
    const bundle = buildLongFormExportBundle("content-depth-branched-v1", BRANCHED_SCENES, {
      branchId: "defense-path"
    });

    expect(bundle.sceneId).toBe("content-depth-branched-v1:defense-path");
    expect(bundle.bundlePath).toContain("content-depth-branched-v1-defense-path");
    expect(bundle.branchId).toBe("defense-path");
  });

  it("bundle JSON includes required path fields and content hashes", () => {
    const bundle = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES);

    expect(bundle.bundlePath).toMatch(/export-bundle\.json$/);
    expect(bundle.captionTimingMapPath).toMatch(/caption-timing-map\.json$/);
    expect(bundle.narrationTrackPath).toMatch(/narration-track\.json$/);
    expect(hashExportBundleEnvelope(bundle)).toBe(bundle.bundleHash);
    expect(buildSceneId(bundle.assemblySlug)).toBe(bundle.sceneId);
  });
});

describe("export bundle deterministic manifest linkage", () => {
  it("includes deterministicManifest when traceInputs provided", () => {
    const bundle = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES, {
      traceInputs: ["trace-a", "trace-b"],
      specHash: "spec-hash-001",
      seed: "seed-001"
    });

    expect(bundle.deterministicManifest).toBeDefined();
    expect(bundle.deterministicManifest!.sceneId).toBe("network-foundations-long-v1");
    expect(bundle.deterministicManifest!.outputFingerprint.value).toHaveLength(64);
  });

  it("narrationTrackHash stable when traceInputs differ but caption/narration inputs same", () => {
    const base = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES);
    const withTraceA = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES, {
      traceInputs: ["trace-a"]
    });
    const withTraceB = buildLongFormExportBundle("network-foundations-long-v1", CANONICAL_SCENES, {
      traceInputs: ["trace-b"]
    });

    expect(withTraceA.narrationTrackHash).toBe(base.narrationTrackHash);
    expect(withTraceB.narrationTrackHash).toBe(base.narrationTrackHash);
    expect(withTraceA.captionMapHash).toBe(base.captionMapHash);
    expect(withTraceA.deterministicManifest).not.toEqual(withTraceB.deterministicManifest);
  });
});
