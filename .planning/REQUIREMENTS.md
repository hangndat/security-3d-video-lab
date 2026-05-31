# Requirements: Security Cinematic Lab

**Defined:** 2026-05-31
**Core Value:** Cinematic, deterministic security/infrastructure visualization with high technical clarity.

## v1.5 Requirements

Requirements for the Real 3D Render milestone — export TLS cinematic video from headless Three.js using the existing R3F catalog, without TTS or audio mux.

### Headless 3D Capture

- [x] **RENDER-01**: Headless Three.js frame capture produces deterministic PNG bytes per frame from SceneSpec + compose plan via `@headless-three/renderer` (or equivalent), with resolution and camera from style bible tokens.
- [ ] **RENDER-02**: Scene builder maps all eleven `viz-*` catalog modules to Three.js meshes from a single source of truth shared with R3F components (style bible tokens; no divergent duplicate geometry logic).

### Production Video Export

- [ ] **RENDER-03**: TLS production export generates video-only MP4 (640×360, full frame count) using the `r3f-headless` render backend by default; narration/TTS/audio mux is not required in this milestone.
- [ ] **RENDER-04**: Render backend selection is env-gated (`SECURITY_LAB_RENDER_BACKEND`): CI smoke uses `trace-hash` fallback on GL-less runners; local and nightly profiles can run full 3D capture with documented commands.

### Verification & Governance

- [ ] **VER-08**: v1.5 render requirements are machine-validated in CI and pass milestone-close with zero unmapped requirements.

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
| TTS / ElevenLabs / narration audio mux | Explicitly deferred; v1.5 is video-only 3D render |
| `@remotion/three` React composition | Evaluate after headless Three.js path is stable |
| Multi-topic 3D rollout | TLS canonical first; PROD-03 deferred |
| Visual storyboard UI (PLAT-01) | Platform milestone |
| Publish portal (PLAT-02) | Platform milestone |
| New security topics in manifest | Apply render pipeline to existing catalog only |

## Traceability

Machine-validated by `scripts/validate-requirement-traceability.mjs` on every PR and at milestone close.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RENDER-01 | Phase 21 | Complete |
| RENDER-02 | Phase 22 | Pending |
| RENDER-03 | Phase 23 | Pending |
| RENDER-04 | Phase 24 | Pending |
| VER-08 | Phase 24 | Pending |

**Coverage:**
- v1.5 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-31*
*Last updated: 2026-05-31 — Phase 21 complete (RENDER-01)*
