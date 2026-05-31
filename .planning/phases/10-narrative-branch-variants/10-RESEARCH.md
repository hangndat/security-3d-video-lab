# Phase 10 Research: Narrative Branch Variants

**Date:** 2026-05-31
**Phase:** 10-narrative-branch-variants

## Summary

Phase 06 established linear assembly profiles with manifest-locked sequences and contract-driven transitions. Phase 10 adds optional `branches[]` to the assembly schema so alternate sequences share one profile file while reusing the existing stitch pipeline.

## Technical Findings

### Current limitation

`LongFormAssemblyProfile` has a single `sequence[]`. `validateLongFormAssemblyProfile` validates adjacent pairs against `transitionToNext` on source contracts — branch paths that skip topics (e.g., auth-session → mitm-defense) need `transitionOverrides` on the branch.

### Schema extension

Add optional fields to `long-form-assembly.schema.json`:
- `defaultBranchId` (string)
- `branches` (array of `{ id, label, sequence, transitionOverrides? }`)

Keep `sequence` required when `branches` absent; when `branches` present, require `defaultBranchId` and at least two branches.

### Validation flow

For each branch:
1. Validate sequence against manifest rank (reuse existing logic)
2. For each adjacent pair, use override if present else contract `transitionToNext`
3. Validate preset pair via `validateTransitionPresetPair`

### Stitch flow

`loadLongFormAssembly(slug, branchId?)` returns resolved sequence + merged transitions.
`buildLongFormSceneSpec(slug, scenes, { branchId })` passes branch to loader.

### Replay (NARR-02)

Extend `narrative-composition-replay.test.ts`:
- Per-branch `buildDeterministicTraceInputs` equality on two runs
- Stable sceneId includes branch id: `{slug}:{branchId}`

### New preset

`auth-session-to-mitm-defense` for attack-path fork (register in transition-presets.ts).

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking linear assemblies | Schema oneOf / conditional: branches optional |
| Missing v1.2 scene fixtures | Minimal deterministic stub fixtures for stitch-only replay |
| Override preset drift | Whitelist in transition-presets.ts + tests |

## Validation Architecture

| Truth | Test |
|-------|------|
| Branched schema validates | `long-form-assembly.test.ts` |
| Both branches load | `loadLongFormAssembly('content-depth-branched-v1', branchId)` |
| Replay per branch | `narrative-composition-replay.test.ts` |
| Linear assemblies unchanged | existing long-form + replay tests |
