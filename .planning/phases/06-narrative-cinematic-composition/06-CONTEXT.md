# Phase 06: narrative-cinematic-composition - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Generalize long-form narrative composition from a single hardcoded TLS→SSH→DNS assembly into data-driven assembly profiles with reusable transition/pacing presets, deterministic replay validation, and per-beat caption timing maps for stitched outputs.

Out of scope for this phase: export codec/quality gates (Phase 07), KPI dashboards (Phase 07), governance audit (Phase 08), voice synthesis, visual storyboard UI.

</domain>

<decisions>
## Implementation Decisions

### Long-Form Assembly Model
- **D-01:** Long-form assemblies are JSON profiles under `src/content/assemblies/<slug>.json`, separate from per-topic `contract.json`.
- **D-02:** Each assembly declares `slug`, `sequence[]`, `targetWindowMinutes`, and optional `defaultPacingPresetId`.
- **D-03:** Assembly sequence topics must exist in `src/content/topics/manifest.json` order; assembly may use any contiguous or full manifest subsequence but not arbitrary reordering.
- **D-04:** Preserve existing canonical assembly `network-foundations-long-v1` (TLS→SSH→DNS) as the default profile; add `security-expansion-long-v1` (6-topic manifest sequence) as the expansion profile.

### Transition and Pacing Presets
- **D-05:** Transition presets remain in `transition-presets.ts` with whitelist + `allowedPairs`; extend catalog for new topic adjacencies (dns→auth-session, auth-session→pki-trust-chain, pki-trust-chain→mitm-defense).
- **D-06:** Introduce pacing preset catalog (`pacing-presets.ts`) describing hold frames, camera transition token, and beat-density policy reused across modules.
- **D-07:** Topic contracts reference `transitionToNext.presetId` and optional `pacingPresetId`; validator checks preset existence and pair compatibility.

### Stitching and Determinism
- **D-08:** `buildLongFormSceneSpec()` moves to assembly-driven module (`build-long-form-scene-spec.ts`) accepting assembly slug + topic scene map.
- **D-09:** Deterministic replay gate uses `buildDeterministicTraceInputs()` on stitched long-form SceneSpec with fixed frame sample set (reuse E2E trace frame pattern).
- **D-10:** Transition coherence validation is assembly-scoped (expected adjacent pairs derived from assembly sequence, not hardcoded tls/ssh/dns).

### Caption Timing Maps
- **D-11:** Caption map artifact is JSON at `.artifacts/captions/<assembly-slug>.json` with schema version literal `1.0.0`.
- **D-12:** Each beat entry includes `topic`, `beatId`, `startFrame`, `endFrame`, `startSeconds`, `endSeconds`, `scriptIntent`, `analyticKey` computed from stitched frame offsets.
- **D-13:** Caption generation is pure function of assembly sequence + topic contracts + stitch offsets (no render-time side effects).

### Verification and Evidence
- **D-14:** Phase gate requires contract/assembly tests + long-form replay tests; E2E smoke remains in CI full validation (not duplicated as blocking in quick verify).
- **D-15:** Dual evidence: `.artifacts/verification/phase06/narrative-composition.json` + `VERIFICATION.md`.

### Claude's Discretion
- Exact pacing preset fields beyond hold/transition/density.
- Whether assembly profiles reference pacing at assembly-level only vs per-topic override.
- Caption map filename suffix versioning strategy.

</decisions>

<specifics>
## Specific Ideas

- Expanded 6-topic narrative should read as one security foundations arc: transport → identity → trust → attack surface.
- Caption maps prepare for future narration pipeline without implementing TTS in v1.1.
- Replay fingerprints on stitched scenes must remain stable across repeated runs on unchanged inputs.

</specifics>

<canonical_refs>
## Canonical References

### Milestone and Requirements
- `.planning/ROADMAP.md` — Phase 06 goal and success criteria.
- `.planning/REQUIREMENTS.md` — `CONT-02`, `AUTHR-03`, `CINE-01`, `CINE-03`.

### Phase 05 Outputs (upstream)
- `src/content/contracts/transition-presets.ts` — transition whitelist baseline.
- `src/content/contracts/load-topic-contracts.ts` — topic contract loader.
- `src/content/topics/manifest.json` — manifest-locked topic order.
- `src/content/batch/first-content-batch.ts` — current long-form assembly + stitch entrypoints.

### Render and Determinism
- `src/render/remotion/render-composition.tsx` — `stitchSceneSpecsInOrder`, `buildDeterministicTraceInputs`.
- `tests/first-content-batch-export.test.ts` — long-form stitch export expectations.
- `tests/e2e-canonical-flows.test.ts` — deterministic replay and artifact checks.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `stitchSceneSpecsInOrder()` already namespaces actors/packets/timeline with topic prefixes and frame offsets.
- `validateLongFormTransitionCoherence()` pattern can generalize to any assembly sequence.
- `narrationPlaceholders` + `storyboardBeats` provide script intent and frame windows for caption derivation.

### Gaps to Close
- `longFormAssembly` and `assertValidTopicSequence("tls,ssh,dns")` are hardcoded.
- `REQUIRED_TRANSITION_PRESET_IDS` only cover two TLS-batch transitions.
- No caption/subtitle artifact generator exists.

</code_context>

<deferred>
## Deferred Ideas

- Automated voice synthesis and burned-in subtitles (v2 / Out of Scope).
- Per-beat camera shot authoring UI (PLAT-01).

</deferred>

---

*Phase: 06-narrative-cinematic-composition*
*Context gathered: 2026-05-28*
