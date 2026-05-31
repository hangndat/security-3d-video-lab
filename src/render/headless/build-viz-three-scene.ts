import * as THREE from "three";

import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { getComposePlan, type ComposePlan } from "../../client/viz/compose-scene.js";
import { STYLE_TOKENS } from "../../client/viz/style-tokens.js";
import {
  addHeadlessModuleMeshes,
  type VizMeshBuildContext
} from "../../client/viz/viz-mesh-spec.js";

export type VizThreeSceneBundle = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  plan: ComposePlan;
};

function hexColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function applySceneLighting(scene: THREE.Scene): void {
  scene.add(
    new THREE.AmbientLight(
      hexColor(STYLE_TOKENS.lightAmbientColor),
      STYLE_TOKENS.lightAmbientIntensity
    )
  );
  const keyLight = new THREE.DirectionalLight(
    hexColor(STYLE_TOKENS.colorTextPrimary),
    STYLE_TOKENS.lightKeyIntensity
  );
  keyLight.position.set(
    STYLE_TOKENS.keyLightPosition[0],
    STYLE_TOKENS.keyLightPosition[1],
    STYLE_TOKENS.keyLightPosition[2]
  );
  scene.add(keyLight);
}

function applySceneCamera(camera: THREE.PerspectiveCamera): void {
  camera.position.set(
    STYLE_TOKENS.cameraPositionDefault[0],
    STYLE_TOKENS.cameraPositionDefault[1],
    STYLE_TOKENS.cameraPositionDefault[2]
  );
  camera.lookAt(0, 0, 0);
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
  applySceneCamera(camera);
  applySceneLighting(scene);

  const context: VizMeshBuildContext = { sceneSpec, frame, plan };
  addHeadlessModuleMeshes(scene, context);

  return { scene, camera, plan };
}

export function countSceneMeshes(scene: THREE.Scene): number {
  let count = 0;
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      count += 1;
    }
  });
  return count;
}
