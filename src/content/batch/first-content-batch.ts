import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import { validateTopicContracts } from "../contracts/validate-topic-contracts.js";
import {
  buildLongFormSceneSpec as buildAssemblyLongFormSceneSpec,
  loadLongFormAssembly,
  validateLongFormTransitionCoherence,
  type LongFormAssembly
} from "../composition/build-long-form-scene-spec.js";
import {
  FIRST_CONTENT_BATCH_TOPICS,
  type LoadedTopicContract,
  type DurationBudgetContract,
  type NarrationPlaceholderContract,
  type StoryboardBeatContract,
  type TopicContract,
  type TopicId
} from "../contracts/types.js";

export type TopicPacket = TopicContract;
export type StoryboardBeat = StoryboardBeatContract;
export type DurationBudget = DurationBudgetContract;
export type NarrationPlaceholder = NarrationPlaceholderContract;
export type { LongFormAssembly };

export type PacingVerdict = "too_fast" | "balanced" | "too_slow";

export interface KpiCapture {
  assetId: string;
  retentionCheckpoints: {
    p25: number | null;
    p50: number | null;
    p75: number | null;
    completion: number | null;
  };
  feedbackTags: string[];
  pacingVerdict: PacingVerdict | null;
  notes: string;
}

export interface KpiCaptureUpdate {
  retentionCheckpoints?: Partial<KpiCapture["retentionCheckpoints"]>;
  feedbackTags?: string[];
  pacingVerdict?: PacingVerdict;
  notes?: string;
}

function normalizeBeats(beats: StoryboardBeat[]): StoryboardBeat[] {
  return [...beats].sort((left, right) => left.startFrame - right.startFrame);
}

const loadedContracts = loadTopicContracts();

function selectBatchContracts(contracts: LoadedTopicContract[]): LoadedTopicContract[] {
  return contracts.filter(({ contract }) =>
    (FIRST_CONTENT_BATCH_TOPICS as readonly string[]).includes(contract.topic)
  );
}

function validateBatchContracts(contracts: LoadedTopicContract[] = loadedContracts) {
  const batchContracts = selectBatchContracts(contracts);
  return validateTopicContracts(batchContracts, [...FIRST_CONTENT_BATCH_TOPICS]);
}

const batchContractValidation = validateBatchContracts();
if (batchContractValidation.errors.length > 0) {
  const detail = batchContractValidation.errors
    .map((issue) => `${issue.path}: ${issue.reason}`)
    .join("\n");
  throw new Error(`First content batch topic contracts are invalid:\n${detail}`);
}

export const firstContentBatchPackets: TopicPacket[] = loadedContracts
  .filter(({ contract }) =>
    (FIRST_CONTENT_BATCH_TOPICS as readonly string[]).includes(contract.topic)
  )
  .map(({ contract }) => ({
    ...contract,
    storyboardBeats: normalizeBeats(contract.storyboardBeats)
  })) as TopicPacket[];

export const longFormAssembly: LongFormAssembly = loadLongFormAssembly("network-foundations-long-v1");

export const narrationPlaceholders: NarrationPlaceholder[] = firstContentBatchPackets.flatMap(
  (packet) => packet.narrationPlaceholders
);

export function createKpiCaptureSkeleton(assetId: string): KpiCapture {
  return {
    assetId,
    retentionCheckpoints: {
      p25: null,
      p50: null,
      p75: null,
      completion: null
    },
    feedbackTags: [],
    pacingVerdict: null,
    notes: ""
  };
}

export function populateKpiCapture(kpi: KpiCapture, update: KpiCaptureUpdate): KpiCapture {
  return {
    ...kpi,
    retentionCheckpoints: {
      ...kpi.retentionCheckpoints,
      ...(update.retentionCheckpoints ?? {})
    },
    feedbackTags: update.feedbackTags ? [...update.feedbackTags] : kpi.feedbackTags,
    pacingVerdict: update.pacingVerdict ?? kpi.pacingVerdict,
    notes: update.notes ?? kpi.notes
  };
}

export function validateKpiCaptureCompleteness(kpi: KpiCapture): void {
  const retention = kpi.retentionCheckpoints;
  if (retention.p25 === null) {
    throw new Error("KPI retention checkpoint p25 must be non-null.");
  }
  if (retention.p50 === null) {
    throw new Error("KPI retention checkpoint p50 must be non-null.");
  }
  if (retention.p75 === null) {
    throw new Error("KPI retention checkpoint p75 must be non-null.");
  }
  if (retention.completion === null) {
    throw new Error("KPI retention checkpoint completion must be non-null.");
  }
  if (!kpi.pacingVerdict || !["too_fast", "balanced", "too_slow"].includes(kpi.pacingVerdict)) {
    throw new Error("KPI pacing verdict must be one of: too_fast, balanced, too_slow.");
  }
}

export { validateLongFormTransitionCoherence };

export function buildLongFormSceneSpec(topicScenes: Record<TopicId, SceneSpec>): SceneSpec {
  return buildAssemblyLongFormSceneSpec("network-foundations-long-v1", topicScenes);
}

export function validateBatchCompleteness(kpiCaptures: KpiCapture[] = []): string[] {
  const errors: string[] = [];

  for (const issue of validateBatchContracts().errors) {
    errors.push(`${issue.path}: ${issue.reason}`);
  }

  const topics = firstContentBatchPackets.map((packet) => packet.topic);
  if (topics.join(",") !== "tls,ssh,dns") {
    errors.push("Topic packets must follow TLS -> SSH -> DNS order.");
  }

  for (const packet of firstContentBatchPackets) {
    if (packet.storyboardBeats.length === 0) {
      errors.push(`Topic ${packet.topic} has no storyboard beats.`);
    }
    for (const beat of packet.storyboardBeats) {
      const placeholder = narrationPlaceholders.find((item) => item.beatId === beat.id);
      if (!placeholder) {
        errors.push(`Missing narration placeholder for ${beat.id}.`);
      }
    }
  }

  if (longFormAssembly.sequence.join(",") !== "tls,ssh,dns") {
    errors.push("Long-form sequence must be TLS -> SSH -> DNS.");
  }
  try {
    validateLongFormTransitionCoherence(longFormAssembly);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Long-form transitions are invalid.");
  }
  if (longFormAssembly.targetWindowMinutes.min < 4 || longFormAssembly.targetWindowMinutes.max > 6) {
    errors.push("Long-form duration window must stay within 4-6 minutes.");
  }

  for (const capture of kpiCaptures) {
    try {
      validateKpiCaptureCompleteness(capture);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown KPI completeness failure.";
      errors.push(`Asset ${capture.assetId} failed KPI acceptance: ${detail}`);
    }
  }

  return errors;
}
