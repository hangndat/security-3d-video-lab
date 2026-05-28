import Ajv from "ajv";

import schema from "./topic-contract.schema.json";
import {
  REQUIRED_TRANSITION_PRESET_IDS,
  validateTransitionPresetPair
} from "./transition-presets.js";
import {
  TOPIC_SEQUENCE,
  type LoadedTopicContract,
  type TopicContractValidationResult,
  type ValidationIssue
} from "./types.js";

const FPS = 30;
const SOFT_DRIFT_RATIO = 0.1;

export function validateTopicContracts(
  loadedContracts: LoadedTopicContract[]
): TopicContractValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateSchema = ajv.compile(schema);

  const byTopic = new Map<string, LoadedTopicContract>();
  for (const loaded of loadedContracts) {
    byTopic.set(loaded.contract.topic, loaded);

    if (!validateSchema(loaded.contract)) {
      for (const issue of validateSchema.errors ?? []) {
        const instancePath = issue.instancePath || "/";
        errors.push({
          path: `${loaded.contractPath}${instancePath}`,
          reason: issue.message ?? "Schema validation failed."
        });
      }
    }

    validateSlug(loaded.contractPath, loaded.contract, errors);
    validateBeatFrames(loaded.contractPath, loaded.contract, errors);
    validatePlaceholderCoverage(loaded.contractPath, loaded.contract, errors);
    validateDurationPolicy(loaded.contractPath, loaded.contract, errors, warnings);
  }

  for (let i = 0; i < TOPIC_SEQUENCE.length; i += 1) {
    const expectedTopic = TOPIC_SEQUENCE[i];
    const current = loadedContracts[i];
    if (!current) {
      errors.push({
        path: "manifest.sequence",
        reason: `Missing topic '${expectedTopic}' in loaded contracts.`
      });
      continue;
    }
    if (current.contract.topic !== expectedTopic) {
      errors.push({
        path: current.contractPath,
        reason: `Topic order mismatch at position ${i}. Expected '${expectedTopic}', got '${current.contract.topic}'.`
      });
    }
  }

  for (const requiredPresetId of REQUIRED_TRANSITION_PRESET_IDS) {
    const hasPreset = loadedContracts.some(
      (loaded) => loaded.contract.transitionToNext?.presetId === requiredPresetId
    );
    if (!hasPreset) {
      errors.push({
        path: "manifest.transitions",
        reason: `Missing required transition preset '${requiredPresetId}'.`
      });
    }
  }

  for (const loaded of loadedContracts) {
    const transition = loaded.contract.transitionToNext;
    if (!transition) {
      continue;
    }

    const presetError = validateTransitionPresetPair(
      transition.presetId,
      loaded.contract.topic,
      transition.toTopic
    );
    if (presetError) {
      errors.push({
        path: `${loaded.contractPath}/transitionToNext/presetId`,
        reason: presetError
      });
    }

    if (!byTopic.has(transition.toTopic)) {
      errors.push({
        path: `${loaded.contractPath}/transitionToNext/toTopic`,
        reason: `Transition target '${transition.toTopic}' is not present in loaded contracts.`
      });
    }
  }

  return { errors, warnings };
}

function validateSlug(
  contractPath: string,
  contract: LoadedTopicContract["contract"],
  errors: ValidationIssue[]
): void {
  if (!contract.slug.startsWith(`${contract.topic}-short-v`)) {
    errors.push({
      path: `${contractPath}/slug`,
      reason: `Slug '${contract.slug}' must follow '${contract.topic}-short-v<major>'.`
    });
  }
}

function validateBeatFrames(
  contractPath: string,
  contract: LoadedTopicContract["contract"],
  errors: ValidationIssue[]
): void {
  const beatIds = new Set<string>();
  for (const beat of contract.storyboardBeats) {
    if (beat.endFrame <= beat.startFrame) {
      errors.push({
        path: `${contractPath}/storyboardBeats/${beat.id}`,
        reason: "Beat endFrame must be greater than startFrame."
      });
    }
    if (beatIds.has(beat.id)) {
      errors.push({
        path: `${contractPath}/storyboardBeats/${beat.id}`,
        reason: `Duplicate beat id '${beat.id}'.`
      });
    }
    beatIds.add(beat.id);
  }
}

function validatePlaceholderCoverage(
  contractPath: string,
  contract: LoadedTopicContract["contract"],
  errors: ValidationIssue[]
): void {
  const beatIds = new Set(contract.storyboardBeats.map((beat) => beat.id));
  const placeholderBeatIds = new Set(contract.narrationPlaceholders.map((item) => item.beatId));

  for (const beatId of beatIds) {
    if (!placeholderBeatIds.has(beatId)) {
      errors.push({
        path: `${contractPath}/narrationPlaceholders`,
        reason: `Missing narration placeholder for beat '${beatId}'.`
      });
    }
  }

  for (const placeholderBeatId of placeholderBeatIds) {
    if (!beatIds.has(placeholderBeatId)) {
      errors.push({
        path: `${contractPath}/narrationPlaceholders/${placeholderBeatId}`,
        reason: `Narration placeholder references unknown beat '${placeholderBeatId}'.`
      });
    }
  }
}

function validateDurationPolicy(
  contractPath: string,
  contract: LoadedTopicContract["contract"],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const beatStart = Math.min(...contract.storyboardBeats.map((beat) => beat.startFrame));
  const beatEnd = Math.max(...contract.storyboardBeats.map((beat) => beat.endFrame));
  const estimatedSeconds = (beatEnd - beatStart) / FPS;

  if (
    contract.durationBudget.minSeconds > contract.durationBudget.targetSeconds ||
    contract.durationBudget.targetSeconds > contract.durationBudget.maxSeconds
  ) {
    errors.push({
      path: `${contractPath}/durationBudget`,
      reason: "Duration budget must satisfy min <= target <= max."
    });
  }

  if (
    estimatedSeconds < contract.durationBudget.minSeconds ||
    estimatedSeconds > contract.durationBudget.maxSeconds
  ) {
    errors.push({
      path: `${contractPath}/durationBudget`,
      reason: `Estimated duration ${estimatedSeconds.toFixed(2)}s falls outside hard range ${contract.durationBudget.minSeconds}-${contract.durationBudget.maxSeconds}s.`
    });
    return;
  }

  const driftRatio = Math.abs(estimatedSeconds - contract.durationBudget.targetSeconds) /
    contract.durationBudget.targetSeconds;
  if (driftRatio > SOFT_DRIFT_RATIO) {
    warnings.push({
      path: `${contractPath}/durationBudget`,
      reason: `Estimated duration ${estimatedSeconds.toFixed(2)}s drifts more than 10% from target ${contract.durationBudget.targetSeconds}s.`
    });
  }
}
