# PROJECT

## Name
Security Cinematic Lab

## Mission
Build a code-driven cinematic visualization platform that explains security and infrastructure concepts with high technical clarity and strong storytelling.

## Problem
Most technical education is slide-heavy and weakly visual, while modern systems (TLS, SSH, DNS, cloud infrastructure, AI agents) are dynamic and better explained through animated flows.

## Current Milestone: Between Milestones

**Last shipped:** v1.5 Real 3D Render (2026-05-31) — headless Three.js TLS video-only 3D MP4, CI trace-hash policy, milestone governance close.

**What's next:** `/gsd-new-milestone` to define the next release cycle.

## Success Signals
- Deterministic scene/timeline architecture is defined and followed.
- MVP render pipeline is reproducible.
- Content batches are production-ready with measurable verification gates.
- Milestone governance (requirements traceability + audit) is automated in CI.
- At least one module produces publish-ready cinematic output, not just export-gate fixtures.

## Current State

- **v1.0** shipped 2026-05-28: deterministic engine, TLS/SSH/DNS first batch, canonical E2E verification.
- **v1.1** shipped 2026-05-29: six-topic manifest, JSON authoring contracts, long-form composition, batch quality gates.
- **v1.2** shipped 2026-05-31: nine topics, branch variants, narration pipeline, export verification, CI governance.
- **v1.3** shipped 2026-05-31: seven cinematic crew skills, style bible, R3F catalog, TLS walkthrough, orchestrator.
- **v1.4** shipped 2026-05-31: eleven R3F modules, TLS publish-ready production, ElevenLabs TTS with stub CI fallback.
- **v1.5** shipped 2026-05-31: headless Three.js capture, scene builder parity, TLS video-only 3D MP4, `verify:3d-render` CI policy.
- **264+ tests** passing at v1.5 close.

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

### v1.3
- ✓ CREW-01 through CREW-07 — cinematic crew skills and orchestrator pipeline
- ✓ VER-06 — skills indexed and TLS walkthrough verification

### v1.4
- ✓ VIZ-01 through VIZ-04 — R3F packet, tunnel, certificate, and HUD modules
- ✓ PROD-01, PROD-02 — TLS publish-ready production and TTS integration
- ✓ VER-07 — v1.4 milestone audit and governance close

### v1.5
- ✓ RENDER-01 through RENDER-04 — headless capture, scene parity, TLS 3D export, CI backend policy
- ✓ VER-08 — v1.5 milestone audit and governance close

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-topic publish-ready rollout | TLS 3D render first; PROD-03 deferred to v6 |
| TTS / audio mux on 3D exports | Deferred to PROD-04; v1.5 is video-only |
| Visual storyboard UI (PLAT-01) | Platform milestone; after production content |
| Publish portal with analytics (PLAT-02) | Platform milestone; after production content |
| New security topics in manifest | Content scale deferred; apply crew pipeline to existing nine |
| CI governance re-architecture | Extend traceability IDs only |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Move shipped requirements to Validated
4. Update Context with current state

---
*Last updated: 2026-05-31 — v1.5 Real 3D Render milestone shipped*
