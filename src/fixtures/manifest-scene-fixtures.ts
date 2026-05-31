import type { SceneSpec } from "../engine/contracts/scene-spec.js";
import type { TopicId } from "../content/contracts/types.js";
import { loadTopicManifest } from "../content/contracts/load-topic-manifest.js";

import apiGatewayWafSceneSpec from "./api-gateway-waf-scene-spec.json";
import authSessionSceneSpec from "./auth-session-scene-spec.json";
import dnsSceneSpec from "./dns-scene-spec.json";
import goldenSceneSpec from "./golden-scene-spec.json";
import mitmDefenseSceneSpec from "./mitm-defense-scene-spec.json";
import oauthJwtSessionSceneSpec from "./oauth-jwt-session-scene-spec.json";
import pkiTrustChainSceneSpec from "./pki-trust-chain-scene-spec.json";
import sshSceneSpec from "./ssh-scene-spec.json";
import zeroTrustAccessSceneSpec from "./zero-trust-access-scene-spec.json";

export const DEPTH_ASSEMBLY_SLUG = "content-depth-long-v1";
export const BRANCHED_ASSEMBLY_SLUG = "content-depth-branched-v1";
export const BRANCH_IDS = ["attack-path", "defense-path"] as const;
export const EXPORT_ROOT_PHASE12 = ".artifacts/export/phase12";

export const MANIFEST_SCENE_FIXTURES: Record<TopicId, SceneSpec> = {
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

export function getManifestSceneFixtures(): Record<TopicId, SceneSpec> {
  const manifest = loadTopicManifest();
  const fixtures = {} as Record<TopicId, SceneSpec>;

  for (const topic of manifest.order) {
    fixtures[topic] = MANIFEST_SCENE_FIXTURES[topic];
  }

  return fixtures;
}
