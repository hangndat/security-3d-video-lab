# Requirements: Security Cinematic Lab

**Defined:** 2026-05-31
**Core Value:** Cinematic, deterministic security/infrastructure visualization with high technical clarity.

## v6 Requirements

Deferred to future release.

### Platform

- **PLAT-01**: User can edit storyboards in a visual UI instead of file-based authoring.
- **PLAT-02**: User can publish generated explainers to a content portal with viewer analytics dashboard.

### Content Scale

- **PROD-03**: Second topic module (SSH or DNS) upgraded to publish-ready cinematic production using the TLS template.

### Audio

- **PROD-04**: Re-enable narration/TTS audio mux on 3D-rendered production exports when audio milestone resumes.

## Out of Scope

| Feature | Reason |
|---------|--------|
| TTS / ElevenLabs / narration audio mux | Explicitly deferred; v1.5 shipped video-only 3D render |
| `@remotion/three` React composition | Evaluate after headless Three.js path is stable |
| Multi-topic 3D rollout | TLS canonical first; PROD-03 deferred |
| Visual storyboard UI (PLAT-01) | Platform milestone |
| Publish portal (PLAT-02) | Platform milestone |
| New security topics in manifest | Apply render pipeline to existing catalog only |

## Traceability

Machine-validated by `scripts/validate-requirement-traceability.mjs` on every PR and at milestone close.

Between milestones: v1.5 requirements archived in `.planning/milestones/v1.5-REQUIREMENTS.md`.

| Requirement | Phase | Status |
|-------------|-------|--------|
| *(v1.5 archived)* | — | — |

**Coverage:**
- Active milestone requirements: pending next milestone via `/gsd-new-milestone`
- v1.5 archived: 5/5 complete

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 — v1.5 Real 3D Render shipped*
