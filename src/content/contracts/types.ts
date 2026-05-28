export const TOPIC_SEQUENCE = ["tls", "ssh", "dns"] as const;

export type TopicId = (typeof TOPIC_SEQUENCE)[number];

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
