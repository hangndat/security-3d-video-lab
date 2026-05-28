# ROADMAP

## Milestones

- ✅ **v1.0 Milestone** — Phases 1-4 (shipped 2026-05-28)
- 🚧 **v1.1 Content Expansion** — Phases 5-8 (planned)

## Phases

<details>
<summary>✅ v1.0 Milestone (Phases 1-4) — SHIPPED 2026-05-28</summary>

- [x] `01-docs-foundation` — completed (plan `01-01`)
- [x] `02-mvp-engine` — completed (plans `02-01` to `02-04`)
- [x] `03-first-content-batch` — completed (legacy `PLAN.md` + gap-closure `03-02`)
- [x] `04-e2e-testing` — completed (legacy `PLAN.md`)

</details>

### 🚧 v1.1 Content Expansion (Planned)

- [ ] **Phase 05: Content Authoring Foundation**
  - **Goal:** Introduce data-first content authoring and validation contracts for new security modules.
  - **Requirements:** `CONT-01`, `CONT-03`, `AUTHR-01`, `AUTHR-02`
  - **Plans:** 2 plans
  - **Plan List:**
    - [x] `05-01-PLAN.md` — Build JSON contract schema, loader/validator pipeline, and deterministic contract tests.
    - [ ] `05-02-PLAN.md` — Add scaffold workflow, three new topic drafts, and blocking CI/evidence gates.
  - **Success Criteria:**
    1. New topic packets can be declared via data files/contracts without core renderer edits.
    2. Validation errors clearly identify missing beats, invalid windows, or ordering issues.
    3. At least two new module drafts validate successfully in CI.

- [ ] **Phase 06: Narrative and Cinematic Composition**
  - **Goal:** Build reusable long-form composition and pacing presets for multi-module storytelling.
  - **Requirements:** `CONT-02`, `AUTHR-03`, `CINE-01`, `CINE-03`
  - **Success Criteria:**
    1. Long-form assembly supports configurable sequence of expanded modules.
    2. Transition/pacing presets are reusable and validated against deterministic replay checks.
    3. Subtitle/caption timing maps are generated per beat for long-form output.

- [ ] **Phase 07: Batch Quality and Verification Expansion**
  - **Goal:** Add robust quality gates and measurable verification for expanded module batches.
  - **Requirements:** `CINE-02`, `VER-01`, `VER-03`
  - **Success Criteria:**
    1. Each new module has automated packet/export/long-form linkage tests.
    2. Export quality assertions pass for all new short and long-form artifacts.
    3. Verification reports include KPI acceptance signals per module.

- [ ] **Phase 08: Governance and Milestone Hardening**
  - **Goal:** Restore and enforce requirements/audit governance for clean milestone completion.
  - **Requirements:** `VER-02`
  - **Success Criteria:**
    1. Requirement traceability remains complete and updated through all phase transitions.
    2. Milestone audit artifact is generated and passes before close.
    3. Completion workflow no longer relies on deferred governance exceptions.

## Current Status

Phase 05 is in progress (1 of 2 plans complete).

## Progress

| Phase | Milestone | Requirements | Status |
|------|-----------|--------------|--------|
| 01-04 | v1.0 | Archived | Complete |
| 05 | v1.1 | CONT-01, CONT-03, AUTHR-01, AUTHR-02 | In Progress (1/2 plans) |
| 06 | v1.1 | CONT-02, AUTHR-03, CINE-01, CINE-03 | Planned |
| 07 | v1.1 | CINE-02, VER-01, VER-03 | Planned |
| 08 | v1.1 | VER-02 | Planned |

## Status Rules

- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
