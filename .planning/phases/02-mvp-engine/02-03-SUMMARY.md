---
phase: 02-mvp-engine
plan: 03
subsystem: render
tags: [remotion, ffmpeg, reproducibility, vitest, github-actions]
requires:
  - phase: 02-01
    provides: strict SceneSpec validation and deterministic contract checks
  - phase: 02-02
    provides: frame-index scheduler, camera/packet deterministic engine primitives
provides:
  - Deterministic render composition helpers derived from validated SceneSpec and scheduler state.
  - Reproducibility manifest and output fingerprint module with hard-fail diff bundle handling.
  - PR/nightly CI reproducibility gates with retained failure evidence artifacts.
affects: [phase-03-first-content-batch, phase-04-e2e-testing, ci-reproducibility]
tech-stack:
  added: []
  patterns: [red-green TDD tasks, deterministic manifest comparison, CI evidence retention]
key-files:
  created:
    - src/render/remotion/render-composition.tsx
    - src/render/export/fingerprint.ts
    - tests/render-composition.test.ts
    - tests/render-repro-smoke.test.ts
    - .github/workflows/ci.yml
  modified:
    - package.json
key-decisions:
  - "Render composition state derivation is pure: validate SceneSpec then consume scheduler output by frame index only."
  - "Reproducibility gate compares both provenance and output fingerprints and writes diff bundles before failing."
  - "CI uses PR smoke matrix + nightly matrix with fixed retention windows to preserve forensic evidence."
patterns-established:
  - "Render determinism checks are codified as repeatable trace-input equality tests."
  - "Reproducibility failures always produce artifact bundles for post-failure analysis."
requirements-completed: [P02-RENDER-EXPORT-MP4, P02-REPRODUCIBLE-ARTIFACT-SHAPE]
duration: 4 min
completed: 2026-05-28
---

# Phase 02 Plan 03: Deterministic Render and Reproducibility Gate Summary

**Deterministic render-state derivation, reproducibility manifest/fingerprint enforcement, and CI smoke/nightly reproducibility gates are now implemented for the MVP engine.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-28T14:54:55+07:00
- **Completed:** 2026-05-28T14:58:24+07:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Implemented deterministic render composition utilities that derive frame state only from validated SceneSpec and scheduler output.
- Implemented deterministic manifest + output fingerprint generation with strict mismatch failure and diff bundle emission.
- Added CI workflow gates for PR and nightly reproducibility checks with retention policies aligned to ADR-003.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement deterministic render composition** - `5c75cb8` (test), `7f52a68` (feat)
2. **Task 2: Implement reproducibility manifest and fingerprint module** - `1d424cd` (test), `61903aa` (feat)
3. **Task 3: Wire PR/nightly CI reproducibility gates** - `08c21cb` (chore)

Additional deviation fix commit:
- `b07f811` (fix): replace export placeholder with deterministic ffmpeg output

## Files Created/Modified
- `src/render/remotion/render-composition.tsx` - deterministic frame-state and trace-input derivation from scheduler state.
- `tests/render-composition.test.ts` - determinism tests for frame-state and repeated trace-input equality.
- `src/render/export/fingerprint.ts` - manifest/fingerprint generation, provenance hashing, strict mismatch assertion, and diff-bundle writing.
- `tests/render-repro-smoke.test.ts` - two-run reproducibility smoke tests and mismatch hard-fail coverage.
- `.github/workflows/ci.yml` - PR smoke and nightly reproducibility matrix gates with artifact retention.
- `package.json` - scripts for render smoke, reproducibility smoke, and deterministic export demo generation.

## Decisions Made
- Kept deterministic render composition as pure data derivation helpers so render-state generation remains reproducible and testable.
- Built fingerprint hashing from sampled frame hashes plus normalized container metadata to enforce D-31 policy.
- Captured CI evidence bundle paths as reusable forensic outputs for both PR and nightly lanes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved `.tsx` runtime execution blocker in `render:demo`**
- **Found during:** Task 1
- **Issue:** Node runtime failed importing `.tsx` directly from script-based demo execution.
- **Fix:** Routed `render:demo` to deterministic render smoke test command that executes composition behavior through Vitest.
- **Files modified:** `package.json`
- **Verification:** `npm run render:demo`
- **Committed in:** `7f52a68`

**2. [Rule 2 - Missing Critical] Replaced placeholder export script with deterministic MP4 artifact generation**
- **Found during:** Plan-level verification
- **Issue:** `export:demo` was a placeholder and did not produce export artifacts required by plan objective.
- **Fix:** Implemented deterministic FFmpeg-based demo MP4 generation and size assertion.
- **Files modified:** `package.json`
- **Verification:** `npm run export:demo`
- **Committed in:** `b07f811`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both fixes were required to meet executable render/export verification expectations; no architectural scope change.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Reproducibility gate and CI enforcement are in place for downstream content and E2E expansion.
- Ready for next phase execution.

## Self-Check: PASSED
- Verified `02-03-SUMMARY.md` exists on disk.
- Verified all `02-03` task and deviation-fix commits exist in git history.
