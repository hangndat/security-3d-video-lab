import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { stitchSceneSpecsInOrder } from "../../render/remotion/render-composition.js";
import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import type { TopicId } from "../contracts/types.js";
import { loadLongFormAssemblyProfile } from "./load-long-form-assembly.js";
import { validateLongFormAssemblyProfile } from "./validate-long-form-assembly.js";

export interface LongFormTransition {
  fromTopic: TopicId;
  toTopic: TopicId;
  rationale: string;
  presetId: string;
}

export interface LongFormAssembly {
  slug: string;
  sequence: TopicId[];
  transitions: LongFormTransition[];
  targetWindowMinutes: {
    min: number;
    max: number;
  };
  defaultPacingPresetId?: string;
}

function buildTransitionsForSequence(sequence: TopicId[]): LongFormTransition[] {
  const contracts = loadTopicContracts();
  const byTopic = new Map(contracts.map((entry) => [entry.contract.topic, entry.contract]));

  return sequence
    .slice(0, -1)
    .map((fromTopic, index) => {
      const toTopic = sequence[index + 1]!;
      const contract = byTopic.get(fromTopic);
      const transition = contract?.transitionToNext;
      if (!transition) {
        throw new Error(`Missing transitionToNext for ${fromTopic}->${toTopic}.`);
      }
      return {
        fromTopic,
        toTopic,
        rationale: transition.rationale,
        presetId: transition.presetId
      };
    });
}

export function loadLongFormAssembly(slug: string): LongFormAssembly {
  const profile = loadLongFormAssemblyProfile(slug);
  const assemblyPath = `src/content/assemblies/${slug}.json`;
  const validation = validateLongFormAssemblyProfile(profile, assemblyPath);
  if (validation.errors.length > 0) {
    const detail = validation.errors.map((issue) => `${issue.path}: ${issue.reason}`).join("\n");
    throw new Error(`Long-form assembly '${slug}' is invalid:\n${detail}`);
  }

  const sequence = profile.sequence as TopicId[];
  return {
    slug: profile.slug,
    sequence,
    transitions: buildTransitionsForSequence(sequence),
    targetWindowMinutes: profile.targetWindowMinutes,
    defaultPacingPresetId: profile.defaultPacingPresetId
  };
}

export function validateLongFormTransitionCoherence(
  assembly: LongFormAssembly = loadLongFormAssembly("network-foundations-long-v1")
): void {
  const expectedPairs = assembly.sequence
    .slice(0, -1)
    .map((fromTopic, index) => `${fromTopic}->${assembly.sequence[index + 1]}`);
  const actualPairs = assembly.transitions.map(
    (transition) => `${transition.fromTopic}->${transition.toTopic}`
  );

  for (const pair of expectedPairs) {
    if (!actualPairs.includes(pair)) {
      throw new Error(`Missing long-form transition coherence link: ${pair}.`);
    }
  }
}

export function buildLongFormSceneSpec(
  assemblySlug: string,
  topicScenes: Partial<Record<TopicId, SceneSpec>>
): SceneSpec {
  const assembly = loadLongFormAssembly(assemblySlug);
  validateLongFormTransitionCoherence(assembly);

  const orderedScenes = assembly.sequence.map((topic) => {
    const scene = topicScenes[topic];
    if (!scene) {
      throw new Error(`Missing scene for required topic '${topic}' in assembly '${assemblySlug}'.`);
    }
    return { topic, scene };
  });

  return stitchSceneSpecsInOrder(orderedScenes, assembly.slug);
}

/** @deprecated Use buildLongFormSceneSpec(assemblySlug, topicScenes) */
export function buildLongFormSceneSpecFromAssembly(
  assembly: LongFormAssembly,
  topicScenes: Record<TopicId, SceneSpec>
): SceneSpec {
  validateLongFormTransitionCoherence(assembly);
  const orderedScenes = assembly.sequence.map((topic) => {
    const scene = topicScenes[topic];
    if (!scene) {
      throw new Error(`Missing scene for required topic '${topic}'.`);
    }
    return { topic, scene };
  });
  return stitchSceneSpecsInOrder(orderedScenes, assembly.slug);
}
