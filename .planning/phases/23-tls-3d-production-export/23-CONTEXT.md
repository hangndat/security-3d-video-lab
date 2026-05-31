# Phase 23: TLS 3D Production Export — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.5 Phase 23 + Phases 21–22 headless stack + Phase 19 crew pipeline

<domain>
## Phase Boundary

Deliver **RENDER-03**: TLS production bundle exports **real 3D video-only MP4** (640×360, full `totalFrames`) using `r3f-headless` by default, replacing trace-hash as the local publish output.

1. **Video-only export path** — `generateTlsProductionArtifacts` renders via PNG frame sequence; narration/TTS generation is optional (deferred for v1.5 default path).
2. **Manifest contract** — records `renderBackend`, `frameSource`, `videoOnly`; narration fields not required when video-only.
3. **Rubric + verification** — TLS beat/module sign-off still passes; 3D export smoke tests and verify gate prove PNG-backed MP4 locally.

This phase does **not** change CI backend policy (Phase 24 / RENDER-04), close v1.5 milestone (Phase 24 / VER-08), or re-enable audio mux (PROD-04).

</domain>

<decisions>
## Implementation Decisions

### Video-only default (v1.5)
- `generateTlsProductionArtifacts(..., env)` defaults to **video-only** mode: skip narration track generation and audio handoff content that implies mux.
- Explicit opt-in for legacy v1.4 audio path: `SECURITY_LAB_INCLUDE_NARRATION=true` (or `includeNarration` option) for backward compatibility in tests only if needed.
- `renderCompositionProductionMp4` called with resolved backend; local default `r3f-headless` when env unset.

### Manifest schema bump
- Bump to `schemaVersion: "1.1.0"` for video-only manifests.
- Required: `renderBackend`, `frameSource` (`"png"` | `"ppm-trace-hash"`), `videoOnly: true`.
- Optional: `narrationTrackPath`, `narrationProviderId` (absent in default v1.5 export).

### Rubric split
- **Module rubric** (unchanged): five TLS beats → expected `viz-*` modules at representative frames.
- **Narration rubric**: skipped when `videoOnly`; signoff sets `narrationAlignmentValid: null` or omits narration approval gate.
- New helper: `assertTlsVideoProductionRubric` or `assertTlsProductionRubric(..., { videoOnly: true })`.

### Proof of 3D export (not trace-hash)
- `frameSource: "png"` when `renderBackend === "r3f-headless"`.
- GL-gated test: local env → manifest `renderBackend === "r3f-headless"` and MP4 passes `assertExportQuality`.
- Non-GL CI: existing trace-hash path unchanged; tests use env override.

### Claude's Discretion
- Whether verify script is `verify-tls-3d-production.mjs` vs extend `verify-tls-production.mjs`
- Exact env flag name for narration opt-in
- Whether to regenerate committed `.artifacts/production/tls/` in repo or test-only temp dirs

</decisions>

<canonical_refs>
## Phase 21–22 handoffs

| Artifact | Path |
|----------|------|
| Production renderer | `src/render/remotion/render-composition.tsx` |
| Backend resolver | `src/render/headless/resolve-production-render-backend.ts` |
| PNG capture | `src/render/headless/capture-viz-frame-png.ts` |
| Scene builder (11 modules) | `src/render/headless/build-viz-three-scene.ts` |
| TLS fixture | `src/fixtures/tls-production-scene-spec.json` (236 frames) |

## Phase 19 handoffs

| Artifact | Path |
|----------|------|
| Artifact generator | `src/render/export/generate-tls-production-artifacts.ts` |
| Production rubric | `src/verification/tls-production-rubric.ts` |
| Verify gate | `scripts/verify-tls-production.mjs` |
| Crew walkthrough | `docs/tls-crew-walkthrough.md` |

</canonical_refs>

<deferred>
## Deferred Ideas

- CI/nightly 3D matrix (Phase 24 / RENDER-04)
- Milestone audit close (Phase 24 / VER-08)
- Narration/TTS audio mux on 3D MP4 (PROD-04)
- Pixel golden comparison trace-hash vs 3D MP4

</deferred>

---
*Phase: 23-tls-3d-production-export*
*Context gathered: 2026-05-31*
