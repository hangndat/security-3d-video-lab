import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import type { VizFrameState } from "./build-viz-frame-state.js";

export type TunnelModuleId = "viz-tunnel-secure" | "viz-tunnel-handshake";

export type VizModuleStack = {
  primary: string[];
  zOrder: string[];
};

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

export function resolveVizModuleStack(
  vizFrameState: VizFrameState,
  sceneSpec: SceneSpec
): VizModuleStack {
  const tunnelId = resolveTunnelModuleId(vizFrameState, sceneSpec);
  const packetModuleIds = [...new Set(vizFrameState.packets.map((packet) => packet.moduleId))];

  let selectedPacketId = packetModuleIds[0] ?? null;
  const hasThreat = packetModuleIds.includes("viz-packet-threat");
  const hasEncrypted = packetModuleIds.includes("viz-packet-encrypted");
  if (hasThreat && hasEncrypted) {
    selectedPacketId = vizFrameState.activeTimelineIds.some((id) =>
      id.toLowerCase().includes("threat")
    )
      ? "viz-packet-threat"
      : "viz-packet-encrypted";
  }

  const primary: string[] = [];
  if (tunnelId) {
    primary.push(tunnelId);
  }
  if (selectedPacketId) {
    primary.push(selectedPacketId);
  }

  const zOrder: string[] = [];
  if (tunnelId) {
    zOrder.push(tunnelId);
  }
  if (selectedPacketId) {
    zOrder.push(selectedPacketId);
  }

  return {
    primary: primary.slice(0, 2),
    zOrder
  };
}
