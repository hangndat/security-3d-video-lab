# ROADMAP

## Milestones

- ✅ **v1.0 Milestone** — Phases 1-4 (shipped 2026-05-28) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Content Expansion** — Phases 5-8 (shipped 2026-05-29) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 Content Depth** — Phases 9-12 (shipped 2026-05-31) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Cinematic Crew Skills** — Phases 13-16 (shipped 2026-05-31) — [archive](milestones/v1.3-ROADMAP.md)
- 🚧 **v1.4 Production Content** — Phases 17-20 (in progress)

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
- [x] **Phase 10: Narrative Branch Variants** (2/2 plans) — completed 2026-05-31
- [x] **Phase 11: Narration Pipeline** (2/2 plans) — completed 2026-05-31
- [x] **Phase 12: v1.2 Verification and Governance** (2/2 plans) — completed 2026-05-31

</details>

<details>
<summary>✅ v1.3 Cinematic Crew Skills (Phases 13-16) — SHIPPED 2026-05-31</summary>

- [x] **Phase 13: Director & Art Director Skills** (2/2 plans) — completed 2026-05-31
- [x] **Phase 14: Storyboard & 3D Motion Skills** (2/2 plans) — completed 2026-05-31
- [x] **Phase 15: Render & Security Audio Skills** (2/2 plans) — completed 2026-05-31
- [x] **Phase 16: Production Orchestrator & Skills Verification** (2/2 plans) — completed 2026-05-31

</details>

### Phase 17: R3F Packet & Tunnel Modules

- [ ] **Phase 17: R3F Packet & Tunnel Modules** (0/2 plans)
  - **Goal:** Implement packet and tunnel R3F components bound to engine frame state and style bible tokens.
  - **Requirements:** `VIZ-01`, `VIZ-02`
  - **Depends on:** v1.3 R3F module catalog, `packet-state.ts`, `docs/style-bible.md`, crew motion skill
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `17-01-PLAN.md` — Packet R3F modules: flow, encrypted, threat variants (VIZ-01).
    - [ ] `17-02-PLAN.md` — Tunnel R3F modules: secure channel and handshake (VIZ-02).
  - **Success Criteria:**
    1. All three packet catalog ids render deterministically from golden SceneSpec fixtures.
    2. Tunnel modules compose with active timeline windows without breaking packet interpolation.
    3. Visual output uses style bible tokens; no hardcoded magic colors in components.

### Phase 18: R3F Certificate & HUD Modules

- [ ] **Phase 18: R3F Certificate & HUD Modules** (0/2 plans)
  - **Goal:** Complete the four-family R3F catalog with certificate and HUD overlay components.
  - **Requirements:** `VIZ-03`, `VIZ-04`
  - **Depends on:** Phase 17 packet/tunnel foundation, SceneSpec actor and caption fields
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `18-01-PLAN.md` — Certificate R3F modules: single cert and chain (VIZ-03).
    - [ ] `18-02-PLAN.md` — HUD R3F modules: actor labels and beat captions (VIZ-04).
  - **Success Criteria:**
    1. Certificate modules render for TLS server-hello beat fixtures.
    2. HUD modules display actor labels and beat captions aligned to caption timing maps.
    3. Full catalog `viz-*` ids from `docs/r3f-module-catalog.md` have R3F implementations.

### Phase 19: TLS Publish-Ready Production

- [ ] **Phase 19: TLS Publish-Ready Production** (0/2 plans)
  - **Goal:** Produce the first publish-ready TLS cinematic scene using the full crew pipeline and R3F stack.
  - **Requirements:** `PROD-01`
  - **Depends on:** Phases 17–18 (all R3F modules), v1.3 crew skills, TLS contract and walkthrough
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `19-01-PLAN.md` — TLS SceneSpec production upgrade and Remotion composition wiring (PROD-01).
    - [ ] `19-02-PLAN.md` — Production quality rubric, security sign-off, and export artifacts (PROD-01).
  - **Success Criteria:**
    1. TLS module MP4 passes production quality assertions beyond export-gate thresholds.
    2. Crew pipeline artifacts (beat sheet through audio handoff) exist for TLS production run.
    3. Security accuracy checklist signed off for all TLS beats.

### Phase 20: TTS Integration & Milestone Close

- [ ] **Phase 20: TTS Integration & Milestone Close** (0/2 plans)
  - **Goal:** Wire ElevenLabs TTS with CI-safe fallback and close v1.4 with governance verification.
  - **Requirements:** `PROD-02`, `VER-07`
  - **Depends on:** Phase 19 TLS production scene, v1.2 narration pipeline
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `20-01-PLAN.md` — ElevenLabs provider + deterministic stub fallback (PROD-02).
    - [ ] `20-02-PLAN.md` — v1.4 verification gate, milestone audit, traceability close (VER-07).
  - **Success Criteria:**
    1. ElevenLabs provider generates narration when API key present; CI uses stub deterministically.
    2. Narration alignment validation passes for TLS production export bundle.
    3. v1.4 milestone audit PASS with zero pending traceability requirements.

## Current Status

**Active milestone:** v1.4 Production Content — Phase 17 next.

Run `/gsd-discuss-phase 17` or `/gsd-plan-phase 17` to begin.

## Status Rules

- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
