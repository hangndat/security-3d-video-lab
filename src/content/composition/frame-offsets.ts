import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import type { TopicContract } from "../contracts/types.js";

export function computeTopicFrameSpan(contract: TopicContract, scene?: SceneSpec): number {
  if (scene) {
    return scene.totalFrames;
  }
  if (contract.storyboardBeats.length === 0) {
    return 1;
  }
  return Math.max(...contract.storyboardBeats.map((beat) => beat.endFrame));
}

export function computeAssemblyFrameOffsets(
  sequence: readonly string[],
  spansByTopic: Record<string, number>
): Map<string, number> {
  const offsets = new Map<string, number>();
  let cursor = 0;

  for (const topic of sequence) {
    offsets.set(topic, cursor);
    cursor += spansByTopic[topic] ?? 0;
  }

  return offsets;
}
