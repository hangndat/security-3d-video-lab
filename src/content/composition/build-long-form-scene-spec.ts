import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { stitchSceneSpecsInOrder } from "../../render/remotion/render-composition.js";
import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import type { TopicId } from "../contracts/types.js";
import {
  loadLongFormAssemblyProfile,
  resolveBranch,
  type BranchTransitionOverride
} from "./load-long-form-assembly.js";
import { validateLongFormAssemblyProfile } from "./validate-long-form-assembly.js";

export interface LongFormTransition {
  fromTopic: TopicId;
  toTopic: TopicId;
  rationale: string;
  presetId: string;
}

export interface LongFormAssembly {
  slug: string;
  branchId?: string;
  sequence: TopicId[];
  transitions: LongFormTransition[];
  targetWindowMinutes: {
    min: number;
    max: number;
  };
  defaultPacingPresetId?: string;
}

function buildTransitionsForSequence(
  sequence: TopicId[],
  transitionOverrides: BranchTransitionOverride[] = []
): LongFormTransition[] {
  const contracts = loadTopicContracts();
  const byTopic = new Map(contracts.map((entry) => [entry.contract.topic, entry.contract]));
  const overrideByPair = new Map(
    transitionOverrides.map((entry) => [`${entry.fromTopic}->${entry.toTopic}`, entry])
  );

  return sequence.slice(0, -1).map((fromTopic, index) => {
    const toTopic = sequence[index + 1]!;
    const override = overrideByPair.get(`${fromTopic}->${toTopic}`);

    if (override) {
      return {
        fromTopic,
        toTopic,
        rationale: override.rationale,
        presetId: override.presetId
      };
    }

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

export function loadLongFormAssembly(slug: string, branchId?: string): LongFormAssembly {
  const profile = loadLongFormAssemblyProfile(slug);
  const assemblyPath = `src/content/assemblies/${slug}.json`;
  const validation = validateLongFormAssemblyProfile(profile, assemblyPath);
  if (validation.errors.length > 0) {
    const detail = validation.errors.map((issue) => `${issue.path}: ${issue.reason}`).join("\n");
    throw new Error(`Long-form assembly '${slug}' is invalid:\n${detail}`);
  }

  const resolved = resolveBranch(profile, branchId);
  const sequence = resolved.sequence as TopicId[];

  return {
    slug: profile.slug,
    branchId: resolved.branchId,
    sequence,
    transitions: buildTransitionsForSequence(sequence, resolved.transitionOverrides),
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

export interface BuildLongFormSceneSpecOptions {
  branchId?: string;
}

export function buildLongFormSceneSpec(
  assemblySlug: string,
  topicScenes: Partial<Record<TopicId, SceneSpec>>,
  options?: BuildLongFormSceneSpecOptions
): SceneSpec {
  const assembly = loadLongFormAssembly(assemblySlug, options?.branchId);
  validateLongFormTransitionCoherence(assembly);

  const orderedScenes = assembly.sequence.map((topic) => {
    const scene = topicScenes[topic];
    if (!scene) {
      throw new Error(`Missing scene for required topic '${topic}' in assembly '${assemblySlug}'.`);
    }
    return { topic, scene };
  });

  const stitchedSceneId = assembly.branchId
    ? `${assembly.slug}:${assembly.branchId}`
    : assembly.slug;

  return stitchSceneSpecsInOrder(orderedScenes, stitchedSceneId);
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
  const stitchedSceneId = assembly.branchId
    ? `${assembly.slug}:${assembly.branchId}`
    : assembly.slug;
  return stitchSceneSpecsInOrder(orderedScenes, stitchedSceneId);
}
