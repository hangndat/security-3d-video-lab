import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { stitchSceneSpecsInOrder } from "../../render/remotion/render-composition.js";
import { loadTopicContracts } from "../contracts/load-topic-contracts.js";
import { validateTopicContracts } from "../contracts/validate-topic-contracts.js";
import type {
  DurationBudgetContract,
  NarrationPlaceholderContract,
  StoryboardBeatContract,
  TopicContract,
  TopicId
} from "../contracts/types.js";

export type TopicPacket = TopicContract;
export type StoryboardBeat = StoryboardBeatContract;
export type DurationBudget = DurationBudgetContract;
export type NarrationPlaceholder = NarrationPlaceholderContract;

export interface LongFormAssembly {
  slug: "network-foundations-long-v1";
  sequence: TopicId[];
  transitions: Array<{
    fromTopic: TopicId;
    toTopic: TopicId;
    rationale: string;
    presetId: string;
  }>;
  targetWindowMinutes: {
    min: number;
    max: number;
  };
}

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
const contractValidation = validateTopicContracts(loadedContracts);
if (contractValidation.errors.length > 0) {
  const detail = contractValidation.errors
    .map((issue) => `${issue.path}: ${issue.reason}`)
    .join("\n");
  throw new Error(`Topic contracts are invalid:\n${detail}`);
}

export const firstContentBatchPackets: TopicPacket[] = loadedContracts.map(({ contract }) => ({
  ...contract,
  storyboardBeats: normalizeBeats(contract.storyboardBeats)
}));

export const longFormAssembly: LongFormAssembly = {
  slug: "network-foundations-long-v1",
  sequence: firstContentBatchPackets.map((packet) => packet.topic),
  transitions: firstContentBatchPackets
    .filter((packet) => packet.transitionToNext)
    .map((packet) => ({
      fromTopic: packet.topic,
      toTopic: packet.transitionToNext!.toTopic,
      rationale: packet.transitionToNext!.rationale,
      presetId: packet.transitionToNext!.presetId
    })),
  targetWindowMinutes: {
    min: 4,
    max: 6
  }
};

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

function assertValidTopicSequence(sequence: TopicId[]): void {
  if (sequence.join(",") !== "tls,ssh,dns") {
    throw new Error("Long-form sequence must be TLS -> SSH -> DNS.");
  }
}

export function validateLongFormTransitionCoherence(assembly: LongFormAssembly = longFormAssembly): void {
  assertValidTopicSequence(assembly.sequence);
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

export function buildLongFormSceneSpec(topicScenes: Record<TopicId, SceneSpec>): SceneSpec {
  validateLongFormTransitionCoherence(longFormAssembly);
  const orderedScenes = longFormAssembly.sequence.map((topic) => ({
    topic,
    scene: topicScenes[topic]
  }));
  return stitchSceneSpecsInOrder(orderedScenes, longFormAssembly.slug);
}

export function validateBatchCompleteness(kpiCaptures: KpiCapture[] = []): string[] {
  const errors: string[] = [];

  for (const issue of contractValidation.errors) {
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
