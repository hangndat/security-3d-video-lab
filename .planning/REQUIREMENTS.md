# Requirements: Security Cinematic Lab

**Defined:** 2026-05-31
**Core Value:** Cinematic, deterministic security/infrastructure visualization with high technical clarity.

## v1.4 Requirements

Requirements for the Production Content milestone — implement R3F visual modules and deliver the first publish-ready cinematic module (TLS).

### R3F Visual Modules

- [x] **VIZ-01**: R3F packet modules (`viz-packet-flow`, `viz-packet-encrypted`, `viz-packet-threat`) render deterministically from SceneSpec packet-state and style bible tokens.
- [x] **VIZ-02**: R3F tunnel modules (`viz-tunnel-secure`, `viz-tunnel-handshake`) compose with active timeline windows and packet routes.
- [x] **VIZ-03**: R3F certificate modules (`viz-cert-single`, `viz-cert-chain`) render beat-aligned trust visuals for TLS handshake scenes.
- [x] **VIZ-04**: R3F HUD modules (`viz-hud-actor-label`, `viz-hud-beat-caption`) overlay actor labels and beat captions per style bible typography.

### Publish-Ready Production

- [x] **PROD-01**: TLS module upgraded from export-gate fixture to publish-ready cinematic scene with crew pipeline artifacts, security accuracy sign-off, and export quality assertions passing a production rubric.
- [x] **PROD-02**: ElevenLabs TTS when `ELEVENLABS_API_KEY` is set; otherwise deterministic dummy audio (`deterministic-stub`) for CI and keyless runs — narration tracks stay aligned to caption timing maps.

### Verification & Governance

- [x] **VER-07**: v1.4 production content requirements are machine-validated in CI and pass milestone-close with zero unmapped requirements.

## v5 Requirements

Deferred to future release.

### Platform

- **PLAT-01**: User can edit storyboards in a visual UI instead of file-based authoring.
- **PLAT-02**: User can publish generated explainers to a content portal with viewer analytics dashboard.

### Content Scale

- **PROD-03**: Second topic module (SSH or DNS) upgraded to publish-ready cinematic production using the TLS template.

## Out of Scope

| Feature | Reason |
|---------|--------|
| All nine topics publish-ready | TLS canonical proof first; scale in v1.5+ |
| Visual storyboard UI (PLAT-01) | Platform milestone |
| Publish portal (PLAT-02) | Platform milestone |
| New security topics in manifest | Apply pipeline to existing nine topics only |
| Crew skill rewrites | v1.3 skills are reference; extend docs only if R3F API diverges |

## Traceability

Machine-validated by `scripts/validate-requirement-traceability.mjs` on every PR and at milestone close.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIZ-01 | Phase 17 | Complete |
| VIZ-02 | Phase 17 | Complete |
| VIZ-03 | Phase 18 | Complete |
| VIZ-04 | Phase 18 | Complete |
| PROD-01 | Phase 19 | Complete |
| PROD-02 | Phase 20 | Complete |
| VER-07 | Phase 20 | Complete |

**Coverage:**
- v1.4 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 — v1.4 Production Content milestone closed*
