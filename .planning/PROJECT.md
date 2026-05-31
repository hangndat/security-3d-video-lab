# PROJECT

## Name
Security Cinematic Lab

## Mission
Build a code-driven cinematic visualization platform that explains security and infrastructure concepts with high technical clarity and strong storytelling.

## Problem
Most technical education is slide-heavy and weakly visual, while modern systems (TLS, SSH, DNS, cloud infrastructure, AI agents) are dynamic and better explained through animated flows.

## Current Milestone: v1.3 Cinematic Crew Skills

**Goal:** Codify six cinematic production roles as project Agent Skills so content work follows a repeatable crew pipeline before publish-ready production.

**Target features:**
- Director, Art Director, Storyboard Artist, 3D Motion, Creative Technologist, Security SME + Audio skills in `.cursor/skills/`
- Codifiable style bible (dark sci-fi documentary)
- Production orchestrator skill chaining handoffs beat → SceneSpec → render → audio
- TLS walkthrough validating the full skill chain

**Strategic choice:** Skills-first — enables v1.4 Production Content without improvising roles each session. Platform UI (PLAT-01/02) still deferred.

## Success Signals
- Deterministic scene/timeline architecture is defined and followed.
- MVP render pipeline is reproducible.
- Content batches are production-ready with measurable verification gates.
- Milestone governance (requirements traceability + audit) is automated in CI.
- Agent skills encode cinematic crew roles with repo-linked references.

## Current State

- **v1.0** shipped 2026-05-28: deterministic engine, TLS/SSH/DNS first batch, canonical E2E verification.
- **v1.1** shipped 2026-05-29: six-topic manifest, JSON authoring contracts, long-form composition, batch quality gates.
- **v1.2** shipped 2026-05-31: nine topics, branch variants, narration pipeline, export verification, CI governance.
- **159+ tests** passing; pipeline produces export-gate fixtures, not yet publish-ready cinematics.
- **No project skills yet** — `.cursor/skills/` to be created in v1.3.

## Validated Requirements

### v1.0
- ✓ Deterministic engine contracts and reproducibility — v1.0
- ✓ First content batch (TLS/SSH/DNS) — v1.0
- ✓ Canonical E2E verification — v1.0

### v1.1
- ✓ CONT-01 through CONT-03 — content expansion and beat coverage
- ✓ AUTHR-01 through AUTHR-03 — data-first authoring and presets
- ✓ CINE-01 through CINE-03 — cinematic quality and caption maps
- ✓ VER-01 through VER-03 — module tests and KPI verification

### v1.2
- ✓ CONT-04 through CONT-06 — advanced security modules and manifest integration
- ✓ NARR-01, NARR-02 — branch variants with deterministic replay
- ✓ VOIC-01, VOIC-02 — narration pipeline and export bundle metadata
- ✓ VER-04, VER-05 — export E2E coverage and CI governance

## Out of Scope

| Feature | Reason |
|---------|--------|
| Publish-ready video (v1.4) | Skills milestone precedes production upgrade |
| Visual storyboard UI (PLAT-01) | Platform milestone; after skills + production |
| Publish portal with analytics (PLAT-02) | Platform milestone; after skills + production |
| Real TTS cloud provider | Documented in CREW-06 skill; wired in v1.4 |
| Full R3F module implementation | Catalog in CREW-04; build in v1.4+ |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Move shipped requirements to Validated
4. Update Context with current state

---
*Last updated: 2026-05-31 — v1.3 Cinematic Crew Skills milestone started*
