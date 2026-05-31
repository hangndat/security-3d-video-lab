# Phase 06 Patterns Map

**Mapped:** 2026-05-28

## Closest Existing Patterns

| New artifact | Closest analog | Reuse guidance |
|--------------|----------------|----------------|
| `long-form-assembly.json` | `src/content/topics/manifest.json` | Same `schemaVersion` literal + `order`/`sequence` array validation style |
| `load-long-form-assembly.ts` | `load-topic-manifest.ts` | Parse JSON, strict version gate, duplicate ID checks |
| `validate-long-form-assembly.ts` | `validate-topic-contracts.ts` | Collect-all errors, path+reason issues |
| `pacing-presets.ts` | `transition-presets.ts` | Registry map + `isKnown*` + validate helper |
| `build-long-form-scene-spec.ts` | `first-content-batch.ts` `buildLongFormSceneSpec` | Move logic; keep `stitchSceneSpecsInOrder` call |
| `generate-caption-timing-map.ts` | `validateDurationPolicy` frame math | FPS=30, min/max beat frames from contracts |
| `verify-narrative-composition.mjs` | `verify-content-authoring.mjs` | Dual JSON + markdown evidence, suite runner |
| Replay tests | `tests/e2e-canonical-flows.test.ts` | `buildDeterministicTraceInputs` + equality assertion |

## File Placement

```
src/content/
  assemblies/
    long-form-assembly.schema.json
    network-foundations-long-v1.json
    security-expansion-long-v1.json
  composition/
    load-long-form-assembly.ts
    validate-long-form-assembly.ts
    build-long-form-scene-spec.ts
    generate-caption-timing-map.ts
    pacing-presets.ts
  contracts/
    transition-presets.ts  (extend)
  batch/
    first-content-batch.ts  (slim re-exports)
tests/
  long-form-assembly.test.ts
  caption-timing-map.test.ts
  narrative-composition-replay.test.ts
scripts/
  verify-narrative-composition.mjs
```

## Integration Points

- `transition-presets.ts`: add presets; update `REQUIRED_TRANSITION_PRESET_IDS` per assembly profile validation.
- Topic contracts for `dns`, `auth-session`, `pki-trust-chain`: add `transitionToNext` for expansion chain.
- CI: extend `pr-full-validation` with phase 06 test files (not blocking quick verify on E2E).
