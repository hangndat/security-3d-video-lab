import Ajv from "ajv";

import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../contracts/load-topic-manifest.js";
import { validateTransitionPresetPair } from "../contracts/transition-presets.js";
import type { ValidationIssue } from "../contracts/types.js";
import assemblySchema from "../assemblies/long-form-assembly.schema.json";
import { validatePacingPresetId } from "./pacing-presets.js";
import type { LongFormAssemblyProfile } from "./load-long-form-assembly.js";

export interface LongFormAssemblyValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export function validateLongFormAssemblyProfile(
  profile: LongFormAssemblyProfile,
  assemblyPath: string
): LongFormAssemblyValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateSchema = ajv.compile(assemblySchema);

  if (!validateSchema(profile)) {
    for (const issue of validateSchema.errors ?? []) {
      const instancePath = issue.instancePath || "/";
      errors.push({
        path: `${assemblyPath}${instancePath}`,
        reason: issue.message ?? "Schema validation failed."
      });
    }
  }

  if (profile.targetWindowMinutes.min > profile.targetWindowMinutes.max) {
    errors.push({
      path: `${assemblyPath}/targetWindowMinutes`,
      reason: "targetWindowMinutes.min must be <= max."
    });
  }

  if (profile.defaultPacingPresetId) {
    const pacingError = validatePacingPresetId(profile.defaultPacingPresetId);
    if (pacingError) {
      errors.push({
        path: `${assemblyPath}/defaultPacingPresetId`,
        reason: pacingError
      });
    }
  }

  const manifest = loadTopicManifest();
  const manifestRank = new Map(manifest.order.map((topic, index) => [topic, index]));
  const seen = new Set<string>();

  for (const topic of profile.sequence) {
    if (!manifestRank.has(topic)) {
      errors.push({
        path: `${assemblyPath}/sequence`,
        reason: `Topic '${topic}' is not present in manifest order.`
      });
      continue;
    }
    if (seen.has(topic)) {
      errors.push({
        path: `${assemblyPath}/sequence`,
        reason: `Duplicate topic '${topic}' in assembly sequence.`
      });
    }
    seen.add(topic);
  }

  let lastRank = -1;
  for (const topic of profile.sequence) {
    const rank = manifestRank.get(topic);
    if (rank === undefined) {
      continue;
    }
    if (rank < lastRank) {
      errors.push({
        path: `${assemblyPath}/sequence`,
        reason: `Topic '${topic}' breaks manifest-locked ordering.`
      });
    }
    lastRank = rank;
  }

  const contracts = loadTopicContracts();
  const contractsByTopic = new Map(contracts.map((entry) => [entry.contract.topic, entry]));

  for (let index = 0; index < profile.sequence.length - 1; index += 1) {
    const fromTopic = profile.sequence[index]!;
    const toTopic = profile.sequence[index + 1]!;
    const source = contractsByTopic.get(fromTopic);

    if (!source) {
      errors.push({
        path: `${assemblyPath}/sequence`,
        reason: `Missing topic contract for '${fromTopic}'.`
      });
      continue;
    }

    const transition = source.contract.transitionToNext;
    if (!transition) {
      errors.push({
        path: source.contractPath,
        reason: `Missing transitionToNext for '${fromTopic}' -> '${toTopic}'.`
      });
      continue;
    }

    if (transition.toTopic !== toTopic) {
      errors.push({
        path: `${source.contractPath}/transitionToNext/toTopic`,
        reason: `Expected transition target '${toTopic}', got '${transition.toTopic}'.`
      });
    }

    const presetError = validateTransitionPresetPair(
      transition.presetId,
      fromTopic as never,
      toTopic as never
    );
    if (presetError) {
      errors.push({
        path: `${source.contractPath}/transitionToNext/presetId`,
        reason: presetError
      });
    }
  }

  for (const topic of profile.sequence) {
    const contract = contractsByTopic.get(topic)?.contract;
    if (!contract?.pacingPresetId) {
      warnings.push({
        path: contractsByTopic.get(topic)?.contractPath ?? topic,
        reason: `Optional pacingPresetId is not set for topic '${topic}'.`
      });
      continue;
    }
    const pacingError = validatePacingPresetId(contract.pacingPresetId);
    if (pacingError) {
      errors.push({
        path: `${contractsByTopic.get(topic)!.contractPath}/pacingPresetId`,
        reason: pacingError
      });
    }
  }

  return { errors, warnings };
}
