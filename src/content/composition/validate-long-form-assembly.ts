import Ajv from "ajv";

import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import { loadTopicManifest } from "../contracts/load-topic-manifest.js";
import { validateTransitionPresetPair } from "../contracts/transition-presets.js";
import type { ValidationIssue } from "../contracts/types.js";
import assemblySchema from "../assemblies/long-form-assembly.schema.json";
import { validatePacingPresetId } from "./pacing-presets.js";
import type {
  AssemblyBranch,
  BranchTransitionOverride,
  LongFormAssemblyProfile
} from "./load-long-form-assembly.js";

export interface LongFormAssemblyValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

function validateSequence(
  sequence: string[],
  sequencePath: string,
  transitionOverrides: BranchTransitionOverride[],
  contractsByTopic: Map<string, ReturnType<typeof loadTopicContracts>[number]>,
  manifestRank: Map<string, number>,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const seen = new Set<string>();
  const overrideByPair = new Map(
    transitionOverrides.map((entry) => [`${entry.fromTopic}->${entry.toTopic}`, entry])
  );

  for (const topic of sequence) {
    if (!manifestRank.has(topic)) {
      errors.push({
        path: sequencePath,
        reason: `Topic '${topic}' is not present in manifest order.`
      });
      continue;
    }
    if (seen.has(topic)) {
      errors.push({
        path: sequencePath,
        reason: `Duplicate topic '${topic}' in assembly sequence.`
      });
    }
    seen.add(topic);
  }

  let lastRank = -1;
  for (const topic of sequence) {
    const rank = manifestRank.get(topic);
    if (rank === undefined) {
      continue;
    }
    if (rank < lastRank) {
      errors.push({
        path: sequencePath,
        reason: `Topic '${topic}' breaks manifest-locked ordering.`
      });
    }
    lastRank = rank;
  }

  for (let index = 0; index < sequence.length - 1; index += 1) {
    const fromTopic = sequence[index]!;
    const toTopic = sequence[index + 1]!;
    const override = overrideByPair.get(`${fromTopic}->${toTopic}`);

    if (override) {
      const presetError = validateTransitionPresetPair(
        override.presetId,
        fromTopic as never,
        toTopic as never
      );
      if (presetError) {
        errors.push({
          path: `${sequencePath}/transitionOverrides`,
          reason: presetError
        });
      }
      continue;
    }

    const source = contractsByTopic.get(fromTopic);
    if (!source) {
      errors.push({
        path: sequencePath,
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

  for (const topic of sequence) {
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
}

function validateBranch(
  branch: AssemblyBranch,
  branchPath: string,
  contractsByTopic: Map<string, ReturnType<typeof loadTopicContracts>[number]>,
  manifestRank: Map<string, number>,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  validateSequence(
    branch.sequence,
    `${branchPath}/sequence`,
    branch.transitionOverrides ?? [],
    contractsByTopic,
    manifestRank,
    errors,
    warnings
  );
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
  const contracts = loadTopicContracts();
  const contractsByTopic = new Map(contracts.map((entry) => [entry.contract.topic, entry]));

  if (profile.branches && profile.branches.length > 0) {
    if (!profile.defaultBranchId) {
      errors.push({
        path: `${assemblyPath}/defaultBranchId`,
        reason: "defaultBranchId is required when branches are declared."
      });
    } else if (!profile.branches.some((branch) => branch.id === profile.defaultBranchId)) {
      errors.push({
        path: `${assemblyPath}/defaultBranchId`,
        reason: `defaultBranchId '${profile.defaultBranchId}' does not match any branch id.`
      });
    }

    for (let index = 0; index < profile.branches.length; index += 1) {
      validateBranch(
        profile.branches[index]!,
        `${assemblyPath}/branches/${index}`,
        contractsByTopic,
        manifestRank,
        errors,
        warnings
      );
    }
  } else if (profile.sequence) {
    validateSequence(
      profile.sequence,
      `${assemblyPath}/sequence`,
      [],
      contractsByTopic,
      manifestRank,
      errors,
      warnings
    );
  }

  return { errors, warnings };
}
