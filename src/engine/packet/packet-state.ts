import type { SceneSpec } from "../contracts/scene-spec.js";

export type PacketRoutePoint = {
  x: number;
  y: number;
  z: number;
};

type PacketSpawnEvent = {
  frame: number;
  parentId: string;
  childId: string;
  route: PacketRoutePoint[];
  group?: string;
};

type PacketTerminalEvent = {
  frame: number;
  packetId: string;
  reason: string;
};

export type PacketLifecycleEvents = {
  spawns: PacketSpawnEvent[];
  terminals: PacketTerminalEvent[];
};

type PacketState = {
  id: string;
  route: PacketRoutePoint[];
  parentId?: string;
  group?: string;
  lineage: string[];
  progress: number;
  terminal: boolean;
  terminalReason?: string;
  visual: {
    trailActive: boolean;
    dimmed: boolean;
  };
};

export type PacketFrameState = {
  frame: number;
  packets: Record<string, PacketState>;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function resolvePacketProgress(sceneSpec: SceneSpec, packetId: string, frame: number): number {
  const cue = sceneSpec.timeline.find(
    (item) => item.track === "packet" && item.payload.packetId === packetId
  );
  if (!cue) {
    return 0;
  }

  if (frame <= cue.startFrame) {
    return 0;
  }
  if (frame >= cue.startFrame + cue.duration) {
    return 1;
  }

  return clamp01((frame - cue.startFrame) / cue.duration);
}

function buildInitialPacketStates(sceneSpec: SceneSpec, frame: number): Record<string, PacketState> {
  return Object.fromEntries(
    sceneSpec.packets.map((packet) => [
      packet.id,
      {
        id: packet.id,
        route: packet.route,
        lineage: [packet.id],
        progress: resolvePacketProgress(sceneSpec, packet.id, frame),
        terminal: false,
        visual: {
          trailActive: true,
          dimmed: false
        }
      }
    ])
  );
}

export function buildPacketFrameState(
  sceneSpec: SceneSpec,
  frame: number,
  lifecycleEvents: PacketLifecycleEvents
): PacketFrameState {
  const packets = buildInitialPacketStates(sceneSpec, frame);

  const sortedSpawns = [...lifecycleEvents.spawns].sort((a, b) => {
    if (a.frame !== b.frame) {
      return a.frame - b.frame;
    }
    if (a.parentId !== b.parentId) {
      return a.parentId.localeCompare(b.parentId);
    }
    return a.childId.localeCompare(b.childId);
  });

  for (const spawn of sortedSpawns) {
    if (spawn.frame > frame) {
      continue;
    }
    const parent = packets[spawn.parentId];
    if (!parent) {
      throw new Error(`Spawn parent '${spawn.parentId}' not found.`);
    }
    packets[spawn.childId] = {
      id: spawn.childId,
      route: spawn.route,
      parentId: spawn.parentId,
      group: spawn.group,
      lineage: [...parent.lineage, spawn.childId],
      progress: 0,
      terminal: false,
      visual: {
        trailActive: true,
        dimmed: false
      }
    };
  }

  const sortedTerminals = [...lifecycleEvents.terminals].sort(
    (a, b) => a.frame - b.frame || a.packetId.localeCompare(b.packetId)
  );

  for (const terminal of sortedTerminals) {
    if (terminal.frame > frame) {
      continue;
    }
    const packet = packets[terminal.packetId];
    if (!packet) {
      throw new Error(`Terminal packet '${terminal.packetId}' not found.`);
    }
    packet.terminal = true;
    packet.terminalReason = terminal.reason;
    packet.progress = 1;
    packet.visual = {
      trailActive: false,
      dimmed: true
    };
  }

  return {
    frame,
    packets
  };
}
