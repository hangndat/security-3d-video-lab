import { render as renderHeadlessPng } from "@headless-three/renderer";

import { resolveActiveCaption } from "../../client/viz/resolve-hud-caption.js";
import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { compositeCaptionOnPng } from "./composite-caption-on-png.js";
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

  let pngBuffer = renderHeadlessPng(scene, camera, {
    width,
    height,
    background: scene.background as import("three").Color
  });

  const activeCaption = resolveActiveCaption(options.captionMap, frame);
  if (activeCaption?.scriptIntent) {
    pngBuffer = compositeCaptionOnPng(pngBuffer, activeCaption.scriptIntent, width, height);
  }

  return pngBuffer;
}
