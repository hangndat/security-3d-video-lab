# Phase 03: first-content-batch - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce the first validation content batch using the deterministic engine from Phase 02: three short protocol explainers (TLS, SSH, DNS) plus one stitched long-form cut, each with normalized templates, beat-level narration placeholders, and strict KPI capture for retention/feedback/pacing decisions.

</domain>

<decisions>
## Implementation Decisions

### Batch Output Definition
- **D-01:** Enforce strict 45-60 second duration window for each short asset.
- **D-02:** Deliver one stitched long-form cut in TLS -> SSH -> DNS order with 4-6 minute envelope.
- **D-03:** Asset acceptance requires beat coverage complete, narration placeholders complete, playable render, and metadata logged.
- **D-04:** Batch completion is strict: all 3 shorts and long-form must pass before phase is marked done.
- **D-05:** Package outputs as per-asset bundles plus a top-level batch manifest.
- **D-06:** Long-form acceptance has hard prerequisite on all three short assets passing.
- **D-07:** Use deterministic slug + version naming contract (no timestamp-variant file IDs).
- **D-08:** Long-form must pass readiness bundle plus explicit transition coherence checks (TLS->SSH, SSH->DNS).

### Template and Storyboard Normalization
- **D-09:** Use uniform core scaffold across TLS/SSH/DNS with bounded topic-specific extension slots.
- **D-10:** Normalize beats with canonical beat taxonomy and topic-prefixed IDs (`tls-*`, `ssh-*`, `dns-*`).
- **D-11:** Allow only whitelisted extension fields under strict schema.
- **D-12:** Enforce schema + linter gate before render/export.

### Narration Placeholder Strategy
- **D-13:** Maintain one narration placeholder record per storyboard beat.
- **D-14:** Placeholder contract is structured + required fields (not free-form notes only).
- **D-15:** Enforce hard timing envelope per beat (min/target/max), validated against beat duration budget.
- **D-16:** Emit stable analytic key per placeholder tied to `beatId` for downstream KPI mapping.

### KPI Capture Contract
- **D-17:** Mandatory KPI set per asset includes retention checkpoints, qualitative feedback tags, and pacing verdict.
- **D-18:** Retention checkpoints are fixed relative positions: 25%, 50%, 75%, and completion.
- **D-19:** Pacing verdict scale uses strict enum: `too_fast | balanced | too_slow`.
- **D-20:** KPI completeness gate requires all required fields, valid schema, and no null checkpoints.

### Release Sequencing and Risk Handling
- **D-21:** Execute assets in sequential gated order: TLS -> SSH -> DNS -> long-form.
- **D-22:** On any asset acceptance failure, stop pipeline and fix before continuing.
- **D-23:** Allow at most one deterministic retry per failed asset run.
- **D-24:** Escalate to explicit gap-closure planning (`--gaps`) on any blocker after retry or repeated KPI schema failures.

### Claude's Discretion
- None recorded for this discussion; decisions were explicitly selected.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Criteria
- `.planning/phases/03-first-content-batch/PLAN.md` - phase goal, execution steps, quality gates, and exit criteria.
- `.planning/ROADMAP.md` - phase dependency graph and status gating between phases.
- `.planning/phases/03-first-content-batch/VERIFICATION.md` - current verification expectations and known dependency assumptions.

### Content and Beat Definitions
- `docs/phase2-content-packets.md` - canonical topic packets, storyboard beats, duration budgets, and long-form assembly map.

### Engine and Determinism Baseline (Phase 02 Carry-Forward)
- `.planning/phases/02-mvp-engine/02-CONTEXT.md` - locked deterministic/rendering decisions and contracts to preserve.
- `.planning/phases/02-mvp-engine/02-VERIFICATION.md` - phase-2 verified truths and constraints required for content pipeline confidence.
- `.planning/adr/ADR-002-timeline-architecture.md` - timeline architecture contract assumptions.
- `.planning/adr/ADR-003-e2e-testing-strategy.md` - verification strategy and gate discipline.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/engine/timeline/scheduler.ts` - deterministic frame scheduler to drive beat execution order.
- `src/engine/packet/packet-state.ts` and `src/client/packet/packet-interpolator.ts` - packet lifecycle and client interpolation foundations for protocol visuals.
- `src/render/remotion/render-composition.tsx` - composition-backed deterministic render/export path.
- `src/render/export/fingerprint.ts` - reproducibility fingerprint contracts tied to composition traces.

### Established Patterns
- Deterministic-first contract and strict schema validation from Phase 02 must be preserved in content templates and narration/KPI schemas.
- Asset verification relies on hard gates (schema/lint/test/export), not manual-only acceptance.

### Integration Points
- Phase 03 templates and placeholder schemas must integrate with scheduler/camera/packet contracts from Phase 02.
- KPI artifacts must map per beat/asset and feed future verification and phase 04 e2e readiness.

</code_context>

<specifics>
## Specific Ideas

- Keep phase delivery auditable: each asset bundle includes render artifact, metadata, placeholder map, and KPI capture record.
- Enforce transition coherence explicitly in long-form acceptance checks rather than subjective review.
- Preserve deterministic naming and schema gates so KPI comparisons remain stable across reruns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-first-content-batch*  
*Context gathered: 2026-05-28*
