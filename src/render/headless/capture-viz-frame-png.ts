import { render as renderHeadlessPng } from "@headless-three/renderer";

import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { buildVizThreeScene } from "./build-viz-three-scene.js";

export type CaptureVizFramePngOptions = {
  width?: number;
  height?: number;
  captionMap?: CaptionTimingMap;
};

export function captureVizFramePng(
  sceneSpec: SceneSpec,
  frame: number,
  options: CaptureVizFramePngOptions = {}
): Buffer {
  const width = options.width ?? 640;
  const height = options.height ?? 360;
  const { scene, camera } = buildVizThreeScene(
    sceneSpec,
    frame,
    width,
    height,
    options.captionMap
  );

  return renderHeadlessPng(scene, camera, {
    width,
    height,
    background: scene.background as import("three").Color
  });
}
