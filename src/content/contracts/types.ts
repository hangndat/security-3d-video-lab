export const FIRST_CONTENT_BATCH_TOPICS = ["tls", "ssh", "dns"] as const;
export const DRAFT_TOPIC_IDS = ["auth-session", "pki-trust-chain", "mitm-defense"] as const;

/** @deprecated Use loadTopicManifest().order for manifest-locked ordering. */
export const TOPIC_SEQUENCE = FIRST_CONTENT_BATCH_TOPICS;

export type FirstBatchTopicId = (typeof FIRST_CONTENT_BATCH_TOPICS)[number];
export type DraftTopicId = (typeof DRAFT_TOPIC_IDS)[number];
export type TopicId = FirstBatchTopicId | DraftTopicId;

export interface StoryboardBeatContract {
  id: string;
  startFrame: number;
  endFrame: number;
  objective: string;
}

export interface DurationBudgetContract {
  minSeconds: number;
  targetSeconds: number;
  maxSeconds: number;
}

export interface NarrationPlaceholderContract {
  beatId: string;
  analyticKey: string;
  scriptIntent: string;
  timing: DurationBudgetContract;
}

export interface TopicTransitionContract {
  toTopic: TopicId;
  presetId: string;
  rationale: string;
}

export interface TopicContract {
  schemaVersion: "1.0.0";
  topic: TopicId;
  slug: `${string}-short-v${number}`;
  hook: string;
  cta: string;
  durationBudget: DurationBudgetContract;
  storyboardBeats: StoryboardBeatContract[];
  narrationPlaceholders: NarrationPlaceholderContract[];
  pacingPresetId?: string;
  transitionToNext?: TopicTransitionContract;
}

export interface LoadedTopicContract {
  contractPath: string;
  contract: TopicContract;
}

export interface ValidationIssue {
  path: string;
  reason: string;
}

export interface TopicContractValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}
