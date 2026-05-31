import { createDeterministicStubProvider, DETERMINISTIC_STUB_PROVIDER_ID } from "./deterministic-stub-provider.js";
import { createElevenLabsProvider, ELEVENLABS_PROVIDER_ID } from "./elevenlabs-provider.js";
import type { NarrationProvider } from "./types.js";

export type NarrationProviderEnv = {
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
};

export { DETERMINISTIC_STUB_PROVIDER_ID, ELEVENLABS_PROVIDER_ID };

export function resolveNarrationProvider(
  env: NarrationProviderEnv = process.env
): NarrationProvider {
  const apiKey = env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return createDeterministicStubProvider();
  }

  return createElevenLabsProvider({
    apiKey,
    voiceId: env.ELEVENLABS_VOICE_ID?.trim() || undefined
  });
}
