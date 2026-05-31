import { describe, expect, it } from "vitest";

import { buildTlsProductionCaptionMap } from "../src/verification/tls-production-rubric.js";
import {
  createElevenLabsProvider,
  ELEVENLABS_PROVIDER_ID
} from "../src/content/narration/providers/elevenlabs-provider.js";
import {
  createDeterministicStubProvider,
  DETERMINISTIC_STUB_PROVIDER_ID
} from "../src/content/narration/providers/deterministic-stub-provider.js";
import {
  resolveNarrationProvider
} from "../src/content/narration/providers/resolve-narration-provider.js";
import { generateNarrationTrack } from "../src/content/narration/generate-narration-track.js";
import { validateNarrationAlignment } from "../src/content/narration/validate-narration-alignment.js";

describe("resolveNarrationProvider", () => {
  it("returns deterministic-stub when ELEVENLABS_API_KEY is unset", () => {
    const provider = resolveNarrationProvider({});
    expect(provider.id).toBe(DETERMINISTIC_STUB_PROVIDER_ID);
  });

  it("returns elevenlabs when ELEVENLABS_API_KEY is set", () => {
    const provider = resolveNarrationProvider({ ELEVENLABS_API_KEY: "test-key" });
    expect(provider.id).toBe(ELEVENLABS_PROVIDER_ID);
  });
});

describe("createElevenLabsProvider", () => {
  it("mocked fetch produces synthesizeSegment result with audioBytes", () => {
    const provider = createElevenLabsProvider({
      apiKey: "test-key",
      fetchImpl: () => ({
        ok: true,
        status: 200,
        audioBytes: Buffer.from([1, 2, 3, 4, 5, 6, 7, 8])
      })
    });

    const captionMap = buildTlsProductionCaptionMap();
    const entry = captionMap.entries[0]!;
    const result = provider.synthesizeSegment(entry, 1.25);

    expect(result.audioBytes.length).toBeGreaterThan(44);
    expect(result.actualDurationSeconds).toBe(1.25);
    expect(result.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("PROD-02 stub regression", () => {
  it("stub path content hashes remain stable for TLS production caption map", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const provider = createDeterministicStubProvider();
    const first = generateNarrationTrack(captionMap, provider);
    const second = generateNarrationTrack(captionMap, provider);

    expect(second.segments.map((segment) => segment.contentHash)).toEqual(
      first.segments.map((segment) => segment.contentHash)
    );
  });

  it("validateNarrationAlignment passes for TLS production caption map with stub track", () => {
    const captionMap = buildTlsProductionCaptionMap();
    const track = generateNarrationTrack(captionMap, createDeterministicStubProvider());
    const alignment = validateNarrationAlignment(captionMap, track);
    expect(alignment.valid).toBe(true);
  });
});
