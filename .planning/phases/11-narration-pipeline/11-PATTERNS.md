# Phase 11 Pattern Map

**Generated:** 2026-05-31

## Closest Analogs

| New artifact | Closest analog | Pattern |
|--------------|----------------|---------|
| Narration track schema | `caption-timing-map.schema.json` | schemaVersion 1.0.0, strict entries array |
| generateNarrationTrack | `generateCaptionTimingMap` | Pure function from upstream map |
| Deterministic stub provider | `buildDeterministicTraceInputs` | Deterministic hash without render |
| Export bundle | `buildDeterministicManifest` | Stable JSON artifact + hash |
| verify script | `verify-narrative-composition.mjs` | Quick mode test suites + JSON/MD evidence |

## File Modification Map

### Wave 1 (11-01)
- `src/content/composition/generate-caption-timing-map.ts` (branchId option)
- `src/content/narration/narration-track.schema.json`
- `src/content/narration/generate-narration-track.ts`
- `src/content/narration/validate-narration-alignment.ts`
- `src/content/narration/providers/types.ts`
- `src/content/narration/providers/deterministic-stub-provider.ts`
- `tests/narration-track.test.ts`
- `tests/caption-timing-map.test.ts` (branchId cases)

### Wave 2 (11-02)
- `src/render/export/build-long-form-export-bundle.ts`
- `tests/narration-export.test.ts`
- `scripts/verify-narration-pipeline.mjs`
- `package.json` (verify:narration-pipeline script)
