---
phase: 02-mvp-engine
verified: 2026-05-28T08:06:00Z
status: gaps_found
score: 9/10 must-haves verified
overrides_applied: 0
gaps:
  - truth: "User can render/export a deterministic demo sequence to MP4 through Remotion and FFmpeg."
    status: failed
    reason: "Export command generates a synthetic FFmpeg color clip and is not wired to Remotion composition output or deterministic engine frame state."
    artifacts:
      - path: "package.json"
        issue: "`export:demo` runs FFmpeg `lavfi color` directly instead of rendering composition output."
      - path: "src/render/remotion/render-composition.tsx"
        issue: "Contains deterministic helper functions but no wiring to an MP4 export pipeline."
    missing:
      - "Wire export flow so Remotion composition output is the source for FFmpeg export."
      - "Ensure exported artifact fingerprint is computed from actual rendered frames for the demo export path."
---

# Phase 02: MVP Engine Verification Report

**Phase Goal:** Deliver reusable scene/timeline/camera/packet foundations and a reproducible render-export pipeline.
**Verified:** 2026-05-28T08:06:00Z
**Status:** gaps_found
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | User can validate a SceneSpec before rendering and get deterministic pass/fail results. | ✓ VERIFIED | `validateSceneSpec()` enforces strict parsing and deterministic result shape; `tests/scene-spec-validation.test.ts` passes repeated-equality checks. |
| 2 | Invalid SceneSpec inputs fail with structured errors that identify exact failing paths. | ✓ VERIFIED | `validation-errors.ts` defines `{path, code, message, hint}` and validator maps Zod/capability failures into that envelope. |
| 3 | User can extend post-MVP capability switches only through an explicit feature-flag capability registry. | ✓ VERIFIED | `capability-registry.ts` rejects unknown flags and enabled disabled flags; covered by `tests/capability-registry.test.ts`. |
| 4 | CI has a golden SceneSpec fixture that proves schema conformance in automated checks. | ✓ VERIFIED | `src/fixtures/golden-scene-spec.json` is loaded by `tests/scene-spec-validation.test.ts`, and deterministic validation tests pass. |
| 5 | User can run deterministic frame-index timeline scheduling from the same SceneSpec seed and get identical state traces. | ✓ VERIFIED | `scheduleFrame()` performs stable deterministic sort + active cue selection; `tests/timeline-determinism.test.ts` verifies repeatability. |
| 6 | User can author camera behavior through versioned shot presets with bounded overrides and explicit transitions. | ✓ VERIFIED | `preset-registry.ts` enforces required preset+transition and override bounds; validated by `tests/camera-preset-bounds.test.ts`. |
| 7 | User can simulate packet route interpolation, branching, and termination deterministically from declared IDs/events. | ✓ VERIFIED | `packet-state.ts` applies sorted spawn/terminal events deterministically and `packet-interpolator.ts` is pure interpolation; integration test passes. |
| 8 | User can render/export a deterministic demo sequence to MP4 through Remotion and FFmpeg. | ✗ FAILED | `render:demo` runs tests only, and `export:demo` emits a synthetic FFmpeg color clip, not a Remotion-driven deterministic scene export. |
| 9 | User can run reproducibility checks that compare deterministic manifest and output fingerprint for identical inputs. | ✓ VERIFIED | `fingerprint.ts` builds deterministic manifest + fingerprint and `tests/render-repro-smoke.test.ts` validates equality/mismatch behavior. |
| 10 | CI fails hard on reproducibility violations and preserves failure evidence bundles. | ✓ VERIFIED | `.github/workflows/ci.yml` runs smoke tests in PR/nightly jobs without soft-fail and uploads evidence artifacts (`.artifacts/repro`, logs, traces). |

**Score:** 9/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `package.json` | deterministic scripts for test/render/export flow | ⚠️ PARTIAL | Scripts exist and run, but `export:demo` is not wired to Remotion composition output. |
| `src/engine/contracts/scene-spec.ts` | strict SceneSpec schema | ✓ VERIFIED | Exists, strict object schema, deterministic-critical required fields and bounds. |
| `src/engine/contracts/capability-registry.ts` | explicit capability gate | ✓ VERIFIED | Exists, substantive, deterministic unknown/disabled capability enforcement. |
| `src/engine/contracts/validation-errors.ts` | structured validation envelope | ✓ VERIFIED | Exists and used by validator typing/contracts. |
| `src/engine/contracts/validate-scene-spec.ts` | strict validator entrypoint | ✓ VERIFIED | Exists, schema version gate + strict parse + capability checks wired. |
| `src/fixtures/golden-scene-spec.json` | canonical fixture | ✓ VERIFIED | Exists with deterministic seed/ids/timeline and used in tests. |
| `src/engine/timeline/scheduler.ts` | deterministic frame scheduler | ✓ VERIFIED | Stable sort + overlap rejection + frame-state output implemented. |
| `src/engine/camera/preset-registry.ts` | bounded preset resolver | ✓ VERIFIED | Transition required, preset validation, bounds and focus validation implemented. |
| `src/engine/packet/packet-state.ts` | deterministic packet lifecycle model | ✓ VERIFIED | Deterministic sorted event application and terminal lifecycle behavior implemented. |
| `src/client/packet/packet-interpolator.ts` | deterministic interpolation | ✓ VERIFIED | Pure interpolation function with input bounds/clamping. |
| `src/render/remotion/render-composition.tsx` | frame-driven deterministic render composition logic | ✓ VERIFIED | Deterministic derivation helpers are implemented and tested. |
| `src/render/export/fingerprint.ts` | reproducibility manifest/fingerprint generation | ✓ VERIFIED | Deterministic hashing + mismatch diff bundle emission implemented. |
| `tests/*` declared in plans | deterministic behavior proofs | ✓ VERIFIED | All declared suites pass via `vitest` spot-checks. |
| `.github/workflows/ci.yml` | reproducibility CI gate | ✓ VERIFIED | PR/nightly jobs execute smoke tests and retain evidence artifacts. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `validate-scene-spec.ts` | `scene-spec.ts` | strict parse + schemaVersion gate | WIRED | Import + usage confirmed; `gsd-tools verify key-links` passed. |
| `validate-scene-spec.ts` | `capability-registry.ts` | capability allowlist gate | WIRED | Import + validation path confirmed; `gsd-tools` passed. |
| `scene-spec-validation.test.ts` | `golden-scene-spec.json` | fixture load + assertion | WIRED | Fixture imported and repeatedly validated. |
| `scheduler.ts` | `preset-registry.ts` | timeline/camera key link pattern | WIRED (pattern) | Plan key-link pattern check passed via `gsd-tools`. |
| `scheduler.ts` | `packet-state.ts` | timeline/packet key link pattern | WIRED (pattern) | Plan key-link pattern check passed via `gsd-tools`. |
| `packet-interpolator.ts` | `packet-state.ts` | interpolation consumes packet state model | WIRED (pattern) | Plan key-link pattern check passed via `gsd-tools`. |
| `render-composition.tsx` | `scheduler.ts` | frame state consumption | WIRED | Direct import + derive call confirmed. |
| `render-repro-smoke.test.ts` | `fingerprint.ts` | manifest/fingerprint assertions | WIRED | Direct import + behavior assertions confirmed. |
| `.github/workflows/ci.yml` | `render-repro-smoke.test.ts` | PR/nightly mandatory gate | WIRED | Workflow runs `npm run test:e2e:render-smoke` in both lanes. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `src/engine/timeline/scheduler.ts` | `activeTimelineIds` | `sceneSpec.timeline` filtered by frame window | Yes | ✓ FLOWING |
| `src/engine/packet/packet-state.ts` | `packets` | `sceneSpec.packets` + sorted spawn/terminal events | Yes | ✓ FLOWING |
| `src/render/remotion/render-composition.tsx` | `timelineTraceInput` | `scheduleFrame(sceneSpec, frame)` output | Yes | ✓ FLOWING |
| `src/render/export/fingerprint.ts` | `outputFingerprint.value` | `frameHashes` + normalized metadata via stable hash | Yes | ✓ FLOWING |
| `package.json` export path | demo mp4 input frames | FFmpeg `lavfi color` synthetic generator | No (not composition-derived) | ✗ DISCONNECTED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| SceneSpec deterministic validation | `npm run test:quick -- scene-spec-validation` | 4 tests passed | ✓ PASS |
| Deterministic timeline scheduling | `npm run test:quick -- timeline-determinism` | 3 tests passed | ✓ PASS |
| Camera preset bounds + transitions | `npm run test:quick -- camera-preset-bounds` | 3 tests passed | ✓ PASS |
| Packet interpolation/lifecycle determinism | `npm run test:quick -- packet-engine` | 3 tests passed | ✓ PASS |
| Reproducibility manifest/fingerprint smoke gate | `npm run test:e2e:render-smoke` | 3 tests passed | ✓ PASS |
| Demo MP4 export command produces artifact | `npm run export:demo` | succeeds and writes `.artifacts/export/demo.mp4` | ✓ PASS (artifact only) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `P02-ENGINE-DETERMINISTIC-SEQUENCE` | `02-01-PLAN.md` | Deterministic engine sequencing base | ✓ SATISFIED | Validator + deterministic fixture/test gates pass. |
| `P02-STRICT-SCENE-CONTRACT` | `02-01-PLAN.md` | Strict SceneSpec contract enforcement | ✓ SATISFIED | Strict schema + structured errors + version/capability gates implemented. |
| `P02-PACKET-FLOWS-REUSABLE` | `02-02-PLAN.md` | Reusable deterministic packet flow primitives | ✓ SATISFIED | Packet state/interpolator modules and integration tests pass. |
| `P02-CAMERA-CINEMATIC-CONTROL` | `02-02-PLAN.md` | Deterministic camera preset control | ✓ SATISFIED | Preset registry + override bounds + transition/focus checks implemented. |
| `P02-RENDER-EXPORT-MP4` | `02-03-PLAN.md` | Deterministic render-export MP4 path | ✗ BLOCKED | Current export path is synthetic FFmpeg color clip, not Remotion+engine composition output. |
| `P02-REPRODUCIBLE-ARTIFACT-SHAPE` | `02-03-PLAN.md` | Reproducibility fingerprint/manifest gate | ✓ SATISFIED | Fingerprint module + smoke tests + CI gates present and passing. |
| N/A | N/A | Repository-level requirement registry file | ? NEEDS HUMAN | `.planning/REQUIREMENTS.md` not found, so canonical cross-reference cannot be completed. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `package.json` | `scripts.export:demo` | Synthetic FFmpeg source (`lavfi color`) used as export input | ⚠️ Warning | Produces MP4 artifact but bypasses deterministic Remotion composition pipeline. |

### Human Verification Required

None for this pass. Current blocker is implementation wiring, not subjective behavior.

### Gaps Summary

Phase 02 substantially delivers reusable deterministic scene/timeline/camera/packet foundations and reproducibility evidence tooling, but the goal is not fully achieved because the demo export path is not wired to the actual deterministic Remotion composition. The pipeline currently validates determinism in tests and can emit an MP4 artifact, yet those are disconnected paths. Closing this gap requires connecting composition-derived frame output to the export command and applying fingerprint checks over that real output path.

---

_Verified: 2026-05-28T08:06:00Z_  
_Verifier: Claude (gsd-verifier)_
