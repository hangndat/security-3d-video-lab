# Phase 19: TLS Publish-Ready Production — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.4 Phase 19 + Phase 17–18 R3F stack + v1.3 crew pipeline

<domain>
## Phase Boundary

Deliver **PROD-01**: first publish-ready TLS cinematic module using the full crew pipeline and implemented R3F stack.

1. **Production SceneSpec** — upgrade from export-gate `golden-scene-spec.json` to beat-complete TLS production fixture aligned to `tls/contract.json`.
2. **Production render path** — wire `getComposePlan` / viz frame state into deterministic MP4 export at full module duration (beyond CI short profile).
3. **Production quality + security gates** — rubric assertions, security accuracy sign-off automation, crew pipeline artifact bundle.

This phase does **not** integrate ElevenLabs TTS (Phase 20), close v1.4 milestone (Phase 20), or scale to other topics.

</domain>

<decisions>
## Implementation Decisions

### Production SceneSpec (19-01)
- New canonical fixture: `src/fixtures/tls-production-scene-spec.json`.
- `totalFrames` = 236 (matches TLS contract `tls-app-data-beat` endFrame).
- Five timeline packet cues mapped to contract beats: hook, client-hello, server-hello, finished, app-data.
- Actors: client, server; packets per beat; cue ids and `packetVariant` hints drive Phase 17–18 module resolver.
- Keep `golden-scene-spec.json` unchanged for backward-compatible CI short exports.

### Render strategy (19-01)
- Add `renderCompositionProductionMp4(sceneSpec, outputPath, profile?)` — full `totalFrames`, 640×360, 30 fps (publish profile; still CI-safe via PPM/ffmpeg).
- **Viz-aware trace:** extend `deriveRenderFrameState` with `vizRenderTraceInput` hashing compose `renderOrder` + packet positions (uses `getComposePlan` + optional caption map from TLS assembly).
- Do **not** require headless WebGL in CI for Phase 19; full `@remotion/three` capture deferred to post-v1.4 if needed.
- `renderCompositionDemoMp4` unchanged (30-frame short profile) — existing export tests must not regress.

### Production quality rubric (19-02)
- Add `PRODUCTION_EXPORT_QUALITY_POLICY` in `export-quality.ts` — duration window derived from scene `totalFrames / 30` (TLS: ~7.5–8.5s tolerance band).
- Add `src/verification/tls-production-rubric.ts` — scene beat coverage, module mapping vs security checklist, artifact presence.

### Crew pipeline artifacts (19-02)
- Output root: `.artifacts/production/tls/`
- Machine-readable: `security-signoff.json`, `production-manifest.json`
- Human-readable snapshots: `beat-sheet.md`, `render-handoff.md`, `audio-layer-handoff.md` (generated from contract + production scene paths)
- `scripts/verify-tls-production.mjs` — export MP4, assert rubric, write evidence JSON to `.artifacts/verification/phase19/`

### Security sign-off (19-02)
- Automate per-beat checks from `docs/security-accuracy-checklist.md` TLS table: beat id → expected primary `viz-*` module from compose plan at representative frame.
- Narration alignment via existing `validateNarrationAlignment` on stub track (ElevenLabs deferred Phase 20).

### Testing strategy
- New `tests/tls-production-export.test.ts` — production SceneSpec validation, viz-aware trace determinism, MP4 + rubric gates.
- Regression: `tests/render-composition.test.ts`, `tests/viz-*-modules.test.ts`, `tests/e2e-canonical-flows.test.ts` (golden short path unchanged).

### Claude's Discretion
- Exact timeline cue ids and packet routes in production fixture
- Whether production MP4 uses 640×360 or 1280×720 (default 640×360 for CI speed)
- Artifact generator as script vs test helper

</decisions>

<canonical_refs>
## Phase 17–18 foundation

| Artifact | Path |
|----------|------|
| Viz compose | `src/client/viz/compose-scene.tsx` |
| Module resolver | `src/client/viz/resolve-modules.ts` |
| R3F catalog | `docs/r3f-module-catalog.md` |
| Server-hello partial | `src/fixtures/tls-server-hello-scene-spec.json` |

## Crew pipeline (v1.3)

| Artifact | Path |
|----------|------|
| TLS contract | `src/content/topics/tls/contract.json` |
| Walkthrough | `docs/tls-crew-walkthrough.md` |
| Security checklist | `docs/security-accuracy-checklist.md` |
| Render skill | `.cursor/skills/cinematic-creative-technologist/SKILL.md` |
| Orchestrator checklist | `.cursor/skills/cinematic-production-orchestrator/templates/pipeline-checklist.md` |

## Export / narration

| Module | Path |
|--------|------|
| Short render | `src/render/remotion/render-composition.tsx` |
| Export quality | `src/verification/export-quality.ts` |
| Caption map | `src/content/composition/generate-caption-timing-map.ts` |
| Narration alignment | `src/content/narration/validate-narration-alignment.ts` |

## Beat → module mapping (TLS production)

| Beat | Expected module(s) at beat window |
|------|----------------------------------|
| tls-hook | `viz-packet-threat` |
| tls-client-hello-beat | `viz-packet-flow`, `viz-tunnel-handshake` |
| tls-server-hello-beat | `viz-cert-single`, `viz-tunnel-handshake` |
| tls-finished-beat | `viz-tunnel-secure` |
| tls-app-data-beat | `viz-packet-encrypted`, `viz-tunnel-secure` |

</canonical_refs>

<deferred>
## Deferred Ideas

- Headless WebGL / `@remotion/three` full cinematic capture
- ElevenLabs TTS (Phase 20)
- Multi-topic publish-ready rollout

</deferred>

---
*Phase: 19-tls-publish-ready-production*
*Context gathered: 2026-05-31*
