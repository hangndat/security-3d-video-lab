import { createCanvas, Image } from "canvas";

import { STYLE_TOKENS } from "../../client/viz/style-tokens.js";

const CAPTION_BAR_HEIGHT = 80;
const CAPTION_FONT_SIZE = 17;
const CAPTION_LINE_HEIGHT = 22;
const CAPTION_PADDING_X = 14;
const CAPTION_PADDING_Y = 10;
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
  trimmed[CAPTION_MAX_LINES - 1] = `${trimmed[CAPTION_MAX_LINES - 1]!.slice(0, 48)}…`;
  return trimmed;
}

export function compositeCaptionOnPng(
  pngBuffer: Buffer,
  scriptIntent: string,
  width: number,
  height: number
): Buffer {
  const image = new Image();
  image.src = pngBuffer;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);

  const barTop = height - CAPTION_BAR_HEIGHT;
  ctx.fillStyle = STYLE_TOKENS.colorBgPanel;
  ctx.globalAlpha = 0.94;
  ctx.fillRect(0, barTop, width, CAPTION_BAR_HEIGHT);
  ctx.globalAlpha = 1;

  ctx.fillStyle = STYLE_TOKENS.colorTextPrimary;
  ctx.font = `bold ${CAPTION_FONT_SIZE}px Arial, Helvetica, sans-serif`;
  ctx.textBaseline = "top";

  const maxTextWidth = width - CAPTION_PADDING_X * 2;
  const lines = wrapCaptionLines(ctx, scriptIntent, maxTextWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, CAPTION_PADDING_X, barTop + CAPTION_PADDING_Y + index * CAPTION_LINE_HEIGHT);
  });

  return canvas.toBuffer("image/png");
}
