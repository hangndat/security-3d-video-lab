# Phase 21: Headless Capture Foundation — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.5 Phase 21 + v1.4 deferred headless WebGL gap

<domain>
## Phase Boundary

Restore and harden the headless Three.js capture layer for Security Cinematic Lab:

1. **RENDER-01** — PNG frame capture from SceneSpec + compose plan via `@headless-three/renderer`, with env-gated backend selection (`r3f-headless` vs `trace-hash`).

This phase delivers `src/render/headless/` modules, fixes broken imports in `render-composition.tsx`, and proves deterministic single-frame capture in tests. It does **not** require full eleven-module scene parity (Phase 22), TLS 3D production MP4 default (Phase 23), or TTS/audio (out of scope for v1.5).

</domain>

<decisions>
## Implementation Decisions

### Render backend policy
- **Default local:** `r3f-headless` when `SECURITY_LAB_RENDER_BACKEND` unset.
- **CI PR smoke:** `trace-hash` via env in `.github/workflows/ci.yml` (no GL required on ubuntu-latest).
- **Explicit override:** `SECURITY_LAB_RENDER_BACKEND=trace-hash|hash` or `r3f-headless`.

### Scene builder scope (Phase 21 vs 22)
- Phase 21 ships a **minimal** `buildVizThreeScene` covering packet + tunnel modules active on `golden-scene-spec.json` and TLS production representative frames — enough to prove PNG capture works.
- Full catalog parity (cert, HUD, all eleven ids) is **Phase 22** (RENDER-02).

### Determinism
- Same SceneSpec + frame + captionMap → identical PNG byte hash across repeated `captureVizFramePng` calls on the same platform/backend.
- Trace-hash backend remains deterministic (existing `vizRenderTraceInput` path).

### Testing strategy
- Unit tests for `resolveProductionRenderBackend` (pure env parsing).
- Headless capture tests run when `@headless-three/renderer` native binary loads; guard with `describe.skipIf` or env flag when GL unavailable.
- Do not block CI on headless GL — CI uses trace-hash for render smoke.

### Claude's Discretion
- Exact minimal mesh set in Phase 21 scene builder
- Whether to add `verify:headless-capture` vs extend `verify:tls-production` in 21-02
- PNG magic-byte assertion vs full pixel hash golden file

</decisions>

<canonical_refs>
## v1.4 handoffs

| Artifact | Path |
|----------|------|
| Compose plan API | `src/client/viz/compose-scene.tsx` |
| Style tokens | `src/client/viz/style-tokens.ts` |
| Production renderer | `src/render/remotion/render-composition.tsx` |
| TLS production fixture | `src/fixtures/tls-production-scene-spec.json` |
| Golden fixture | `src/fixtures/golden-scene-spec.json` |

## Broken / missing (must fix)

| Item | Path |
|------|------|
| Empty headless dir | `src/render/headless/` (imports exist, files missing) |
| Headless dep | `@headless-three/renderer@0.1.7` in `package.json` |

## ADR alignment

| Decision | Path |
|----------|------|
| Three.js + R3F authoring | `.planning/adr/ADR-001-tech-stack.md` |
| Remotion + FFmpeg export | same |

</canonical_refs>

<deferred>
## Deferred Ideas

- Full eleven-module Three.js parity (Phase 22)
- TLS production MP4 from PNG sequence as default (Phase 23)
- `@remotion/three` React composition (post-v1.5)
- TTS / audio mux (v6 PROD-04)

</deferred>

---
*Phase: 21-headless-capture-foundation*
*Context gathered: 2026-05-31*
