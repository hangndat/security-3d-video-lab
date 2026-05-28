---
phase: 02-mvp-engine
plan: 01
subsystem: engine
tags: [typescript, zod, vitest, scene-spec, deterministic-validation]
requires:
  - phase: 01-docs-foundation
    provides: phase contracts, ADR constraints, and deterministic guardrails
provides:
  - Bootstrapped strict TypeScript workspace and deterministic test scripts.
  - Strict SceneSpec contract validator with schema/version/capability gates.
  - Golden SceneSpec fixture and deterministic CI-ready validation tests.
affects: [phase-02-plan-02, phase-03-first-content-batch, phase-04-e2e-testing]
tech-stack:
  added: [three, @react-three/fiber, @react-three/drei, remotion, zod, ajv, seedrandom, vitest, typescript]
  patterns: [strict schema gate before render, structured validation error envelope, explicit capability allowlist]
key-files:
  created:
    - package.json
    - tsconfig.json
    - src/engine/contracts/scene-spec.ts
    - src/engine/contracts/capability-registry.ts
    - src/engine/contracts/validation-errors.ts
    - src/engine/contracts/validate-scene-spec.ts
    - src/fixtures/golden-scene-spec.json
    - tests/capability-registry.test.ts
    - tests/scene-spec-validation.test.ts
  modified:
    - .gitignore
    - package-lock.json
key-decisions:
  - "Use Vitest with deterministic filterable runs (`test:quick`) for contract-first validation."
  - "Enforce schemaVersion as strict literal 1.0.0 with explicit hard-fail guidance."
  - "Gate post-MVP capabilities through an explicit disabled-by-default registry."
patterns-established:
  - "Validator outputs stable `{path, code, message, hint}` structures for all failure classes."
  - "Golden fixture-based tests validate both deterministic pass and structured fail behavior."
requirements-completed: [P02-ENGINE-DETERMINISTIC-SEQUENCE, P02-STRICT-SCENE-CONTRACT]
duration: 2 min
completed: 2026-05-28
---

# Phase 02 Plan 01: Contract-First Engine Foundation Summary

**Contract-first SceneSpec validation shipped with strict schema gating, capability allowlisting, and a CI-ready golden deterministic fixture suite.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-28T07:42:11Z
- **Completed:** 2026-05-28T07:43:50Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Bootstrapped deterministic workspace scripts and strict TypeScript configuration for engine modules.
- Implemented strict SceneSpec validator with unknown-key rejection, schemaVersion hard fail, and capability registry gating.
- Added canonical golden fixture and tests covering deterministic pass plus contract failure semantics.

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap deterministic engine workspace** - `7b9e204` (chore)
2. **Task 2: Implement strict SceneSpec contract and validator gate** - `5417d59` (feat)
3. **Task 3: Add golden SceneSpec fixture and validation tests** - `98e06d7` (test)

## Files Created/Modified
- `package.json` - dependency baseline and deterministic test/render script entrypoints.
- `tsconfig.json` - strict NodeNext TypeScript compiler contract for engine code.
- `src/engine/contracts/scene-spec.ts` - strict SceneSpec schema with required deterministic fields.
- `src/engine/contracts/capability-registry.ts` - explicit capability allowlist and disabled-feature gate.
- `src/engine/contracts/validate-scene-spec.ts` - pre-render validation entrypoint and error normalization.
- `src/engine/contracts/validation-errors.ts` - structured error and validation result contracts.
- `src/fixtures/golden-scene-spec.json` - canonical valid SceneSpec fixture for CI.
- `tests/capability-registry.test.ts` - unknown/disabled capability failure tests.
- `tests/scene-spec-validation.test.ts` - deterministic pass + unknown field/missing seed/version failures.

## Decisions Made
- Used `vitest run --passWithNoTests` for `test:quick` to keep early-plan contract checks executable before all suites exist.
- Implemented schema version handling as an explicit pre-parse gate to guarantee deterministic unsupported-version failures.
- Kept post-MVP extension points disabled by default to enforce explicit capability governance.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ignored generated dependency tree**
- **Found during:** Task 1 (Bootstrap deterministic engine workspace)
- **Issue:** `npm install` produced an untracked `node_modules/` tree that would pollute working status and commit flow.
- **Fix:** Updated `.gitignore` to include `node_modules/` and committed `package-lock.json` for pinned reproducible dependencies.
- **Files modified:** `.gitignore`, `package-lock.json`
- **Verification:** `git status --short` no longer reports `node_modules/`
- **Committed in:** `7b9e204`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix improved reproducibility and kept task commit hygiene aligned with deterministic tooling goals.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Ready for `02-02-PLAN.md`; strict contract gate and fixture coverage are now available for downstream timeline/camera/packet work.
- No active blockers from this plan.

## Self-Check: PASSED
- Verified summary file exists on disk.
- Verified all task commit hashes exist in git history.
