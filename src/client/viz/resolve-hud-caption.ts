import type { CaptionTimingEntry, CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";

export function resolveActiveCaption(
  captionMap: CaptionTimingMap | undefined,
  frame: number,
  options: { topic?: string } = {}
): CaptionTimingEntry | null {
  if (!captionMap) {
    return null;
  }

  const candidates = captionMap.entries.filter((entry) => {
    if (options.topic && entry.topic !== options.topic) {
      return false;
    }
    return frame >= entry.startFrame && frame <= entry.endFrame;
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((latest, entry) =>
    entry.startFrame >= latest.startFrame ? entry : latest
  );
}
