import type { SceneSpec } from "../../engine/contracts/scene-spec.js";

export type ActorWorldAnchor = {
  id: string;
  label: string;
  position: { x: number; y: number; z: number };
  role: "client" | "server" | "attacker" | "neutral";
};

const TLS_PRODUCTION_SCENE_IDS = new Set(["tls-production-scene"]);

const TLS_ACTOR_ANCHORS: Record<string, Omit<ActorWorldAnchor, "id" | "label">> = {
  "actor-client": { position: { x: -4, y: 0, z: 0 }, role: "client" },
  "actor-server": { position: { x: 4, y: 0, z: 0 }, role: "server" },
  "actor-attacker": { position: { x: 0, y: 0, z: 0 }, role: "attacker" }
};

function isTlsProductionLayout(sceneSpec: SceneSpec): boolean {
  return TLS_PRODUCTION_SCENE_IDS.has(sceneSpec.sceneId);
}

function hookBeatEndFrame(sceneSpec: SceneSpec): number {
  const hookCue = sceneSpec.timeline.find((cue) => cue.id.toLowerCase().includes("hook"));
  if (!hookCue) {
    return 89;
  }
  return hookCue.startFrame + hookCue.duration - 1;
}

export function resolveActorWorldAnchor(
  actor: SceneSpec["actors"][number],
  sceneSpec: SceneSpec
): ActorWorldAnchor {
  const preset = isTlsProductionLayout(sceneSpec) ? TLS_ACTOR_ANCHORS[actor.id] : undefined;
  if (preset) {
    return { id: actor.id, label: actor.label, ...preset };
  }

  const index = sceneSpec.actors.findIndex((entry) => entry.id === actor.id);
  return {
    id: actor.id,
    label: actor.label,
    position: { x: -1.5 + index * 1.5, y: 0, z: 0 },
    role: "neutral"
  };
}

/** Sniffer only visible during tls-hook beat on production layout. */
export function resolveVisibleActors(sceneSpec: SceneSpec, frame: number): SceneSpec["actors"] {
  if (!isTlsProductionLayout(sceneSpec)) {
    return sceneSpec.actors;
  }

  const hookEnd = hookBeatEndFrame(sceneSpec);
  return sceneSpec.actors.filter((actor) => {
    if (actor.id === "actor-attacker" || actor.label.toLowerCase().includes("sniff")) {
      return frame <= hookEnd;
    }
    return true;
  });
}

export function resolveTlsLinkEndpoints(sceneSpec: SceneSpec): {
  client: { x: number; y: number; z: number };
  server: { x: number; y: number; z: number };
} {
  const client = resolveActorWorldAnchor(
    sceneSpec.actors.find((a) => a.id === "actor-client") ?? {
      id: "actor-client",
      label: "client"
    },
    sceneSpec
  );
  const server = resolveActorWorldAnchor(
    sceneSpec.actors.find((a) => a.id === "actor-server") ?? {
      id: "actor-server",
      label: "server"
    },
    sceneSpec
  );
  return { client: client.position, server: server.position };
}
