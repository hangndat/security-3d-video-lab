# Phase 06 Research: Narrative and Cinematic Composition

**Date:** 2026-05-28
**Phase:** 06-narrative-cinematic-composition

## Research Questions

1. How should long-form assemblies be configured without breaking Phase 05 manifest lock?
2. What preset surfaces are needed for transitions vs pacing?
3. How do we derive caption timing from stitched compositions deterministically?
4. What replay checks prove cinematic stability for multi-module stitches?

## Findings

### 1. Assembly profiles should sit above topic contracts

Phase 05 established topic-centric `contract.json` files and `manifest.json` for global topic ordering. Long-form narrative is a **composition layer** that selects an ordered subset (or full set) of manifest topics and binds transitions between adjacent pairs.

Recommended shape:

```json
{
  "schemaVersion": "1.0.0",
  "slug": "security-expansion-long-v1",
  "sequence": ["tls", "ssh", "dns", "auth-session", "pki-trust-chain", "mitm-defense"],
  "targetWindowMinutes": { "min": 8, "max": 12 },
  "defaultPacingPresetId": "documentary-standard"
}
```

Validation rules:
- Every `sequence` topic must exist in manifest `order`.
- Adjacent pairs must have resolvable `transitionToNext` on the source topic contract OR assembly-level transition override (prefer contract-level to keep rationale in topic data).
- Assembly slug is used as stitched `sceneId` and caption artifact key.

### 2. Transition vs pacing presets

| Concern | Owner module | Examples |
|---------|--------------|----------|
| Narrative bridge between topics | `transition-presets.ts` | `secure-channel-to-remote-shell`, `dns-to-auth-boundary` |
| Intra-topic rhythm and camera feel | `pacing-presets.ts` | `documentary-standard`, `security-dense` |

Transition presets already enforce `allowedPairs`. Extend with 4 new adjacency presets for expansion chain.

Pacing presets should be data-only (no render imports) with:
- `holdFramesBetweenBeats`
- `cameraTransition` (string token consumed by camera cue resolution)
- `maxBeatOverlapFrames` (aligns with existing beat overlap in scaffold templates)

### 3. Caption timing map derivation

Frame math:
- Maintain running `frameOffset` while walking assembly sequence (same as stitch).
- For each topic, read `storyboardBeats` and `narrationPlaceholders`.
- Emit caption entries with absolute `startFrame`/`endFrame` = beat frames + offset.
- `startSeconds = startFrame / FPS`, `endSeconds = endFrame / FPS` (FPS=30, consistent with Phase 05 validator).

Output schema (minimal):

```json
{
  "schemaVersion": "1.0.0",
  "assemblySlug": "network-foundations-long-v1",
  "fps": 30,
  "entries": [
    {
      "topic": "tls",
      "beatId": "tls-handshake",
      "startFrame": 0,
      "endFrame": 70,
      "startSeconds": 0,
      "endSeconds": 2.33,
      "scriptIntent": "...",
      "analyticKey": "tls:tls-handshake"
    }
  ]
}
```

### 4. Deterministic replay for stitched scenes

Existing pattern in `tests/e2e-canonical-flows.test.ts`:
- Sample fixed frames via `buildDeterministicTraceInputs(scene, TRACE_FRAMES)`.
- Assert identical traces across two runs.
- Optionally compare output fingerprint via `buildOutputFingerprintInputFromTraceInputs`.

Apply same pattern to stitched long-form SceneSpec for both assemblies (3-topic canonical + 6-topic expansion). This satisfies CINE-01 without new render infrastructure.

### 5. Refactor strategy for `first-content-batch.ts`

- Keep batch KPI helpers in `first-content-batch.ts`.
- Move `longFormAssembly`, `buildLongFormSceneSpec`, `validateLongFormTransitionCoherence` to `src/content/composition/`.
- Default export surface: `loadLongFormAssembly(slug)`, `buildLongFormSceneSpec(assemblySlug, topicScenes)`.
- `first-content-batch` re-exports canonical assembly for backward compatibility in tests.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking phase 03 export tests | Keep `network-foundations-long-v1` sequence identical; add regression test comparing stitch output |
| Draft topic transitions incomplete | Add presets + contract `transitionToNext` for dns→auth-session chain in 06-01 |
| Caption drift if beat overlap changes | Unit test caption frames against known golden offsets for canonical assembly |

## Recommendation

Execute in two waves:
1. **06-01:** Assembly JSON + loader/validator + preset expansion + generalized stitch (CONT-02, AUTHR-03 foundation).
2. **06-02:** Caption map generator + replay tests + verify script (CINE-01, CINE-03).
