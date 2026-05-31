import { interpolateRoutePosition } from "../packet/packet-interpolator.js";
import {
  buildPacketFrameState,
  type PacketLifecycleEvents
} from "../../engine/packet/packet-state.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { scheduleFrame } from "../../engine/timeline/scheduler.js";

export type PacketModuleId =
  | "viz-packet-flow"
  | "viz-packet-encrypted"
  | "viz-packet-threat";

export type VizPacketRenderState = {
  id: string;
  position: { x: number; y: number; z: number };
  progress: number;
  moduleId: PacketModuleId;
  messageLabel?: string;
  trailActive: boolean;
  dimmed: boolean;
};

function resolvePacketMessageLabel(
  sceneSpec: SceneSpec,
  packetId: string,
  frame: number
): string | undefined {
  const activeCues = sceneSpec.timeline.filter(
    (cue) =>
      cue.track === "packet" &&
      cue.payload.packetId === packetId &&
      frame >= cue.startFrame &&
      frame < cue.startFrame + cue.duration
  );
  const cue = activeCues.at(-1);
  const messageType = cue?.payload.messageType;
  return typeof messageType === "string" && messageType.length > 0 ? messageType : undefined;
}

export type VizFrameState = {
  frame: number;
  seed: string;
  activeTimelineIds: string[];
  packets: VizPacketRenderState[];
};

const EMPTY_LIFECYCLE: PacketLifecycleEvents = { spawns: [], terminals: [] };

/** Resolve packet catalog id from timeline cue payload hints and cue id keywords. */
export function resolvePacketModuleId(
  sceneSpec: SceneSpec,
  packetId: string,
  frame: number
): PacketModuleId {
  const activeCues = sceneSpec.timeline.filter(
    (cue) =>
      cue.track === "packet" &&
      cue.payload.packetId === packetId &&
      frame >= cue.startFrame &&
      frame < cue.startFrame + cue.duration
  );

  for (const cue of activeCues) {
    const variant = cue.payload.packetVariant;
    if (variant === "threat") {
      return "viz-packet-threat";
    }
    if (variant === "encrypted") {
      return "viz-packet-encrypted";
    }
    if (variant === "flow") {
      return "viz-packet-flow";
    }

    const cueId = cue.id.toLowerCase();
    if (cueId.includes("hook") || cueId.includes("threat")) {
      return "viz-packet-threat";
    }
    if (
      cueId.includes("encrypted") ||
      cueId.includes("app-data") ||
      cueId.includes("finished") ||
      cueId.includes("secure")
    ) {
      return "viz-packet-encrypted";
    }
  }

  const pastSecureCue = sceneSpec.timeline.some((cue) => {
    if (cue.track !== "packet" || cue.payload.packetId !== packetId) {
      return false;
    }
    const cueId = cue.id.toLowerCase();
    return (
      (cueId.includes("finished") || cueId.includes("secure") || cueId.includes("app-data")) &&
      frame >= cue.startFrame + cue.duration
    );
  });
  if (pastSecureCue) {
    return "viz-packet-encrypted";
  }

  return "viz-packet-flow";
}

export function buildVizFrameState(
  sceneSpec: SceneSpec,
  frame: number,
  lifecycleEvents: PacketLifecycleEvents = EMPTY_LIFECYCLE
): VizFrameState {
  const scheduled = scheduleFrame(sceneSpec, frame);
  const packetFrame = buildPacketFrameState(sceneSpec, frame, lifecycleEvents);

  const packets = Object.values(packetFrame.packets)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((packet) => ({
      id: packet.id,
      position: interpolateRoutePosition(packet.route, packet.progress),
      progress: packet.progress,
      moduleId: resolvePacketModuleId(sceneSpec, packet.id, frame),
      messageLabel: resolvePacketMessageLabel(sceneSpec, packet.id, frame),
      trailActive: packet.visual.trailActive,
      dimmed: packet.visual.dimmed
    }));

  return {
    frame,
    seed: scheduled.seed,
    activeTimelineIds: scheduled.activeTimelineIds,
    packets
  };
}
