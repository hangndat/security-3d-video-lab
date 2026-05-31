# Requirements: Security Cinematic Lab

**Defined:** 2026-05-31
**Core Value:** Cinematic, deterministic security/infrastructure visualization with high technical clarity.

## v1.3 Requirements

Requirements for the Cinematic Crew Skills milestone — codify six production roles as project skills before publish-ready content work.

### Director & Art Direction

- [x] **CREW-01**: Director skill guides narrative beats, branch logic, and retention pacing (p25/p50/p75) aligned to topic contracts and long-form assemblies.
- [x] **CREW-02**: Art Director skill and style bible codify dark sci-fi documentary look (color, typography, lighting, camera mood) as machine-readable tokens.

### Storyboard & Motion

- [ ] **CREW-03**: Technical Storyboard Artist skill maps beats to spatial shot lists and validates handoff to SceneSpec schema.
- [ ] **CREW-04**: 3D Motion Designer skill defines R3F visual module catalog (packet, tunnel, cert, HUD) with naming and composition conventions.

### Render & Subject Matter

- [ ] **CREW-05**: Creative Technologist skill documents Remotion composition, engine wiring, render profiles, and export bundle linkage.
- [ ] **CREW-06**: Security SME + Audio skill provides technical accuracy checklist and voice/sound layer guidance tied to narration pipeline.

### Orchestration & Verification

- [ ] **CREW-07**: Production orchestrator skill routes the six domain skills in pipeline order with explicit handoff checklists.
- [ ] **VER-06**: Skills are indexed for agent discovery and verified via TLS module walkthrough proving the full skill chain.

## v4 Requirements

Deferred to future release.

### Production Content

- **PROD-01**: At least one module upgraded from export-gate fixture to publish-ready cinematic scene.
- **PROD-02**: Real TTS provider integration (ElevenLabs) with deterministic CI fallback.

### Platform

- **PLAT-01**: User can edit storyboards in a visual UI instead of file-based authoring.
- **PLAT-02**: User can publish generated explainers to a content portal with viewer analytics dashboard.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Publish-ready video production | Deferred to v1.4 Production Content milestone after skills land |
| Real TTS / cloud voice APIs | Skills document layers; provider integration deferred to v1.4 |
| New security topics in manifest | Content scale deferred; skills apply to existing nine topics |
| Visual storyboard UI (PLAT-01) | Platform milestone; skills-first for v1.3 |
| Full R3F module implementation | v1.3 defines catalog and conventions; implementation in v1.4+ |
| CI governance re-architecture | Reuse v1.2 traceability; extend IDs only |

## Traceability

Machine-validated by `scripts/validate-requirement-traceability.mjs` on every PR and at milestone close.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CREW-01 | Phase 13 | Complete |
| CREW-02 | Phase 13 | Complete |
| CREW-03 | Phase 14 | Pending |
| CREW-04 | Phase 14 | Pending |
| CREW-05 | Phase 15 | Pending |
| CREW-06 | Phase 15 | Pending |
| CREW-07 | Phase 16 | Pending |
| VER-06 | Phase 16 | Pending |

**Coverage:**
- v1.3 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 — Phase 13 Director & Art Director skills complete*
