import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { resolveActiveCaption } from "./resolve-hud-caption.js";
import type { VizFrameState } from "./build-viz-frame-state.js";

export type TunnelModuleId = "viz-tunnel-secure" | "viz-tunnel-handshake";

export type CertModuleId = "viz-cert-single" | "viz-cert-chain";

export type HudModuleId =
  | "viz-hud-actor-label"
  | "viz-hud-beat-caption"
  | "viz-hud-packet-id"
  | "viz-hud-frame-counter";

export type VizModuleStack = {
  primary: string[];
  cert: CertModuleId | null;
  hud: HudModuleId[];
  zOrder: string[];
};

export type ResolveHudOptions = {
  captionMap?: CaptionTimingMap;
  showFrameCounter?: boolean;
};

const CHAIN_ROLE_KEYWORDS = ["ca", "certificate-authority", "intermediate", "leaf"] as const;

function actorLabelMatchesRole(label: string, role: string): boolean {
  return label.toLowerCase().includes(role);
}

function hasChainTrustActors(actors: SceneSpec["actors"]): boolean {
  const labels = actors.map((actor) => actor.label.toLowerCase());
  const matchedRoles = CHAIN_ROLE_KEYWORDS.filter((role) =>
    labels.some((label) => actorLabelMatchesRole(label, role))
  );
  return matchedRoles.length >= 2;
}

function hasServerHelloCue(vizFrameState: VizFrameState): boolean {
  return vizFrameState.activeTimelineIds.some((cueId) => cueId.toLowerCase().includes("server-hello"));
}

export function resolveTunnelModuleId(
  vizFrameState: VizFrameState,
  sceneSpec: SceneSpec
): TunnelModuleId | null {
  const { activeTimelineIds, frame } = vizFrameState;

  for (const cueId of activeTimelineIds) {
    const lower = cueId.toLowerCase();
    if (lower.includes("finished") || lower.includes("secure") || lower.includes("app-data")) {
      return "viz-tunnel-secure";
    }
  }

  for (const cueId of activeTimelineIds) {
    const lower = cueId.toLowerCase();
    if (lower.includes("handshake") || lower.includes("hello") || lower.includes("kex")) {
      return "viz-tunnel-handshake";
    }
  }

  if (activeTimelineIds.length === 0) {
    const handshakeCues = sceneSpec.timeline.filter((cue) => {
      const lower = cue.id.toLowerCase();
      return lower.includes("handshake") || lower.includes("hello") || lower.includes("kex");
    });
    if (handshakeCues.length > 0 && handshakeCues.every((cue) => frame >= cue.startFrame + cue.duration)) {
      return "viz-tunnel-secure";
    }
  }

  return null;
}

export function resolveCertModuleId(
  vizFrameState: VizFrameState,
  sceneSpec: SceneSpec
): CertModuleId | null {
  const serverHelloActive = hasServerHelloCue(vizFrameState);
  const chainActors = hasChainTrustActors(sceneSpec.actors);

  if (chainActors && serverHelloActive) {
    return "viz-cert-chain";
  }

  if (serverHelloActive) {
    return "viz-cert-single";
  }

  return null;
}

const PACKET_MODULE_PRIORITY = [
  "viz-packet-threat",
  "viz-packet-encrypted",
  "viz-packet-flow"
] as const;

function resolveActivePacketModuleIds(vizFrameState: VizFrameState): string[] {
  const present = new Set(vizFrameState.packets.map((packet) => packet.moduleId));
  return PACKET_MODULE_PRIORITY.filter((moduleId) => present.has(moduleId));
}

function resolveSelectedPacketModuleId(vizFrameState: VizFrameState): string | null {
  return resolveActivePacketModuleIds(vizFrameState)[0] ?? null;
}

function hasActivePacketTimeline(vizFrameState: VizFrameState, sceneSpec: SceneSpec): boolean {
  if (vizFrameState.activeTimelineIds.length > 0) {
    return sceneSpec.timeline.some(
      (cue) =>
        cue.track === "packet" &&
        vizFrameState.activeTimelineIds.includes(cue.id)
    );
  }
  return false;
}

export function resolveHudModules(
  vizFrameState: VizFrameState,
  sceneSpec: SceneSpec,
  options: ResolveHudOptions = {}
): HudModuleId[] {
  const hud: HudModuleId[] = [];

  if (sceneSpec.actors.length > 0) {
    hud.push("viz-hud-actor-label");
  }

  if (resolveActiveCaption(options.captionMap, vizFrameState.frame)) {
    hud.push("viz-hud-beat-caption");
  }

  if (hasActivePacketTimeline(vizFrameState, sceneSpec)) {
    hud.push("viz-hud-packet-id");
  }

  if (options.showFrameCounter) {
    hud.push("viz-hud-frame-counter");
  }

  return hud;
}

/** Primary precedence when over catalog max-2: tunnel > cert > packet. */
function buildPrimaryModules(
  tunnelId: TunnelModuleId | null,
  certId: CertModuleId | null,
  packetId: string | null
): string[] {
  const candidates: string[] = [];
  if (tunnelId) {
    candidates.push(tunnelId);
  }
  if (certId) {
    candidates.push(certId);
  }
  if (packetId) {
    candidates.push(packetId);
  }
  return candidates.slice(0, 2);
}

export function resolveVizModuleStack(
  vizFrameState: VizFrameState,
  sceneSpec: SceneSpec,
  options: ResolveHudOptions = {}
): VizModuleStack {
  const tunnelId = resolveTunnelModuleId(vizFrameState, sceneSpec);
  const certId = resolveCertModuleId(vizFrameState, sceneSpec);
  const packetModuleIds = resolveActivePacketModuleIds(vizFrameState);
  const selectedPacketId = packetModuleIds[0] ?? null;
  const hud = resolveHudModules(vizFrameState, sceneSpec, options);

  const primary = buildPrimaryModules(tunnelId, certId, selectedPacketId);

  const zOrder: string[] = [];
  if (tunnelId) {
    zOrder.push(tunnelId);
  }
  zOrder.push(...packetModuleIds);
  if (certId) {
    zOrder.push(certId);
  }
  zOrder.push(...hud);

  return {
    primary,
    cert: certId,
    hud,
    zOrder
  };
}
