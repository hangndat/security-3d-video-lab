# PROJECT

## Name
Security Cinematic Lab

## Mission
Build a code-driven cinematic visualization platform that explains security and infrastructure concepts with high technical clarity and strong storytelling.

## Problem
Most technical education is slide-heavy and weakly visual, while modern systems (TLS, SSH, DNS, cloud infrastructure, AI agents) are dynamic and better explained through animated flows.

## Current Milestone

**Between milestones** — v1.1 Content Expansion shipped 2026-05-29. Use `/gsd-new-milestone` to start v1.2.

## Success Signals
- Deterministic scene/timeline architecture is defined and followed.
- MVP render pipeline is reproducible.
- Content batches are production-ready with measurable verification gates.
- Milestone governance (requirements traceability + audit) is automated in CI.

## Current State

- **v1.0** shipped 2026-05-28: deterministic engine, TLS/SSH/DNS first batch, canonical E2E verification.
- **v1.1** shipped 2026-05-29: six-topic content manifest, JSON authoring contracts, long-form composition, batch quality gates, governance hardening.
- **101 tests** passing; CI runs content, composition, batch quality, and governance gates.
- **Six security modules:** TLS, SSH, DNS, auth-session, pki-trust-chain, mitm-defense.
- **Two long-form assemblies:** network-foundations-long-v1, security-expansion-long-v1.

## Next Milestone Goals

Candidate directions for v1.2 (to be defined in `/gsd-new-milestone`):

- Visual storyboard UI (PLAT-01) — move beyond file-only authoring.
- Publish portal with viewer analytics (PLAT-02).
- Automated voice synthesis pipeline once caption/timing maps are stable.
- Additional security domains and interactive narrative branches.

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

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full SaaS multi-tenant platform | Not required for current content pipeline milestones |
| Real-time collaborative editor | File-driven authoring sufficient through v1.1 |
| Automated voice synthesis pipeline | Deferred until caption/timing map is stable |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Move shipped requirements to Validated
4. Update Context with current state

---
*Last updated: 2026-05-29 after v1.1 milestone archive*
