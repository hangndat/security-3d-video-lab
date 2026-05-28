export type TopicId = "tls" | "ssh" | "dns";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { stitchSceneSpecsInOrder } from "../../render/remotion/render-composition.js";

export interface StoryboardBeat {
  id: string;
  startFrame: number;
  endFrame: number;
  objective: string;
}

export interface DurationBudget {
  minSeconds: number;
  targetSeconds: number;
  maxSeconds: number;
}

export interface TopicPacket {
  topic: TopicId;
  slug: `${TopicId}-short-v1`;
  hook: string;
  cta: string;
  durationBudget: DurationBudget;
  storyboardBeats: StoryboardBeat[];
}

export interface NarrationPlaceholder {
  beatId: string;
  analyticKey: string;
  scriptIntent: string;
  timing: DurationBudget;
}

export interface LongFormAssembly {
  slug: "network-foundations-long-v1";
  sequence: TopicId[];
  transitions: Array<{
    fromTopic: TopicId;
    toTopic: TopicId;
    rationale: string;
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

function normalizeBeats(beats: StoryboardBeat[]): StoryboardBeat[] {
  return [...beats].sort((left, right) => left.startFrame - right.startFrame);
}

export const firstContentBatchPackets: TopicPacket[] = [
  {
    topic: "tls",
    slug: "tls-short-v1",
    hook: "Public networks are unsafe for credentials without encryption.",
    cta: "Explain why HTTPS trust indicators matter.",
    durationBudget: { minSeconds: 45, targetSeconds: 52, maxSeconds: 60 },
    storyboardBeats: normalizeBeats([
      { id: "tls-hook", startFrame: 0, endFrame: 30, objective: "Show attacker visibility risk." },
      {
        id: "tls-client-hello-beat",
        startFrame: 12,
        endFrame: 48,
        objective: "Client proposes cryptographic capabilities."
      },
      {
        id: "tls-server-hello-beat",
        startFrame: 54,
        endFrame: 98,
        objective: "Server presents certificate and selected ciphers."
      },
      {
        id: "tls-finished-beat",
        startFrame: 110,
        endFrame: 168,
        objective: "Key exchange finalizes a secure channel."
      },
      {
        id: "tls-app-data-beat",
        startFrame: 170,
        endFrame: 236,
        objective: "Encrypted application data flows."
      }
    ])
  },
  {
    topic: "ssh",
    slug: "ssh-short-v1",
    hook: "Remote shell needs both confidentiality and server authenticity.",
    cta: "Recommend host key verification and key-based auth.",
    durationBudget: { minSeconds: 45, targetSeconds: 50, maxSeconds: 60 },
    storyboardBeats: normalizeBeats([
      { id: "ssh-hook", startFrame: 0, endFrame: 28, objective: "Set remote admin threat context." },
      {
        id: "ssh-kexinit-beat",
        startFrame: 14,
        endFrame: 50,
        objective: "Negotiate key exchange and algorithms."
      },
      {
        id: "ssh-kex-reply-beat",
        startFrame: 52,
        endFrame: 104,
        objective: "Host key proof and key exchange reply."
      },
      {
        id: "ssh-userauth-beat",
        startFrame: 108,
        endFrame: 164,
        objective: "Authenticate user over encrypted channel."
      },
      {
        id: "ssh-session-beat",
        startFrame: 166,
        endFrame: 216,
        objective: "Open secure command session."
      }
    ])
  },
  {
    topic: "dns",
    slug: "dns-short-v1",
    hook: "Browsers need IP addresses, not domain names.",
    cta: "Understand resolver caching and latency impact.",
    durationBudget: { minSeconds: 45, targetSeconds: 53, maxSeconds: 60 },
    storyboardBeats: normalizeBeats([
      { id: "dns-hook", startFrame: 0, endFrame: 24, objective: "Explain why translation is required." },
      {
        id: "dns-query-beat",
        startFrame: 16,
        endFrame: 56,
        objective: "Client queries recursive resolver."
      },
      {
        id: "dns-recursive-beat",
        startFrame: 58,
        endFrame: 118,
        objective: "Resolver traverses root and TLD hierarchy."
      },
      {
        id: "dns-authoritative-beat",
        startFrame: 120,
        endFrame: 172,
        objective: "Authoritative answer is returned."
      },
      {
        id: "dns-response-beat",
        startFrame: 174,
        endFrame: 226,
        objective: "Resolver responds and caches result."
      }
    ])
  }
];

export const longFormAssembly: LongFormAssembly = {
  slug: "network-foundations-long-v1",
  sequence: ["tls", "ssh", "dns"],
  transitions: [
    {
      fromTopic: "tls",
      toTopic: "ssh",
      rationale: "Encrypted transport enables secure remote administration."
    },
    {
      fromTopic: "ssh",
      toTopic: "dns",
      rationale: "Secure sessions still depend on reliable name resolution."
    }
  ],
  targetWindowMinutes: {
    min: 4,
    max: 6
  }
};

export const narrationPlaceholders: NarrationPlaceholder[] = firstContentBatchPackets.flatMap((packet) =>
  packet.storyboardBeats.map((beat) => ({
    beatId: beat.id,
    analyticKey: `${packet.topic}:${beat.id}`,
    scriptIntent: beat.objective,
    timing: {
      minSeconds: 4,
      targetSeconds: 7,
      maxSeconds: 12
    }
  }))
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

export function validateBatchCompleteness(): string[] {
  const errors: string[] = [];
  const topics = firstContentBatchPackets.map((packet) => packet.topic);
  if (topics.join(",") !== "tls,ssh,dns") {
    errors.push("Topic packets must follow TLS -> SSH -> DNS order.");
  }

  for (const packet of firstContentBatchPackets) {
    if (packet.storyboardBeats.length === 0) {
      errors.push(`Topic ${packet.topic} has no storyboard beats.`);
    }
    if (packet.durationBudget.minSeconds < 45 || packet.durationBudget.maxSeconds > 60) {
      errors.push(`Topic ${packet.topic} violates short duration window.`);
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

  return errors;
}
