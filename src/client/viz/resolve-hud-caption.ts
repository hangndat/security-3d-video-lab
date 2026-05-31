import type { CaptionTimingEntry, CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";

export function resolveActiveCaption(
  captionMap: CaptionTimingMap | undefined,
  frame: number
): CaptionTimingEntry | null {
  if (!captionMap) {
    return null;
  }

  for (const entry of captionMap.entries) {
    if (frame >= entry.startFrame && frame <= entry.endFrame) {
      return entry;
    }
  }

  return null;
}
