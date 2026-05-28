# Phase 02: mvp-engine - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver reusable scene, timeline, camera, and packet foundations with a deterministic render/export flow for MVP protocol cinematics. This phase defines the engine contracts and reproducibility gates needed before content-scale work in later phases.

</domain>

<decisions>
## Implementation Decisions

### Engine Contract Shape
- **D-01:** Use a single `SceneSpec` as the canonical source of truth for scene, timeline, camera, and packet definitions.
- **D-02:** Require strict schema with required fields and explicit `schemaVersion`.
- **D-03:** Use ID-based cross-module references with upfront link validation.
- **D-04:** Run pre-render validation as a hard gate before render/export.
- **D-05:** Reject unknown fields in strict mode.
- **D-06:** Hard-fail unsupported `schemaVersion` values (no silent compatibility fallback).
- **D-07:** Emit structured validation errors (`path`, `code`, `message`, `hint`).
- **D-08:** Require a golden `SceneSpec` fixture in CI.
- **D-09:** Extend post-MVP capabilities via explicit feature-flag capability registry.
- **D-10:** Require author-defined stable IDs for scene/track/cue/packet actors.
- **D-11:** Block CI when deterministic-critical fields are missing.
- **D-12:** Enforce strict numeric constraints and bounds in schema.

### Determinism Policy
- **D-13:** Require a deterministic seed in every `SceneSpec`.
- **D-14:** Use frame index as canonical timebase.
- **D-15:** Apply deterministic math policy with fixed precision normalization at comparison boundaries.
- **D-16:** Require matching deterministic manifest plus stable artifact fingerprint policy for identical spec+seed runs.
- **D-17:** Hard-fail reproducibility violations and emit diff bundle.
- **D-18:** Include engine/runtime provenance fingerprint in deterministic manifests.

### Camera Orchestration Style
- **D-19:** Author camera behavior as timeline-cued shot presets.
- **D-20:** Support bounded per-shot parameter overrides on presets.
- **D-21:** Require explicit transition cues in timeline between shots.
- **D-22:** Reference packet actor IDs/groups in camera focus/follow cues.
- **D-23:** Use centrally versioned preset library.
- **D-24:** Hard-fail out-of-bounds preset override requests.

### Packet Primitive Behavior
- **D-25:** Use path-segment interpolation over declared route nodes.
- **D-26:** Use deterministic trail templates with bounded parameters.
- **D-27:** Model branching via explicit spawn events with parent/child IDs.
- **D-28:** Model lifecycle termination with explicit terminal states and deterministic visual cues.

### Render/Export Reproducibility Gate
- **D-29:** Gate on both deterministic run manifest and output fingerprint artifacts.
- **D-30:** Require pinned runtime/toolchain versions for reproducibility checks.
- **D-31:** Compute output fingerprint from frame-sample hash set plus normalized container metadata.
- **D-32:** On gate failure, require failure bundle and rerun-after-fix evidence.

### Claude's Discretion
- Cross-module linking policy was selected by Claude: ID-based references with upfront validation.
- Pre-render validation policy was selected by Claude: hard gate before render/export.
- Unknown-field handling was selected by Claude: strict rejection.
- Unsupported schema-version handling was selected by Claude: hard fail.
- Error reporting format was selected by Claude: structured error list.
- Reproducibility fixture policy was selected by Claude: required golden fixture in CI.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Scope and Contracts
- `docs/brd.md` - source product intent and explanatory outcomes for security visualizations.
- `docs/roadmap.md` - canonical phase goals, done criteria, validation metrics, dependency gates, and MVP boundary controls.
- `.planning/phases/02-mvp-engine/PLAN.md` - phase-specific execution objective and quality gates.

### Content and Story Beats
- `docs/phase2-content-packets.md` - deterministic storyboard beat packets for TLS, SSH, and DNS sequences.

### Governing Decisions
- `.planning/adr/ADR-001-tech-stack.md` - baseline stack expectations for implementation/runtime choices.
- `.planning/adr/ADR-002-timeline-architecture.md` - timeline architecture constraints that inform scheduler/camera integration.
- `.planning/adr/ADR-003-e2e-testing-strategy.md` - verification strategy expectations for render/export confidence.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No implementation source tree is currently present (`docs`-only workspace); Phase 02 should first establish baseline engine modules and reusable contracts.

### Established Patterns
- Planning pattern is strict and gate-driven from Phase 01: explicit done criteria, dependency gates, and validation evidence.
- Deterministic-first philosophy is required by project success signals and prior phase decisions.

### Integration Points
- Phase 02 outputs are prerequisites for `.planning/phases/03-first-content-batch/PLAN.md` and `.planning/phases/04-e2e-testing/PLAN.md`.
- Render/export quality gates in Phase 02 must align with later verification workflows and CI checks.

</code_context>

<specifics>
## Specific Ideas

- Build contract-first engine architecture: schema, validator, deterministic scheduler, and reproducibility tooling before expanding visual scope.
- Preserve stylistic consistency via central shot preset library and bounded overrides.
- Treat deterministic evidence artifacts as first-class outputs (manifest, fingerprint, failure bundle).

</specifics>

<deferred>
## Deferred Ideas

### Deferred Expansion (Post-MVP)
- Physics-like packet motion engine.
- Runtime camera auto-focus heuristics.
- Loose/compatibility schema execution modes.
- Manual reproducibility overrides without artifact evidence.

</deferred>

---

*Phase: 02-mvp-engine*  
*Context gathered: 2026-05-28*
