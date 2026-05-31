import * as THREE from "three";

import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import type { ComposePlan } from "./compose-scene.js";
import type { VizPacketRenderState } from "./build-viz-frame-state.js";
import {
  CATALOG_VIZ_MODULE_IDS,
  CERT_MODULE_IDS,
  HUD_MODULE_IDS,
  PACKET_MODULE_IDS,
  TUNNEL_MODULE_IDS,
  type Phase18ModuleId
} from "./registry.js";
import {
  createCaptionTexture,
  createHudLabelTexture
} from "../../render/headless/create-caption-texture.js";
import {
  resolveActorWorldAnchor,
  resolveTlsLinkEndpoints,
  type ActorWorldAnchor
} from "./actor-anchors.js";
import { STYLE_TOKENS, type StyleTokenKey } from "./style-tokens.js";

export const PACKET_DIMMED_OPACITY = 0.35;
export const TUNNEL_SECURE_OPACITY = 0.85;
export const CERT_SINGLE_EMISSIVE = 0.35;
export const CERT_CHAIN_EMISSIVE = 0.3;
export const CERT_LABEL_PANEL_OPACITY = 0.85;
export const HUD_CAPTION_OPACITY = 0.75;
export const HUD_PLACEHOLDER_PLANE: readonly [number, number] = [0.01, 0.01];
export const CERT_CHAIN_OFFSETS = [-0.9, 0, 0.9] as const;

export const PACKET_MESH_SPEC = {
  "viz-packet-flow": {
    radius: 0.15,
    widthSegments: 16,
    heightSegments: 16,
    colorToken: "colorAccentData",
    emissiveToken: "lightAccentGlowOpacity"
  },
  "viz-packet-encrypted": {
    radius: 0.15,
    widthSegments: 16,
    heightSegments: 16,
    colorToken: "colorAccentCyan",
    emissiveToken: "lightAccentGlowOpacity"
  },
  "viz-packet-threat": {
    radius: 0.18,
    widthSegments: 16,
    heightSegments: 16,
    colorToken: "colorAccentThreat",
    emissiveToken: "lightThreatPulseOpacity"
  }
} as const satisfies Record<(typeof PACKET_MODULE_IDS)[number], PacketMeshSpecEntry>;

export const TUNNEL_MESH_SPEC = {
  "viz-tunnel-secure": {
    radius: 1.2,
    tube: 0.12,
    radialSegments: 16,
    tubularSegments: 48,
    colorToken: "colorAccentCyan",
    emissiveToken: "lightAccentGlowOpacity",
    wireframe: false,
    opacity: TUNNEL_SECURE_OPACITY,
    emissiveScale: 1
  },
  "viz-tunnel-handshake": {
    radius: 1.2,
    tube: 0.08,
    radialSegments: 16,
    tubularSegments: 48,
    colorToken: "colorAccentData",
    emissiveToken: "lightRimIntensity",
    wireframe: true,
    opacity: 1,
    emissiveScale: 0.5
  }
} as const satisfies Record<(typeof TUNNEL_MODULE_IDS)[number], TunnelMeshSpecEntry>;

export const CERT_MESH_SPEC = {
  "viz-cert-single": {
    groupPosition: [0, 0.5, 0] as const,
    boxSize: [0.8, 1.1, 0.05] as const,
    labelPanelSize: [0.7, 0.15] as const,
    labelPanelOffset: [0, 0, 0.04] as const,
    colorToken: "colorAccentTrust",
    panelColorToken: "colorBgPanel",
    emissiveIntensity: CERT_SINGLE_EMISSIVE
  },
  "viz-cert-chain": {
    groupPosition: [0, 0.5, 0] as const,
    linkBoxSize: [0.65, 0.95, 0.05] as const,
    connectorSize: [0.2, 0.06, 0.04] as const,
    connectorOffset: [0.45, 0, 0] as const,
    colorToken: "colorAccentTrust",
    connectorColorToken: "colorAccentNeutral",
    emissiveIntensity: CERT_CHAIN_EMISSIVE
  }
} as const satisfies Record<(typeof CERT_MODULE_IDS)[number], CertMeshSpecEntry>;

export const HUD_MESH_SPEC = {
  "viz-hud-actor-label": {
    origin: [-1.5, 1.2, 0] as const,
    rowStep: 0.25,
    planeSize: HUD_PLACEHOLDER_PLANE,
    colorToken: "colorTextPrimary"
  },
  "viz-hud-beat-caption": {
    position: [0, -1.2, 0] as const,
    panelSize: [2.4, 0.35] as const,
    colorToken: "colorBgPanel",
    opacity: HUD_CAPTION_OPACITY
  },
  "viz-hud-packet-id": {
    origin: [1.4, 0.8, 0] as const,
    rowStep: 0.2,
    planeSize: HUD_PLACEHOLDER_PLANE,
    colorToken: "colorTextMuted"
  },
  "viz-hud-frame-counter": {
    position: [1.6, 1.3, 0] as const,
    planeSize: HUD_PLACEHOLDER_PLANE,
    colorToken: "colorTextMuted"
  }
} as const satisfies Record<(typeof HUD_MODULE_IDS)[number], HudMeshSpecEntry>;

export const VIZ_MESH_SPEC = {
  ...PACKET_MESH_SPEC,
  ...TUNNEL_MESH_SPEC,
  ...CERT_MESH_SPEC,
  ...HUD_MESH_SPEC
} as const;

type PacketMeshSpecEntry = {
  radius: number;
  widthSegments: number;
  heightSegments: number;
  colorToken: StyleTokenKey;
  emissiveToken: StyleTokenKey;
};

type TunnelMeshSpecEntry = {
  radius: number;
  tube: number;
  radialSegments: number;
  tubularSegments: number;
  colorToken: StyleTokenKey;
  emissiveToken: StyleTokenKey;
  wireframe: boolean;
  opacity: number;
  emissiveScale: number;
};

type CertMeshSpecEntry = {
  groupPosition: readonly [number, number, number];
  colorToken: StyleTokenKey;
  emissiveIntensity: number;
  boxSize?: readonly [number, number, number];
  labelPanelSize?: readonly [number, number];
  labelPanelOffset?: readonly [number, number, number];
  linkBoxSize?: readonly [number, number, number];
  connectorSize?: readonly [number, number, number];
  connectorOffset?: readonly [number, number, number];
  connectorColorToken?: StyleTokenKey;
  panelColorToken?: StyleTokenKey;
};

type HudMeshSpecEntry = {
  colorToken: StyleTokenKey;
  planeSize: readonly [number, number];
  origin?: readonly [number, number, number];
  rowStep?: number;
  position?: readonly [number, number, number];
  panelSize?: readonly [number, number];
  opacity?: number;
};

export type VizMeshBuildContext = {
  sceneSpec: SceneSpec;
  frame: number;
  plan: ComposePlan;
};

function tokenColor(key: StyleTokenKey): THREE.Color {
  const value = STYLE_TOKENS[key];
  return new THREE.Color(typeof value === "string" ? value : STYLE_TOKENS.colorTextPrimary);
}

function tokenNumber(key: StyleTokenKey, scale = 1): number {
  const value = STYLE_TOKENS[key];
  return typeof value === "number" ? value * scale : 0;
}

function findPacketForModule(
  packets: VizPacketRenderState[],
  moduleId: string
): VizPacketRenderState | undefined {
  return packets.find((packet) => packet.moduleId === moduleId);
}

function resolveCertLabel(actors: Array<{ id: string; label: string }>): string {
  const serverActor = actors.find(
    (actor) =>
      actor.label.toLowerCase().includes("server") || actor.id.toLowerCase().includes("server")
  );
  return serverActor?.label ?? actors[0]?.label ?? "cert";
}

function attachLabelBillboard(parent: THREE.Object3D, label: string, offsetY: number): void {
  const texture = createHudLabelTexture(label);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.18),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );
  textPlane.position.set(0, offsetY, 0.05);
  parent.add(textPlane);
}

function createPacketMesh(
  moduleId: (typeof PACKET_MODULE_IDS)[number],
  packet: VizPacketRenderState
): THREE.Group {
  const spec = PACKET_MESH_SPEC[moduleId];
  const color = tokenColor(spec.colorToken);
  const group = new THREE.Group();
  group.position.set(packet.position.x, packet.position.y, packet.position.z);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(spec.radius, spec.widthSegments, spec.heightSegments),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: tokenNumber(spec.emissiveToken),
      transparent: true,
      opacity: packet.dimmed ? PACKET_DIMMED_OPACITY : 1
    })
  );
  group.add(mesh);

  if (packet.messageLabel) {
    attachLabelBillboard(group, packet.messageLabel, spec.radius + 0.35);
  }

  return group;
}

function createLinkWireMesh(sceneSpec: SceneSpec): THREE.Mesh {
  const { client, server } = resolveTlsLinkEndpoints(sceneSpec);
  const span = server.x - client.x;
  const color = tokenColor("colorAccentNeutral");
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(span, 0.04, 0.04),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.55
    })
  );
  mesh.position.set((client.x + server.x) / 2, 0.12, 0);
  return mesh;
}

function createTunnelMesh(
  moduleId: (typeof TUNNEL_MODULE_IDS)[number],
  sceneSpec: SceneSpec
): THREE.Group {
  const spec = TUNNEL_MESH_SPEC[moduleId];
  const color = tokenColor(spec.colorToken);
  const { client, server } = resolveTlsLinkEndpoints(sceneSpec);
  const span = Math.max(1, server.x - client.x);
  const group = new THREE.Group();

  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(spec.radius, spec.tube, spec.radialSegments, spec.tubularSegments),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: tokenNumber(spec.emissiveToken, spec.emissiveScale),
      transparent: !spec.wireframe,
      opacity: spec.opacity,
      wireframe: spec.wireframe
    })
  );
  mesh.rotation.y = Math.PI / 2;
  mesh.scale.set(span / 2.4, 1, 0.45);
  mesh.position.set(0, moduleId === "viz-tunnel-secure" ? -0.05 : 0.15, 0);
  group.add(mesh);

  return group;
}

function createCertSingleMeshes(
  actors: SceneSpec["actors"],
  sceneSpec: SceneSpec
): THREE.Group {
  const spec = CERT_MESH_SPEC["viz-cert-single"];
  const color = tokenColor(spec.colorToken);
  const group = new THREE.Group();
  const serverAnchor = actors.find((actor) => actor.id === "actor-server");
  if (serverAnchor && sceneSpec.sceneId === "tls-production-scene") {
    const anchor = resolveActorWorldAnchor(serverAnchor, sceneSpec);
    group.position.set(anchor.position.x - 0.5, 0.55, anchor.position.z);
  } else {
    group.position.set(...spec.groupPosition);
  }
  group.userData.certLabel = resolveCertLabel(actors);

  const certMesh = new THREE.Mesh(
    new THREE.BoxGeometry(...spec.boxSize!),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: spec.emissiveIntensity
    })
  );
  group.add(certMesh);

  const labelPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(...spec.labelPanelSize!),
    new THREE.MeshBasicMaterial({
      color: tokenColor(spec.panelColorToken!),
      transparent: true,
      opacity: CERT_LABEL_PANEL_OPACITY
    })
  );
  labelPanel.position.set(...spec.labelPanelOffset!);
  group.add(labelPanel);
  attachLabelBillboard(group, "Certificate", 0.75);

  return group;
}

function createCertChainMeshes(actors: SceneSpec["actors"]): THREE.Group {
  const spec = CERT_MESH_SPEC["viz-cert-chain"];
  const color = tokenColor(spec.colorToken);
  const group = new THREE.Group();
  group.position.set(...spec.groupPosition);
  const chainActors = actors.slice(0, 3);

  CERT_CHAIN_OFFSETS.forEach((xOffset, index) => {
    const linkGroup = new THREE.Group();
    linkGroup.position.set(xOffset, 0, 0);
    linkGroup.userData.actorId = chainActors[index]?.id ?? `link-${index}`;

    const linkMesh = new THREE.Mesh(
      new THREE.BoxGeometry(...spec.linkBoxSize!),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: spec.emissiveIntensity
      })
    );
    linkGroup.add(linkMesh);

    if (index < CERT_CHAIN_OFFSETS.length - 1) {
      const connector = new THREE.Mesh(
        new THREE.BoxGeometry(...spec.connectorSize!),
        new THREE.MeshStandardMaterial({ color: tokenColor(spec.connectorColorToken!) })
      );
      connector.position.set(...spec.connectorOffset!);
      linkGroup.add(connector);
    }

    group.add(linkGroup);
  });

  return group;
}

function actorMarkerColor(role: ActorWorldAnchor["role"]): StyleTokenKey {
  if (role === "client") {
    return "colorAccentData";
  }
  if (role === "server") {
    return "colorAccentTrust";
  }
  if (role === "attacker") {
    return "colorAccentThreat";
  }
  return "colorAccentNeutral";
}

function createHudActorLabelMeshes(
  actors: SceneSpec["actors"],
  sceneSpec: SceneSpec
): THREE.Group {
  const group = new THREE.Group();
  group.userData.hudFont = STYLE_TOKENS.fontHud;
  group.userData.hudColor = STYLE_TOKENS.colorTextPrimary;

  actors.forEach((actor) => {
    const anchor = resolveActorWorldAnchor(actor, sceneSpec);
    const row = new THREE.Group();
    const labelY = anchor.role === "attacker" ? 2.4 : 0.85;
    row.position.set(anchor.position.x, labelY, anchor.position.z);
    row.userData.label = actor.label;

    const markerColor = tokenColor(actorMarkerColor(anchor.role));
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, anchor.role === "attacker" ? 0.2 : 0.55, 0.35),
      new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: anchor.role === "attacker" ? 0.45 : 0.25
      })
    );
    pillar.position.set(0, anchor.role === "attacker" ? 2.1 : 0.25, 0);
    row.add(pillar);

    attachLabelBillboard(row, actor.label.toUpperCase(), anchor.role === "attacker" ? 2.55 : 1.05);
    group.add(row);
  });

  if (sceneSpec.sceneId === "tls-production-scene") {
    group.add(createLinkWireMesh(sceneSpec));
  }

  return group;
}

function createHudBeatCaptionMeshes(
  activeCaption: ComposePlan["activeCaption"]
): THREE.Object3D[] {
  if (!activeCaption) {
    return [];
  }

  const spec = HUD_MESH_SPEC["viz-hud-beat-caption"];
  const group = new THREE.Group();
  group.position.set(...spec.position!);
  group.userData.caption = activeCaption.scriptIntent;
  group.userData.beatId = activeCaption.beatId;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(...spec.panelSize!),
    new THREE.MeshBasicMaterial({
      color: tokenColor(spec.colorToken),
      transparent: true,
      opacity: spec.opacity!
    })
  );
  group.add(panel);

  const texture = createCaptionTexture(activeCaption.scriptIntent);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 0.33),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );
  textPlane.position.set(0, 0, 0.02);
  group.add(textPlane);

  return [group];
}

function createHudPacketIdMeshes(packetIds: string[]): THREE.Group {
  const spec = HUD_MESH_SPEC["viz-hud-packet-id"];
  const group = new THREE.Group();
  group.userData.hudFont = STYLE_TOKENS.fontHudSm;
  group.userData.hudColor = STYLE_TOKENS.colorTextMuted;

  packetIds.forEach((packetId, index) => {
    const row = new THREE.Group();
    row.position.set(
      spec.origin![0],
      spec.origin![1] - index * spec.rowStep!,
      spec.origin![2]
    );
    row.userData.packetId = packetId;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(...spec.planeSize),
      new THREE.MeshBasicMaterial({
        color: tokenColor(spec.colorToken),
        transparent: true,
        opacity: 0
      })
    );
    row.add(plane);
    group.add(row);
  });

  return group;
}

function createHudFrameCounterMeshes(frame: number): THREE.Group {
  const spec = HUD_MESH_SPEC["viz-hud-frame-counter"];
  const group = new THREE.Group();
  group.position.set(...spec.position!);
  group.userData.frame = frame;

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(...spec.planeSize),
    new THREE.MeshBasicMaterial({
      color: tokenColor(spec.colorToken),
      transparent: true,
      opacity: 0
    })
  );
  group.add(plane);

  return group;
}

export function createHeadlessModuleMeshes(
  moduleId: Phase18ModuleId,
  context: VizMeshBuildContext
): THREE.Object3D[] {
  const { sceneSpec, frame, plan } = context;
  const { vizFrameState } = plan;

  if (moduleId === "viz-packet-flow" || moduleId === "viz-packet-encrypted" || moduleId === "viz-packet-threat") {
    return vizFrameState.packets
      .filter((packet) => packet.moduleId === moduleId)
      .map((packet) => createPacketMesh(moduleId, packet));
  }

  if (moduleId === "viz-tunnel-secure" || moduleId === "viz-tunnel-handshake") {
    return [createTunnelMesh(moduleId, sceneSpec)];
  }

  if (moduleId === "viz-cert-single") {
    return [createCertSingleMeshes(sceneSpec.actors, sceneSpec)];
  }

  if (moduleId === "viz-cert-chain") {
    return [createCertChainMeshes(sceneSpec.actors)];
  }

  if (moduleId === "viz-hud-actor-label") {
    if (plan.visibleActors.length === 0) {
      return [];
    }
    return [createHudActorLabelMeshes(plan.visibleActors, sceneSpec)];
  }

  if (moduleId === "viz-hud-beat-caption") {
    return createHudBeatCaptionMeshes(plan.activeCaption);
  }

  if (moduleId === "viz-hud-packet-id") {
    const packetIds = vizFrameState.packets.map((packet) => packet.id);
    if (packetIds.length === 0) {
      return [];
    }
    return [createHudPacketIdMeshes(packetIds)];
  }

  if (moduleId === "viz-hud-frame-counter") {
    return [createHudFrameCounterMeshes(frame)];
  }

  return [];
}

export function catalogMeshSpecCoverage(): { expected: number; covered: number } {
  const expected = CATALOG_VIZ_MODULE_IDS.length;
  const covered = CATALOG_VIZ_MODULE_IDS.filter((id) => id in VIZ_MESH_SPEC).length;
  return { expected, covered };
}

export function addHeadlessModuleMeshes(scene: THREE.Scene, context: VizMeshBuildContext): void {
  for (const moduleId of context.plan.renderOrder) {
    if (!(CATALOG_VIZ_MODULE_IDS as readonly string[]).includes(moduleId)) {
      continue;
    }
    const meshes = createHeadlessModuleMeshes(moduleId as Phase18ModuleId, context);
    for (const mesh of meshes) {
      scene.add(mesh);
    }
  }
}
