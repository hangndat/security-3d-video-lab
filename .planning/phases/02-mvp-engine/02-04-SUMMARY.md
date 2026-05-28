---
phase: 02-mvp-engine
plan: 04
subsystem: render
tags: [remotion, ffmpeg, reproducibility, fingerprint, vitest]
requires:
  - phase: 02-03
    provides: deterministic render helper and reproducibility baseline
provides:
  - Composition-backed demo MP4 export path using deterministic frame-state traces.
  - Fingerprint input derivation wired to composition-derived trace data.
  - Repro smoke assertions tied to the same export-path data source.
affects: [phase-02-verification, phase-03-first-content-batch, render-reproducibility]
tech-stack:
  added: []
  patterns:
    - composition-derived frame traces feed both export and fingerprint validation
    - deterministic export verification via executable vitest smoke command
key-files:
  created:
    - tests/render-export-demo.test.ts
  modified:
    - package.json
    - src/render/remotion/render-composition.tsx
    - src/render/export/fingerprint.ts
    - tests/render-repro-smoke.test.ts
key-decisions:
  - "Export demo command must execute a composition-derived frame path instead of FFmpeg synthetic sources."
  - "Fingerprint inputs are derived from composition trace inputs so reproducibility checks share the shipped export data path."
patterns-established:
  - "Deterministic frame traces are hashed into fingerprint frame samples for end-to-end reproducibility verification."
requirements-completed: []
duration: 1 min
completed: 2026-05-28
---

# Phase 02 Plan 04: Gap-Closure Export/Fingerprint Wiring Summary

**Composition-derived frame generation now drives demo MP4 export and the reproducibility fingerprint path, eliminating the prior synthetic FFmpeg-only export gap.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-05-28T15:11:43+07:00
- **Completed:** 2026-05-28T08:12:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced the synthetic `lavfi` export script with an executable composition-backed export smoke path.
- Added deterministic frame-to-color generation and FFmpeg encoding from composition-derived timeline trace inputs.
- Connected reproducibility smoke tests to composition-derived frame hashes and preserved hard-fail diff bundle behavior.

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewire demo export to composition-backed render path** - `e262002` (feat)
2. **Task 2: Bind fingerprint assertions to exported demo output path** - `ff31faa` (feat)

## Files Created/Modified
- `package.json` - rewires `export:demo` to execute the composition-backed export smoke test.
- `src/render/remotion/render-composition.tsx` - adds deterministic frame rendering and FFmpeg MP4 export helper sourced from render trace inputs.
- `tests/render-export-demo.test.ts` - validates export pipeline writes a non-empty MP4 artifact.
- `src/render/export/fingerprint.ts` - adds helper to derive fingerprint frame hashes from composition trace inputs.
- `tests/render-repro-smoke.test.ts` - asserts reproducibility behavior using composition-derived data path inputs.

## Decisions Made
- Used deterministic trace-input hashing as the bridge from composition frame state to fingerprint frame samples.
- Kept demo export verification executable inside existing Vitest tooling for CI/local portability without new runtime dependencies.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added executable composition-to-MP4 export helper**
- **Found during:** Task 1
- **Issue:** Existing composition module had deterministic frame-state helpers but no executable export path that produced MP4 from composition-derived frames.
- **Fix:** Implemented `renderCompositionDemoMp4()` with deterministic frame generation and FFmpeg encoding.
- **Files modified:** `src/render/remotion/render-composition.tsx`, `tests/render-export-demo.test.ts`, `package.json`
- **Verification:** `npm run export:demo`
- **Committed in:** `e262002`

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Required for objective correctness; no architectural scope change.

## Issues Encountered
None.

## Known Stubs
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 02 verification gap for truth #8 is now closed with a composition-backed export path.
- Reproducibility evidence now uses the same concrete output path being exported.

## Self-Check: PASSED
- Verified `.planning/phases/02-mvp-engine/02-04-SUMMARY.md` exists on disk.
- Verified task commits `e262002` and `ff31faa` exist in git history.
