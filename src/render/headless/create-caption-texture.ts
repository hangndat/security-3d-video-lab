import { createCanvas } from "canvas";
import * as THREE from "three";

import { STYLE_TOKENS } from "../../client/viz/style-tokens.js";

const CAPTION_TEXTURE_WIDTH = 512;
const CAPTION_TEXTURE_HEIGHT = 72;
const CAPTION_FONT_SIZE = 13;
const CAPTION_LINE_HEIGHT = 16;
const CAPTION_PADDING_X = 10;
const CAPTION_PADDING_Y = 8;
const CAPTION_MAX_LINES = 3;

function wrapCaptionLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let current = words[0]!;

  for (let index = 1; index < words.length; index += 1) {
    const word = words[index]!;
    const candidate = `${current} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);

  if (lines.length <= CAPTION_MAX_LINES) {
    return lines;
  }

  const trimmed = lines.slice(0, CAPTION_MAX_LINES);
  trimmed[CAPTION_MAX_LINES - 1] = `${trimmed[CAPTION_MAX_LINES - 1]!.slice(0, 42)}…`;
  return trimmed;
}

export function createHudLabelTexture(label: string): THREE.CanvasTexture {
  const canvas = createCanvas(256, 40);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = STYLE_TOKENS.colorBgPanel;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, 0, 256, 40);
  ctx.globalAlpha = 1;

  ctx.fillStyle = STYLE_TOKENS.colorTextPrimary;
  ctx.font = `bold 14px ${STYLE_TOKENS.fontHud.replaceAll('"', "")}`;
  ctx.textBaseline = "middle";
  ctx.fillText(label, 10, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createCaptionTexture(scriptIntent: string): THREE.CanvasTexture {
  const canvas = createCanvas(CAPTION_TEXTURE_WIDTH, CAPTION_TEXTURE_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = STYLE_TOKENS.colorBgPanel;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(0, 0, CAPTION_TEXTURE_WIDTH, CAPTION_TEXTURE_HEIGHT);
  ctx.globalAlpha = 1;

  ctx.fillStyle = STYLE_TOKENS.colorTextPrimary;
  ctx.font = `${CAPTION_FONT_SIZE}px ${STYLE_TOKENS.fontHud.replaceAll('"', "")}`;
  ctx.textBaseline = "top";

  const maxTextWidth = CAPTION_TEXTURE_WIDTH - CAPTION_PADDING_X * 2;
  const lines = wrapCaptionLines(ctx, scriptIntent, maxTextWidth);

  lines.forEach((line, index) => {
    ctx.fillText(line, CAPTION_PADDING_X, CAPTION_PADDING_Y + index * CAPTION_LINE_HEIGHT);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
