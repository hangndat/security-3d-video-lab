# ROADMAP

## Milestones

- ✅ **v1.0 Milestone** — Phases 1-4 (shipped 2026-05-28) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Content Expansion** — Phases 5-8 (shipped 2026-05-29) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 Content Depth** — Phases 9-12 (shipped 2026-05-31) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Cinematic Crew Skills** — Phases 13-16 (shipped 2026-05-31) — [archive](milestones/v1.3-ROADMAP.md)
- ✅ **v1.4 Production Content** — Phases 17-20 (shipped 2026-05-31) — [archive](milestones/v1.4-ROADMAP.md)
- 🚧 **v1.5 Real 3D Render** — Phases 21-24 (in progress)

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

<details>
<summary>✅ v1.4 Production Content (Phases 17-20) — SHIPPED 2026-05-31</summary>

- [x] **Phase 17: R3F Packet & Tunnel Modules** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `VIZ-01`, `VIZ-02`
- [x] **Phase 18: R3F Certificate & HUD Modules** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `VIZ-03`, `VIZ-04`
- [x] **Phase 19: TLS Publish-Ready Production** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `PROD-01`
- [x] **Phase 20: TTS Integration & Milestone Close** (2/2 plans) — completed 2026-05-31
  - **Requirements:** `PROD-02`, `VER-07`

</details>

### Phase 21: Headless Capture Foundation

- [x] **Phase 21: Headless Capture Foundation** (2/2 plans — completed 2026-05-31)
  - **Goal:** Restore and harden headless Three.js PNG capture wired to compose plan and production render backend selection.
  - **Requirements:** `RENDER-01` ✓
  - **Depends on:** v1.4 R3F catalog, `renderCompositionProductionMp4`, `@headless-three/renderer` dep
  - **Plans:** 2 plans, 1 wave — PLAN-CHECK PASS
  - **Plan List:**
    - [x] `21-01-PLAN.md` — Headless capture module: `captureVizFramePng`, backend resolver, frame PNG tests (RENDER-01).
    - [x] `21-02-PLAN.md` — Production render path integration, CI backend policy, verify script (RENDER-01).
  - **Success Criteria:**
    1. Single-frame PNG capture returns non-empty buffer with stable hash for TLS fixture frame.
    2. `SECURITY_LAB_RENDER_BACKEND` switches between `r3f-headless` and `trace-hash`.
    3. CI smoke passes without requiring GPU on default PR path.

### Phase 22: Scene Builder Parity

- [ ] **Phase 22: Scene Builder Parity** (0/2 plans — ready to execute)
  - **Goal:** Unify R3F catalog geometry with headless Three.js scene builder so all eleven modules render in GL.
  - **Requirements:** `RENDER-02`
  - **Depends on:** Phase 21 headless capture, `docs/style-bible.md`, `src/client/viz/` registry
  - **Plans:** 2 plans, 1 wave — PLAN-CHECK PASS
  - **Plan List:**
    - [ ] `22-01-PLAN.md` — Shared mesh factory / scene builder for packet and tunnel modules (RENDER-02).
    - [ ] `22-02-PLAN.md` — Cert, HUD, lighting, camera parity and catalog coverage tests (RENDER-02).
  - **Success Criteria:**
    1. All eleven `viz-*` ids produce Three.js meshes when active in compose plan.
    2. Style bible tokens drive colors, lighting, and camera — no magic hex in builder.
    3. Frame-state tests prove module stack parity with R3F compose plan.

### Phase 23: TLS 3D Production Export

- [ ] **Phase 23: TLS 3D Production Export** (0/2 plans — planned)
  - **Goal:** TLS production bundle exports real 3D MP4 (video-only) replacing trace-hash placeholder as default local output.
  - **Requirements:** `RENDER-03`
  - **Depends on:** Phases 21–22, `tls-production-scene-spec.json`, Phase 19 crew artifacts
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `23-01-PLAN.md` — Wire `generateTlsProductionArtifacts` to r3f-headless default; video-only manifest (RENDER-03).
    - [ ] `23-02-PLAN.md` — 3D production rubric, visual smoke tests, updated crew handoffs (RENDER-03).
  - **Success Criteria:**
    1. `.artifacts/production/tls/tls-production.mp4` is encoded from PNG frame sequence (not hash colors).
    2. Production manifest records render backend and omits narration as required field.
    3. TLS security sign-off and module rubric still pass on 3D export path.

### Phase 24: Render CI & Milestone Close

- [ ] **Phase 24: Render CI & Milestone Close** (0/2 plans — planned)
  - **Goal:** CI/nightly render strategy, v1.5 verification gates, and milestone audit close.
  - **Requirements:** `RENDER-04`, `VER-08`
  - **Depends on:** Phase 23 TLS 3D export
  - **Plans:** 2 plans, 1 wave
  - **Plan List:**
    - [ ] `24-01-PLAN.md` — CI backend policy, nightly 3D matrix, verify:3d-render script (RENDER-04).
    - [ ] `24-02-PLAN.md` — V15 audit, traceability close, milestone archive (VER-08).
  - **Success Criteria:**
    1. PR CI uses trace-hash; documented path runs full 3D render locally/nightly.
    2. `verify:3d-render` and v1.5 milestone audit PASS.
    3. Zero pending v1.5 traceability requirements at close.

## Current Status

**Active milestone:** v1.5 Real 3D Render — Phase 22 ready to execute.

Run `/gsd-execute-phase 22` to begin scene builder parity.

## Status Rules

- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
