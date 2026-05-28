---
phase: 02-mvp-engine
reviewed: 2026-05-28T08:02:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - package.json
  - tsconfig.json
  - .github/workflows/ci.yml
  - src/engine/contracts/scene-spec.ts
  - src/engine/contracts/capability-registry.ts
  - src/engine/contracts/validation-errors.ts
  - src/engine/contracts/validate-scene-spec.ts
  - src/engine/timeline/scheduler.ts
  - src/engine/camera/preset-registry.ts
  - src/engine/packet/packet-state.ts
  - src/client/packet/packet-interpolator.ts
  - src/render/remotion/render-composition.tsx
  - src/render/export/fingerprint.ts
  - src/fixtures/golden-scene-spec.json
  - tests/scene-spec-validation.test.ts
  - tests/capability-registry.test.ts
  - tests/timeline-determinism.test.ts
  - tests/camera-preset-bounds.test.ts
  - tests/packet-engine.integration.test.ts
  - tests/render-composition.test.ts
  - tests/render-repro-smoke.test.ts
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-28T08:02:00Z  
**Depth:** standard  
**Files Reviewed:** 21  
**Status:** issues_found

## Summary

Reviewed all Phase 02 source and test files listed in phase summaries, plus CI/runtime config touched by the phase. Core deterministic architecture and reproducibility checks are solid, but there are two correctness risks that can produce misleading validation behavior and non-deterministic camera preset resolution through external mutation. Test coverage is generally good and all tests currently pass, but one critical edge-case assertion is missing.

## Warnings

### WR-01: Missing `schemaVersion` is misclassified as unsupported version

**File:** `src/engine/contracts/validate-scene-spec.ts:35`  
**Issue:** The pre-parse gate treats any object whose `schemaVersion` is not exactly `"1.0.0"` as `UNSUPPORTED_SCHEMA_VERSION`. When `schemaVersion` is missing, this returns an "unsupported" error instead of a "missing required field" error. This can mislead callers and regress structured error semantics promised by the contract.  
**Fix:**
```ts
if (raw && typeof raw === "object") {
  if (!("schemaVersion" in raw)) {
    return {
      ok: false,
      errors: [
        {
          path: "schemaVersion",
          code: "MISSING_REQUIRED_FIELD",
          message: "schemaVersion is required.",
          hint: `Set schemaVersion to '${SUPPORTED_SCHEMA_VERSION}'.`
        }
      ]
    };
  }
  if (raw.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    // existing UNSUPPORTED_SCHEMA_VERSION branch
  }
}
```

### WR-02: Camera preset registry is shallow-copied and externally mutable

**File:** `src/engine/camera/preset-registry.ts:51`  
**Issue:** `createPresetRegistry()` only shallow-copies the top-level `presets` object. Nested `ShotPreset` objects remain aliased to caller-owned input, so external mutation after registry creation can silently change cue resolution behavior and break deterministic guarantees.  
**Fix:** Deep-clone preset entries (or freeze registry + nested presets) when creating the registry.

```ts
export function createPresetRegistry(input: ShotPresetRegistryInput): ShotPresetRegistryInput {
  const presets = Object.fromEntries(
    Object.entries(input.presets).map(([key, preset]) => [key, { ...preset }])
  );
  return {
    version: input.version,
    presets
  };
}
```

## Info

### IN-01: Missing regression test for missing `schemaVersion` behavior

**File:** `tests/scene-spec-validation.test.ts:42-53`  
**Issue:** Tests cover unsupported schema version but not the edge case where `schemaVersion` is absent. Without this, a future refactor could keep returning the wrong error code unnoticed.  
**Fix:** Add a test that deletes `schemaVersion` and asserts `MISSING_REQUIRED_FIELD` with `path: "schemaVersion"`.

---

_Reviewed: 2026-05-28T08:02:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
