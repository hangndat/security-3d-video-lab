---
phase: 05-content-authoring-foundation
reviewed: 2026-05-28T13:01:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - .github/workflows/ci.yml
  - package.json
  - scripts/scaffold-topic-contract.mjs
  - scripts/verify-content-authoring.mjs
  - src/content/batch/first-content-batch.ts
  - src/content/contracts/load-topic-contracts.ts
  - src/content/contracts/load-topic-manifest.ts
  - src/content/contracts/topic-contract.schema.json
  - src/content/contracts/transition-presets.ts
  - src/content/contracts/types.ts
  - src/content/contracts/validate-topic-contracts.ts
  - src/content/topics/auth-session/contract.json
  - src/content/topics/dns/contract.json
  - src/content/topics/manifest.json
  - src/content/topics/mitm-defense/contract.json
  - src/content/topics/pki-trust-chain/contract.json
  - src/content/topics/ssh/contract.json
  - src/content/topics/tls/contract.json
  - tests/content-authoring-foundation.test.ts
  - tests/content-contracts.test.ts
  - tests/first-content-batch.test.ts
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-05-28T13:01:00Z  
**Depth:** standard  
**Files Reviewed:** 21  
**Status:** issues_found

## Summary

Phase 05 introduces a solid JSON-schema + semantic validation pipeline, manifest-locked topic loading, scaffold/verify CLIs, and blocking PR gates. Contract tests (26 cases across three suites) pass locally. No critical security defects were found in reviewed source.

The main risks are operational: import-time validation couples the render batch to all manifest topics (including drafts), the scaffold CLI can write outside the repo via `--topics-root`, and the verification script can report a passing E2E gate in `--quick` mode without running smoke tests. Test coverage is strong for happy paths and collect-all validation, but lacks negative tests for scaffold path boundaries and manifest-loader edge cases.

## Warnings

### WR-01: Scaffold CLI allows writes outside the topics tree

**File:** `scripts/scaffold-topic-contract.mjs:30-33,116-127`  
**Issue:** `--topics-root` is passed through `resolve()` with no guard that the path stays inside the repository (or a caller-supplied allowlist). Topic slug sanitization prevents `../` in the topic name, but a user or script can still target any writable directory on the machine.  
**Fix:** Resolve and require `topicsRoot` to be under `REPO_ROOT/src/content/topics` (or reject paths that do not start with the resolved default root):

```javascript
const REPO_TOPICS_ROOT = resolve(fileURLToPath(new URL("../src/content/topics", import.meta.url)));

function assertAllowedTopicsRoot(topicsRoot) {
  const resolved = resolve(topicsRoot);
  if (resolved !== REPO_TOPICS_ROOT && !resolved.startsWith(`${REPO_TOPICS_ROOT}/`)) {
    throw new Error(`--topics-root must stay within ${REPO_TOPICS_ROOT}`);
  }
  return resolved;
}
```

Add a test that `--topics-root /tmp` (or similar) exits non-zero.

### WR-02: Import-time validation blocks batch on any manifest topic failure

**File:** `src/content/batch/first-content-batch.ts:60-67`  
**Issue:** `loadTopicContracts()` and `validateTopicContracts()` run at module import and throw on any blocking error across all six manifest topics. A broken draft contract (`auth-session`, `pki-trust-chain`, `mitm-defense`) prevents importing `firstContentBatchPackets` even though only TLS/SSH/DNS are exported for rendering. This is consistent with D-11 but is a regression footgun when expanding drafts.  
**Fix:** Either document as intentional (blocking gate) or split validation:

```typescript
const allContracts = loadTopicContracts();
const batchContracts = allContracts.filter(({ contract }) =>
  (FIRST_CONTENT_BATCH_TOPICS as readonly string[]).includes(contract.topic)
);
const batchValidation = validateTopicContracts(batchContracts, FIRST_CONTENT_BATCH_TOPICS);
// Keep full-manifest validation in verify script / CI only
```

### WR-03: `validateTopicContracts` default manifest can desync from custom loader root

**File:** `src/content/contracts/validate-topic-contracts.ts:18-21`  
**Issue:** When the second argument is omitted, `manifestOrder` defaults to `loadTopicManifest()` (default topics path), not the `topicsRoot` used by `loadTopicContracts(customRoot)`. Callers that load from a temp directory but validate without passing `manifest.order` will compare against the production manifest.  
**Fix:** Accept optional `topicsRoot` and load manifest from the same root, or require `manifestOrder` when `topicsRoot !==` default:

```typescript
export function validateTopicContracts(
  loadedContracts: LoadedTopicContract[],
  manifestOrder: readonly string[] = loadTopicManifest(TOPICS_ROOT).order
): TopicContractValidationResult
```

Export `TOPICS_ROOT` from the loader module so defaults stay aligned.

### WR-04: Scaffold overwrites existing contracts without guard

**File:** `scripts/scaffold-topic-contract.mjs:126-127`  
**Issue:** `writeFileSync` always overwrites `contract.json`. Re-running scaffold on an existing topic silently destroys authored beats and placeholders.  
**Fix:** Fail if the contract file already exists unless `--force` is passed:

```javascript
import { existsSync } from "node:fs";

if (existsSync(contractPath) && !options.force) {
  throw new Error(`Contract already exists at ${contractPath}; use --force to overwrite.`);
}
```

### WR-05: Verification script reports E2E pass when `--quick` skips smoke

**File:** `scripts/verify-content-authoring.mjs:176-188,198-200`  
**Issue:** In `--quick` mode, the `e2e-canonical-smoke` suite is injected with `passed: true` and `exitCode: 0`. Local runs of `npm run verify:content-authoring -- --quick` can produce `gateStatus: "pass"` and markdown showing E2E PASS without executing smoke tests. CI runs the full script without `--quick`, but developers may trust the artifact locally.  
**Fix:** Mark skipped suites explicitly and fail gate unless quick mode is allowed:

```javascript
passed: false,
skipped: true,
// gateStatus: quickMode ? (contractErrors === 0 && suitesPassed) : ...
```

Or set `gateStatus` to `"pass-with-warnings"` / require `CI=true` for full pass. Add a test that full verify (no `--quick`) includes a real E2E invocation when feasible in CI.

## Info

### IN-01: Verification report never surfaces contract warnings

**File:** `scripts/verify-content-authoring.mjs:211`  
**Issue:** `warningCount` is hardcoded to `0` and the script only runs AJV schema checks in `summarizeModules`, not `validateTopicContracts` semantic warnings (e.g., duration drift >10%).  
**Fix:** Import and run `validateTopicContracts(loadTopicContracts())` and set `warningCount` from `result.warnings.length`; include warnings in markdown.

### IN-02: No dedicated tests for `load-topic-manifest.ts` edge cases

**File:** `src/content/contracts/load-topic-manifest.ts:28-44`  
**Issue:** Manifest validation (unsupported `schemaVersion`, duplicate ids, invalid slug pattern) is implemented but not covered by focused unit tests; only indirect coverage via loader/authoring tests.  
**Fix:** Add `tests/load-topic-manifest.test.ts` with temp manifest fixtures for duplicate order entries and invalid topic ids.

### IN-03: `validateBatchCompleteness` reuses import-time validation snapshot

**File:** `src/content/batch/first-content-batch.ts:177-182`  
**Issue:** `contractValidation` is computed once at module load. `validateBatchCompleteness()` always re-appends those initial errors even if contracts were fixed in memory in tests (unlikely today).  
**Fix:** Re-run `validateTopicContracts(loadTopicContracts())` inside `validateBatchCompleteness` or document that completeness is tied to import-time state.

---

## Test coverage assessment

| Area | Covered | Gap |
| --- | --- | --- |
| Schema strictness, collect-all errors | Yes (`content-contracts.test.ts`) | — |
| Manifest order lock | Yes | — |
| Duration warn vs fail | Yes | — |
| Draft modules validate | Yes | — |
| CI blocking policy (string match) | Yes | Does not execute workflow |
| Scaffold happy path | Yes | No negative path / topics-root boundary |
| Dual-format evidence | Yes (via `--quick` verify) | Full verify E2E not asserted in unit tests |
| Import-time batch gate with drafts | Implicit (tests import batch) | No test simulating broken draft blocking batch |

All 26 tests in the three primary phase suites passed at review time.

---

_Reviewed: 2026-05-28T13:01:00Z_  
_Reviewer: Claude (gsd-code-reviewer)_  
_Depth: standard_
