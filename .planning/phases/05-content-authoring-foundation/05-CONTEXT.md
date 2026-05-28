# Phase 05: content-authoring-foundation - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a data-first content authoring foundation for new security explainer modules so creators can add topics with strict validation and deterministic quality gates, without changing core render logic.

</domain>

<decisions>
## Implementation Decisions

### Data Contract Model
- **D-01:** Source of truth uses `JSON + schema validator` rather than TS-authored packet definitions.
- **D-02:** Topic content contract is `one file per topic` (packet + beats + metadata in the same topic contract file).
- **D-03:** Transition policy uses a required `preset catalog`; transitions must be selected from approved presets with compatibility checks.
- **D-04:** Schema versioning is strict literal and blocks mismatch immediately (no implicit compatibility range).

### Validation Rules
- **D-05:** Validation collects all errors first, then fails once with a detailed report (no first-error abort).
- **D-06:** Duration policy is soft-window: warn for mild drift, fail when outside hard threshold.
- **D-07:** Long-form ordering is manifest-locked; no auto-reordering at runtime.

### Authoring Workflow
- **D-08:** Folder layout is topic-centric: `src/content/topics/<topic>/contract.json`.
- **D-09:** Module naming follows slug + semantic version, e.g. `<topic>-short-v<major>`.
- **D-10:** New topic flow uses a scaffold CLI to generate contract template + beat stubs.

### Governance and Evidence
- **D-11:** Phase done-gate is fully blocking: all contract tests and E2E smoke must pass.
- **D-12:** Verification evidence must be dual-format: machine-readable JSON artifacts plus human-readable `VERIFICATION.md`.
- **D-13:** CI trigger policy for this phase is `PR full validation every time`.

### Claude's Discretion
- Exact schema engine/library choice and file split strategy for shared validation utilities.
- Concrete warning/fail threshold numbers for soft duration windows.
- CLI UX details for scaffolder flags and output formatting.

</decisions>

<specifics>
## Specific Ideas

- The project should keep cinematic smoothness while expanding security topics, so contract expansion must not degrade deterministic rendering quality.
- Data-first authoring is prioritized to speed up module creation rather than hardcoding additional packets in source files.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and Phase Scope
- `.planning/ROADMAP.md` — v1.1 phase definitions, Phase 05 boundary, success criteria direction.
- `.planning/PROJECT.md` — milestone goal and product direction for Content Expansion.
- `.planning/REQUIREMENTS.md` — requirement IDs for phase mapping (`CONT-01`, `CONT-03`, `AUTHR-01`, `AUTHR-02`).

### Existing Content Contract Baseline
- `src/content/batch/first-content-batch.ts` — current typed packet/beat/transition/KPI baseline to migrate toward data-first contracts.
- `tests/first-content-batch.test.ts` — existing content validation behavior and acceptance patterns.
- `tests/first-content-batch-export.test.ts` — stitched long-form and export gate expectations.

### Deterministic Rendering and E2E Gate Context
- `tests/e2e-canonical-flows.test.ts` — deterministic replay and artifact quality checks currently enforced.
- `src/render/remotion/render-composition.ts` — composition and stitching path used by content contracts.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `firstContentBatchPackets` and related types in `src/content/batch/first-content-batch.ts`: strong baseline contract to map into JSON schema.
- `validateBatchCompleteness()`: existing acceptance aggregation pattern that can be refactored into schema-driven validators.
- `buildLongFormSceneSpec()` + transition coherence checks: existing long-form linkage logic to preserve under new authoring model.

### Established Patterns
- Deterministic-first validation is already a core pattern (replay fingerprints + strict export assertions).
- Topic order and long-form sequence are explicitly validated and currently fail on mismatch.
- KPI acceptance gates already enforce non-null requirements and provide concrete failure messages.

### Integration Points
- New JSON contracts should plug into current render pipeline before `renderCompositionDemoMp4` execution.
- Phase 05 validators must integrate with existing test suite entrypoints to satisfy blocking gate policy.
- Scaffold CLI output should feed directly into topic contract discovery/registry for downstream phases.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-content-authoring-foundation*
*Context gathered: 2026-05-28*
