import * as THREE from "three";

import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { getComposePlan, type ComposePlan } from "../../client/viz/compose-scene.js";
import type { VizPacketRenderState } from "../../client/viz/build-viz-frame-state.js";
import { STYLE_TOKENS } from "../../client/viz/style-tokens.js";

export type VizThreeSceneBundle = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  plan: ComposePlan;
};

function hexColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function addPacketSphere(
  scene: THREE.Scene,
  packet: VizPacketRenderState,
  colorHex: string,
  radius: number,
  emissiveIntensity: number
): void {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({
      color: hexColor(colorHex),
      emissive: hexColor(colorHex),
      emissiveIntensity,
      transparent: true,
      opacity: packet.dimmed ? 0.35 : 1
    })
  );
  mesh.position.set(packet.position.x, packet.position.y, packet.position.z);
  scene.add(mesh);
}

function addTunnelTorus(
  scene: THREE.Scene,
  colorHex: string,
  tube: number,
  emissiveIntensity: number,
  wireframe: boolean
): void {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, tube, 16, 48),
    new THREE.MeshStandardMaterial({
      color: hexColor(colorHex),
      emissive: hexColor(colorHex),
      emissiveIntensity,
      transparent: !wireframe,
      opacity: wireframe ? 1 : 0.85,
      wireframe
    })
  );
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

function findPacketForModule(
  packets: VizPacketRenderState[],
  moduleId: string
): VizPacketRenderState | undefined {
  return packets.find((packet) => packet.moduleId === moduleId);
}

function addModuleMeshes(scene: THREE.Scene, plan: ComposePlan): void {
  const { vizFrameState, renderOrder } = plan;

  for (const moduleId of renderOrder) {
    if (moduleId === "viz-packet-flow") {
      const packet = findPacketForModule(vizFrameState.packets, moduleId);
      if (packet) {
        addPacketSphere(
          scene,
          packet,
          STYLE_TOKENS.colorAccentData,
          0.15,
          STYLE_TOKENS.lightAccentGlowOpacity
        );
      }
      continue;
    }

    if (moduleId === "viz-packet-threat") {
      const packet = findPacketForModule(vizFrameState.packets, moduleId);
      if (packet) {
        addPacketSphere(
          scene,
          packet,
          STYLE_TOKENS.colorAccentThreat,
          0.18,
          STYLE_TOKENS.lightThreatPulseOpacity
        );
      }
      continue;
    }

    if (moduleId === "viz-packet-encrypted") {
      const packet = findPacketForModule(vizFrameState.packets, moduleId);
      if (packet) {
        addPacketSphere(
          scene,
          packet,
          STYLE_TOKENS.colorAccentCyan,
          0.15,
          STYLE_TOKENS.lightAccentGlowOpacity
        );
      }
      continue;
    }

    if (moduleId === "viz-tunnel-secure") {
      addTunnelTorus(scene, STYLE_TOKENS.colorAccentCyan, 0.12, STYLE_TOKENS.lightAccentGlowOpacity, false);
      continue;
    }

    if (moduleId === "viz-tunnel-handshake") {
      addTunnelTorus(
        scene,
        STYLE_TOKENS.colorAccentData,
        0.08,
        STYLE_TOKENS.lightRimIntensity * 0.5,
        true
      );
    }

    // Cert/HUD modules deferred to Phase 22 scene builder parity.
  }
}

export function buildVizThreeScene(
  sceneSpec: SceneSpec,
  frame: number,
  width: number,
  height: number,
  captionMap?: CaptionTimingMap
): VizThreeSceneBundle {
  const plan = getComposePlan(
    sceneSpec,
    frame,
    captionMap === undefined ? {} : { captionMap }
  );
  const scene = new THREE.Scene();
  scene.background = hexColor(STYLE_TOKENS.colorBgDeep);

  const camera = new THREE.PerspectiveCamera(
    STYLE_TOKENS.cameraFovIntimate,
    width / height,
    0.1,
    100
  );
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  addModuleMeshes(scene, plan);

  return { scene, camera, plan };
}
