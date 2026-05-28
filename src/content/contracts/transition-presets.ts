import type { TopicId } from "./types.js";

export interface TransitionPreset {
  id: string;
  label: string;
  allowedPairs: Array<{
    fromTopic: TopicId;
    toTopic: TopicId;
  }>;
}

export const REQUIRED_TRANSITION_PRESET_IDS = [
  "secure-channel-to-remote-shell",
  "remote-shell-to-name-resolution"
] as const;

export const TRANSITION_PRESETS: Record<string, TransitionPreset> = {
  "secure-channel-to-remote-shell": {
    id: "secure-channel-to-remote-shell",
    label: "Secure channel to remote shell",
    allowedPairs: [{ fromTopic: "tls", toTopic: "ssh" }]
  },
  "remote-shell-to-name-resolution": {
    id: "remote-shell-to-name-resolution",
    label: "Remote shell to DNS foundations",
    allowedPairs: [{ fromTopic: "ssh", toTopic: "dns" }]
  }
};

export function isKnownTransitionPreset(presetId: string): boolean {
  return Object.hasOwn(TRANSITION_PRESETS, presetId);
}

export function validateTransitionPresetPair(
  presetId: string,
  fromTopic: TopicId,
  toTopic: TopicId
): string | null {
  const preset = TRANSITION_PRESETS[presetId];
  if (!preset) {
    return `Unknown transition preset '${presetId}'.`;
  }

  const allowed = preset.allowedPairs.some(
    (pair) => pair.fromTopic === fromTopic && pair.toTopic === toTopic
  );
  if (!allowed) {
    return `Transition preset '${presetId}' does not allow ${fromTopic}->${toTopic}.`;
  }

  return null;
}
