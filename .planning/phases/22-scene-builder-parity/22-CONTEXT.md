# Phase 22: Scene Builder Parity — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.5 Phase 22 + Phase 21 deferral + RENDER-02

<domain>
## Phase Boundary

Unify R3F catalog geometry with the headless Three.js scene builder so **all eleven `viz-*` modules** produce meshes when active in the compose plan.

1. **RENDER-02** — Single source of truth for mesh geometry and style-token-driven appearance shared between R3F components and `buildVizThreeScene`.

This phase delivers shared mesh specs/factory, refactors packet/tunnel/cert/HUD coverage in headless builder, aligns lighting/camera with style bible tokens, and adds catalog parity tests. It does **not** switch TLS production to 3D MP4 default (Phase 23), change CI backend policy (Phase 24), or add TTS/audio.

</domain>

<decisions>
## Implementation Decisions

### Shared mesh factory location
- **`src/client/viz/viz-mesh-spec.ts`** — geometry args, token key references, and headless mesh builders for all eleven catalog ids.
- R3F components import geometry dimensions from spec constants (not duplicated literals).
- Headless `build-viz-three-scene.ts` calls factory builders instead of inline helpers.

### HUD text in headless GL
- Headless path mirrors R3F **placeholder planes** at identical positions with `userData` labels — no Canvas2D/text texture rendering in v1.5.
- Parity is proven by mesh count, positions, and compose-plan prop wiring — not pixel text legibility.

### Lighting and camera tokens
- Extend `STYLE_TOKENS` with `lightKeyIntensity`, `lightAmbientColor`, `lightAmbientIntensity`, `cameraPositionDefault` from `docs/style-bible.md`.
- Headless builder and (optionally) R3F scene root consume these tokens — remove hardcoded `0xffffff @ 0.45` and `(0, 2, 8)` from builder.

### Testing strategy
- New `tests/headless-scene-parity.test.ts` — per-module mesh assertions when module is in `renderOrder` (GL-gated).
- Extend or mirror `verify-v14-viz-modules.mjs` pattern for Phase 22 evidence JSON.
- Reuse fixtures: `golden-scene-spec.json`, `tls-production-scene-spec.json`, `tls-server-hello-scene-spec.json`.

### Claude's Discretion
- Whether to split factory into `viz-mesh-spec.ts` + `viz-mesh-builders.ts` vs single file
- Exact verify script name (`verify-headless-scene-parity` vs extend `verify-headless-capture`)
- Whether R3F cert/HUD refactor is full or geometry-args-only in 22-01/22-02 split

</decisions>

<canonical_refs>
## Phase 21 handoffs

| Artifact | Path |
|----------|------|
| Headless builder (5/11 modules) | `src/render/headless/build-viz-three-scene.ts` |
| PNG capture | `src/render/headless/capture-viz-frame-png.ts` |
| Compose plan API | `src/client/viz/compose-scene.tsx` |
| Module registry | `src/client/viz/registry.ts` |
| Style tokens | `src/client/viz/style-tokens.ts` |
| R3F catalog tests | `tests/viz-packet-tunnel-modules.test.ts`, `tests/viz-cert-hud-modules.test.ts` |
| Headless capture tests | `tests/headless-capture.test.ts` |

## Deferred from Phase 21

| Module ids | Status |
|------------|--------|
| `viz-cert-single`, `viz-cert-chain` | Not in headless builder |
| `viz-hud-*` (4 ids) | Not in headless builder |

</canonical_refs>

<deferred>
## Deferred Ideas

- TLS production MP4 from 3D PNG sequence as default (Phase 23)
- Pixel golden-file regression for headless frames (stretch)
- `@remotion/three` React composition capture
- Canvas text rendering in headless HUD modules

</deferred>

---
*Phase: 22-scene-builder-parity*
*Context gathered: 2026-05-31*
