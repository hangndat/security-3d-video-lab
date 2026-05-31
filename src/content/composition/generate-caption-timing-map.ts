import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import type { TopicContract, TopicId } from "../contracts/types.js";
import { computeAssemblyFrameOffsets, computeTopicFrameSpan } from "./frame-offsets.js";
import { loadLongFormAssemblyProfile, resolveBranch } from "./load-long-form-assembly.js";

export const CAPTION_FPS = 30;

export interface CaptionTimingEntry {
  topic: string;
  beatId: string;
  startFrame: number;
  endFrame: number;
  startSeconds: number;
  endSeconds: number;
  scriptIntent: string;
  analyticKey: string;
}

export interface CaptionTimingMap {
  schemaVersion: "1.0.0";
  assemblySlug: string;
  fps: number;
  entries: CaptionTimingEntry[];
}

function framesToSeconds(frame: number): number {
  return Number((frame / CAPTION_FPS).toFixed(2));
}

function contractByTopic(contracts: ReturnType<typeof loadTopicContracts>): Map<string, TopicContract> {
  return new Map(contracts.map((entry) => [entry.contract.topic, entry.contract]));
}

export function generateCaptionTimingMap(
  assemblySlug: string,
  topicScenes: Partial<Record<TopicId, SceneSpec>> = {}
): CaptionTimingMap {
  const profile = loadLongFormAssemblyProfile(assemblySlug);
  const { sequence } = resolveBranch(profile);
  const contracts = contractByTopic(loadTopicContracts());
  const spansByTopic: Record<string, number> = {};

  for (const topic of sequence) {
    const contract = contracts.get(topic);
    if (!contract) {
      throw new Error(`Missing topic contract for '${topic}' while generating caption map.`);
    }
    spansByTopic[topic] = computeTopicFrameSpan(contract, topicScenes[topic as TopicId]);
  }

  const offsets = computeAssemblyFrameOffsets(sequence, spansByTopic);
  const entries: CaptionTimingEntry[] = [];

  for (const topic of sequence) {
    const contract = contracts.get(topic)!;
    const frameOffset = offsets.get(topic) ?? 0;
    const placeholders = new Map(
      contract.narrationPlaceholders.map((item) => [item.beatId, item])
    );

    for (const beat of contract.storyboardBeats) {
      const placeholder = placeholders.get(beat.id);
      if (!placeholder) {
        throw new Error(`Missing narration placeholder for beat '${beat.id}' in topic '${topic}'.`);
      }

      const startFrame = beat.startFrame + frameOffset;
      const endFrame = beat.endFrame + frameOffset;
      entries.push({
        topic,
        beatId: beat.id,
        startFrame,
        endFrame,
        startSeconds: framesToSeconds(startFrame),
        endSeconds: framesToSeconds(endFrame),
        scriptIntent: placeholder.scriptIntent,
        analyticKey: placeholder.analyticKey
      });
    }
  }

  return {
    schemaVersion: "1.0.0",
    assemblySlug: profile.slug,
    fps: CAPTION_FPS,
    entries
  };
}
