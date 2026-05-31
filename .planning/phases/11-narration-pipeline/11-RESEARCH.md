# Phase 11 Research: Narration Pipeline

**Date:** 2026-05-31
**Phase:** 11-narration-pipeline

## Summary

Phase 06 established caption timing maps as the timing source-of-truth for beat-level script intent. Phase 11 adds a narration layer that consumes those maps and produces export-linked audio segment metadata without coupling to cloud TTS in CI.

## Technical Findings

### Existing assets

| Asset | Role |
|-------|------|
| `generateCaptionTimingMap()` | Beat windows with start/end seconds and scriptIntent |
| `caption-timing-map.schema.json` | Strict validation for caption artifacts |
| `buildDeterministicManifest()` | Fingerprint pattern for export reproducibility |
| `narrationPlaceholders` on contracts | Source scriptIntent per beat (already in caption entries) |

### Gap: branch-aware caption maps

`generateCaptionTimingMap` calls `resolveBranch(profile)` without `branchId` param — branched assemblies always use `defaultBranchId`. Phase 11 extends with optional `branchId` before narration generation.

### Proposed module layout

```
src/content/narration/
  narration-track.schema.json
  generate-narration-track.ts
  validate-narration-alignment.ts
  providers/
    types.ts
    deterministic-stub-provider.ts
src/render/export/
  build-long-form-export-bundle.ts
```

### Stub provider design

- Input: `CaptionTimingEntry` + provider seed derived from `analyticKey`
- Output: `{ durationMs, contentHash, audioBytes }` — silent WAV, exact duration
- Hash: `sha256(analyticKey|scriptIntent|durationMs|providerId)` — stable across runs

### Export bundle shape

```typescript
interface LongFormExportBundle {
  schemaVersion: "1.0.0";
  assemblySlug: string;
  branchId?: string;
  sceneId: string;
  captionTimingMap: CaptionTimingMap;
  narrationTrack: NarrationTrackManifest;
  deterministicManifest?: DeterministicManifest; // when trace inputs available
  artifactPaths: {
    caption: string;
    narration: string;
    bundle: string;
  };
}
```

## Risks

| Risk | Mitigation |
|------|------------|
| Cloud TTS in CI | Stub provider only; interface for future cloud |
| Caption/narration drift | Single caption map input; validator checks 1:1 beat coverage |
| Branch artifact collision | Namespace by branchId in paths |
| WAV binary non-determinism | Fixed sample rate, silent PCM, deterministic header |

## Validation Architecture

| Truth | Test |
|-------|------|
| Segments align to caption windows | `narration-track.test.ts` |
| Stub hashes stable across runs | replay equality test |
| Export bundle links caption + narration | `narration-export.test.ts` |
| Quick verify gate | `verify-narration-pipeline.mjs --quick` |
