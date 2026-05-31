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
  "remote-shell-to-name-resolution",
  "dns-to-auth-boundary",
  "auth-session-to-pki-trust-chain",
  "auth-session-to-mitm-defense",
  "pki-trust-chain-to-mitm-defense",
  "pki-trust-chain-to-zero-trust-access",
  "mitm-defense-to-zero-trust-access",
  "mitm-defense-to-oauth-jwt-session",
  "zero-trust-access-to-oauth-jwt-session",
  "oauth-jwt-session-to-api-gateway-waf"
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
  },
  "dns-to-auth-boundary": {
    id: "dns-to-auth-boundary",
    label: "DNS foundations to authentication boundary",
    allowedPairs: [{ fromTopic: "dns", toTopic: "auth-session" }]
  },
  "auth-session-to-pki-trust-chain": {
    id: "auth-session-to-pki-trust-chain",
    label: "Authentication session to PKI trust chain",
    allowedPairs: [{ fromTopic: "auth-session", toTopic: "pki-trust-chain" }]
  },
  "auth-session-to-mitm-defense": {
    id: "auth-session-to-mitm-defense",
    label: "Authentication session to MITM attack narrative",
    allowedPairs: [{ fromTopic: "auth-session", toTopic: "mitm-defense" }]
  },
  "pki-trust-chain-to-mitm-defense": {
    id: "pki-trust-chain-to-mitm-defense",
    label: "PKI trust chain to MITM defense narrative",
    allowedPairs: [{ fromTopic: "pki-trust-chain", toTopic: "mitm-defense" }]
  },
  "pki-trust-chain-to-zero-trust-access": {
    id: "pki-trust-chain-to-zero-trust-access",
    label: "PKI trust chain to zero-trust access boundary",
    allowedPairs: [{ fromTopic: "pki-trust-chain", toTopic: "zero-trust-access" }]
  },
  "mitm-defense-to-zero-trust-access": {
    id: "mitm-defense-to-zero-trust-access",
    label: "MITM defense to zero-trust access boundary",
    allowedPairs: [{ fromTopic: "mitm-defense", toTopic: "zero-trust-access" }]
  },
  "mitm-defense-to-oauth-jwt-session": {
    id: "mitm-defense-to-oauth-jwt-session",
    label: "MITM attack path to OAuth/JWT session abuse",
    allowedPairs: [{ fromTopic: "mitm-defense", toTopic: "oauth-jwt-session" }]
  },
  "zero-trust-access-to-oauth-jwt-session": {
    id: "zero-trust-access-to-oauth-jwt-session",
    label: "Zero-trust access to OAuth/JWT session flow",
    allowedPairs: [{ fromTopic: "zero-trust-access", toTopic: "oauth-jwt-session" }]
  },
  "oauth-jwt-session-to-api-gateway-waf": {
    id: "oauth-jwt-session-to-api-gateway-waf",
    label: "OAuth/JWT session to API gateway and WAF edge",
    allowedPairs: [{ fromTopic: "oauth-jwt-session", toTopic: "api-gateway-waf" }]
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
