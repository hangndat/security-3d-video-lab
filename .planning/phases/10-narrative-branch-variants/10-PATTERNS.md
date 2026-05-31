# Phase 10 Pattern Map

**Generated:** 2026-05-31

## Closest Analogs

| New artifact | Closest analog | Pattern |
|--------------|----------------|---------|
| Branch schema | Phase 06 `long-form-assembly.schema.json` | Optional array extension, schemaVersion 1.0.0 |
| Branch validation | `validate-long-form-assembly.ts` | Extract sequence validator, add override merge |
| Branch loader | `loadLongFormAssembly()` | Parameterized branchId resolution |
| Branched profile | `content-depth-long-v1.json` | New `content-depth-branched-v1.json` |
| Replay per path | `narrative-composition-replay.test.ts` | Loop branchIds, assert trace equality |
| Transition override | `transition-presets.ts` allowedPairs | New preset for fork pair |

## File Modification Map

### Wave 1 (10-01)
- `src/content/assemblies/long-form-assembly.schema.json`
- `src/content/composition/load-long-form-assembly.ts`
- `src/content/composition/validate-long-form-assembly.ts`
- `src/content/composition/build-long-form-scene-spec.ts`
- `src/content/contracts/transition-presets.ts`
- `tests/long-form-assembly.test.ts`

### Wave 2 (10-02)
- `src/content/assemblies/content-depth-branched-v1.json`
- `tests/narrative-composition-replay.test.ts`
- `scripts/verify-narrative-composition.mjs`
- `src/fixtures/` (minimal v1.2 stub scene specs if needed)
