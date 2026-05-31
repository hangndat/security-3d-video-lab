# ROADMAP

## Milestones

- ✅ **v1.0 Milestone** — Phases 1-4 (shipped 2026-05-28) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Content Expansion** — Phases 5-8 (shipped 2026-05-29) — [archive](milestones/v1.1-ROADMAP.md)
- 🚧 **v1.2 Content Depth** — Phases 9-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 Milestone (Phases 1-4) — SHIPPED 2026-05-28</summary>

- [x] `01-docs-foundation` — completed (plan `01-01`)
- [x] `02-mvp-engine` — completed (plans `02-01` to `02-04`)
- [x] `03-first-content-batch` — completed (legacy `PLAN.md` + gap-closure `03-02`)
- [x] `04-e2e-testing` — completed (legacy `PLAN.md`)

</details>

<details>
<summary>✅ v1.1 Content Expansion (Phases 5-8) — SHIPPED 2026-05-29</summary>

- [x] **Phase 05: Content Authoring Foundation** (2/2 plans) — completed 2026-05-28
- [x] **Phase 06: Narrative and Cinematic Composition** (2/2 plans) — completed 2026-05-28
- [x] **Phase 07: Batch Quality and Verification Expansion** — completed 2026-05-29
- [x] **Phase 08: Governance and Milestone Hardening** (2/2 plans) — completed 2026-05-29

</details>

### Phase 09: Advanced Security Topics

- [x] **Phase 09: Advanced Security Topics** (2/2 plans) — completed 2026-05-31
  - **Goal:** Add three advanced security modules and integrate them into the content manifest and long-form assemblies.
  - **Requirements:** `CONT-04`, `CONT-05`, `CONT-06`
  - **Depends on:** v1.1 Phase 05 (topic contracts, manifest lock, scaffold workflow)
  - **Plans:** 2/2 plans complete
  - **Plan List:**
    - [x] `09-01-PLAN.md` — Extend schema enums, transition presets, and mitm-defense outbound link for v1.2 topic chain.
    - [x] `09-02-PLAN.md` — Author three advanced topic contracts, nine-topic manifest, and content-depth-long-v1 assembly.
  - **Success Criteria:**
    1. Topic contracts for zero-trust-access, oauth-jwt-session, and api-gateway-waf validate in CI.
    2. manifest.json includes all nine topics with deterministic ordering rules preserved.
    3. At least one new long-form assembly profile stitches new modules with transition presets.
    4. Beat-level narration placeholders pass validation for every new module.

### Phase 10: Narrative Branch Variants

- [x] **Phase 10: Narrative Branch Variants** (2/2 plans) — completed 2026-05-31
  - **Goal:** Enable alternate narrative paths in assembly profiles with deterministic replay per branch.
  - **Requirements:** `NARR-01`, `NARR-02`
  - **Depends on:** Phase 09 (new modules available for branch sequences)
  - **Plans:** 2/2 plans complete
  - **Plan List:**
    - [x] `10-01-PLAN.md` — Branch schema, validator, loader, fork presets, and stitch API (NARR-01 engine).
    - [x] `10-02-PLAN.md` — content-depth-branched-v1 profile, per-branch replay tests, verify script (NARR-01 + NARR-02).
  - **Success Criteria:**
    1. Assembly JSON schema supports branch variants with named paths and explicit module sequences.
    2. At least two branch variants (e.g., attack-path, defense-path) render without core engine changes.
    3. Deterministic replay tests pass independently for each declared branch variant.

### Phase 11: Narration Pipeline

- [ ] **Phase 11: Narration Pipeline** (0/0 plans)
  - **Goal:** Generate narration-ready audio from caption timing maps and attach metadata to exports.
  - **Requirements:** `VOIC-01`, `VOIC-02`
  - **Depends on:** Phase 06 caption timing maps (v1.1); Phase 09 beat coverage
  - **Plans:** TBD
  - **Success Criteria:**
    1. Narration generator produces audio segments aligned to beat timing windows within tolerance.
    2. Long-form exports include narration track metadata linked to caption timing map beats.
    3. Pipeline runs deterministically in CI with stable artifact naming conventions.

### Phase 12: v1.2 Verification and Governance

- [ ] **Phase 12: v1.2 Verification and Governance** (0/0 plans)
  - **Goal:** Close v1.2 with full E2E coverage for new content and restored CI governance gates.
  - **Requirements:** `VER-04`, `VER-05`
  - **Depends on:** Phases 09–11 (content, branches, narration deliverables)
  - **Plans:** TBD
  - **Success Criteria:**
    1. Every v1.2 module and branch variant has automated E2E and KPI acceptance tests.
    2. Requirement traceability validator covers v1.2 IDs and passes milestone-close mode.
    3. CI governance gates (traceability, milestone audit) are re-enabled and green.

## Current Status

**Active milestone:** v1.2 Content Depth — Phase 10 complete; Phase 11 next.

Run `/gsd-plan-phase 11` or `/gsd-execute-phase 11` to continue.

## Status Rules

- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
