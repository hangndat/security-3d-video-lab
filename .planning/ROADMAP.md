# ROADMAP

## Milestones

- ✅ **v1.0 Milestone** — Phases 1-4 (shipped 2026-05-28) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Content Expansion** — Phases 5-8 (shipped 2026-05-29) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 Content Depth** — Phases 9-12 (shipped 2026-05-31) — [archive](milestones/v1.2-ROADMAP.md)
- 🚧 **v1.3 Cinematic Crew Skills** — Phases 13-16 (in progress)

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

<details>
<summary>✅ v1.2 Content Depth (Phases 9-12) — SHIPPED 2026-05-31</summary>

- [x] **Phase 09: Advanced Security Topics** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `CONT-04`, `CONT-05`, `CONT-06`
- [x] **Phase 10: Narrative Branch Variants** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `NARR-01`, `NARR-02`
- [x] **Phase 11: Narration Pipeline** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `VOIC-01`, `VOIC-02`
- [x] **Phase 12: v1.2 Verification and Governance** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `VER-04`, `VER-05`

</details>

### Phase 13: Director & Art Director Skills

- [x] **Phase 13: Director & Art Director Skills** (2/2 plans) — completed 2026-05-31
  - **Goal:** Codify narrative direction and visual style as agent skills with repo-linked playbooks.
  - **Requirements:** `CREW-01`, `CREW-02`
  - **Depends on:** v1.2 topic contracts, assemblies, caption maps (reference material)
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [x] `13-01-PLAN.md` — Director skill: beats, branch logic, retention pacing (CREW-01).
    - [x] `13-02-PLAN.md` — Art Director skill + `docs/style-bible.md` style tokens (CREW-02).
  - **Success Criteria:**
    1. `.cursor/skills/cinematic-director/` skill loads with beat sheet and pacing checklist templates.
    2. `.cursor/skills/cinematic-art-director/` skill references codifiable dark sci-fi documentary tokens.
    3. Both skills link to existing contract/assembly artifacts without duplicating engine code.

### Phase 14: Storyboard & 3D Motion Skills

- [x] **Phase 14: Storyboard & 3D Motion Skills** (2/2 plans) — completed 2026-05-31
  - **Goal:** Bridge narrative beats to spatial SceneSpec and R3F visual module conventions.
  - **Requirements:** `CREW-03`, `CREW-04`
  - **Depends on:** Phase 13 (style + pacing context), SceneSpec schema, engine contracts
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [x] `14-01-PLAN.md` — Storyboard Artist skill: beat → shot list → SceneSpec handoff (CREW-03).
    - [x] `14-02-PLAN.md` — 3D Motion Designer skill: R3F module catalog packet/tunnel/cert/HUD (CREW-04).
  - **Success Criteria:**
    1. Storyboard skill produces shot-list template mappable to `SceneSpec` fields.
    2. Motion skill documents module API and composition rules for R3F visual primitives.
    3. Skills reference `src/engine/contracts/scene-spec.ts` and fixture patterns.

### Phase 15: Render & Security Audio Skills

- [ ] **Phase 15: Render & Security Audio Skills** (0/2 plans)
  - **Goal:** Wire creative technology and subject-matter accuracy into the production pipeline.
  - **Requirements:** `CREW-05`, `CREW-06`
  - **Depends on:** Phase 14 SceneSpec handoff, v1.2 narration pipeline
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `15-01-PLAN.md` — Creative Technologist skill: Remotion + engine + export bundle (CREW-05).
    - [ ] `15-02-PLAN.md` — Security SME + Audio skill: accuracy checklist + voice/sound layers (CREW-06).
  - **Success Criteria:**
    1. Creative Technologist skill documents render profiles, determinism, and export paths.
    2. Security SME skill ties beat objectives to verifiable security claims.
    3. Audio skill aligns narration placeholders, caption maps, and sound layer guidance.

### Phase 16: Production Orchestrator & Skills Verification

- [ ] **Phase 16: Production Orchestrator & Skills Verification** (0/2 plans)
  - **Goal:** Chain all crew skills and verify with a TLS module walkthrough plus agent index.
  - **Requirements:** `CREW-07`, `VER-06`
  - **Depends on:** Phases 13–15 (all domain skills)
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `16-01-PLAN.md` — Production orchestrator skill with ordered handoff pipeline (CREW-07).
    - [ ] `16-02-PLAN.md` — AGENTS.md skills index, TLS walkthrough doc, traceability close (VER-06).
  - **Success Criteria:**
    1. Orchestrator skill routes Director → Art → Storyboard → Motion → Tech → SME/Audio in order.
    2. TLS walkthrough document demonstrates full chain on existing `tls` topic contract.
    3. Requirement traceability passes for all eight v1.3 IDs at milestone close.

## Current Status

**Active milestone:** v1.3 Cinematic Crew Skills — Phase 15 ready to execute.

Run `/gsd-execute-phase 15` to deliver Creative Technologist and Security SME + Audio skills.

## Status Rules

- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
