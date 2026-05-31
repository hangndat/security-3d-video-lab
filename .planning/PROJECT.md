# PROJECT

## Name
Security Cinematic Lab

## Mission
Build a code-driven cinematic visualization platform that explains security and infrastructure concepts with high technical clarity and strong storytelling.

## Problem
Most technical education is slide-heavy and weakly visual, while modern systems (TLS, SSH, DNS, cloud infrastructure, AI agents) are dynamic and better explained through animated flows.

## Current Milestone: Between Milestones

**Status:** v1.2 Content Depth shipped 2026-05-31. Run `/gsd-new-milestone` to define the next scope.

**Last shipped:** Nine-topic content library with branching narratives, narration exports, and restored CI governance.

## Success Signals
- Deterministic scene/timeline architecture is defined and followed.
- MVP render pipeline is reproducible.
- Content batches are production-ready with measurable verification gates.
- Milestone governance (requirements traceability + audit) is automated in CI.

## Current State

- **v1.0** shipped 2026-05-28: deterministic engine, TLS/SSH/DNS first batch, canonical E2E verification.
- **v1.1** shipped 2026-05-29: six-topic content manifest, JSON authoring contracts, long-form composition, batch quality gates, governance hardening.
- **v1.2** shipped 2026-05-31: three advanced security modules, branch variants, narration pipeline, nine-topic export verification, CI governance restored.
- **156+ tests** passing; CI runs content, composition, batch quality, content depth, and governance gates.

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
- ✓ VER-02 — auditable requirement traceability

### v1.2
- ✓ CONT-04 through CONT-06 — advanced security modules and manifest integration
- ✓ NARR-01, NARR-02 — branch variants with deterministic replay
- ✓ VOIC-01, VOIC-02 — narration pipeline and export bundle metadata
- ✓ VER-04, VER-05 — export E2E coverage and CI governance

## Out of Scope

| Feature | Reason |
|---------|--------|
| Visual storyboard UI (PLAT-01) | Platform milestone; content-first through v1.2 |
| Publish portal with analytics (PLAT-02) | Platform milestone; content-first through v1.2 |
| Full SaaS multi-tenant platform | Not required for content pipeline milestones |
| Real-time collaborative editor | File-driven authoring sufficient through v1.2 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Move shipped requirements to Validated
4. Update Context with current state

---
*Last updated: 2026-05-31 — v1.2 Content Depth milestone shipped*
