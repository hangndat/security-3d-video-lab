# Phase 18: R3F Certificate & HUD Modules — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.4 Phase 18 + Phase 17 viz foundation

<domain>
## Phase Boundary

Complete the R3F visual catalog with certificate and HUD families:

1. **VIZ-03** — Certificate modules (`viz-cert-single`, `viz-cert-chain`)
2. **VIZ-04** — HUD modules (`viz-hud-actor-label`, `viz-hud-beat-caption`) aligned to caption timing maps

Also implement remaining catalog HUD ids (`viz-hud-packet-id`, `viz-hud-frame-counter`) to satisfy ROADMAP success criterion: full `viz-*` catalog coverage.

This phase extends Phase 17 compose/resolver layers. It does **not** deliver publish-ready TLS production (Phase 19) or TTS (Phase 20).

</domain>

<decisions>
## Implementation Decisions

### Certificate modules (VIZ-03)
- Bind to SceneSpec `actors[]` for trust visuals; `viz-cert-single` for server-hello beats, `viz-cert-chain` when multiple actor roles present (CA/intermediate/leaf pattern).
- Use `preset-registry.ts` intimate FOV defaults when cert module active (read-only; no camera track cues in SceneSpec v1.0.0).
- Add `src/fixtures/tls-server-hello-scene-spec.json` fixture with actors + timeline cue for server-hello beat testing.

### HUD modules (VIZ-04)
- `viz-hud-actor-label` reads `actors[].label` from SceneSpec.
- `viz-hud-beat-caption` reads active caption from `CaptionTimingMap` entry matching current frame (via new `resolveActiveCaption(sceneSpec, frame, captionMap)` helper).
- `viz-hud-packet-id` and `viz-hud-frame-counter` implemented for catalog completeness; frame counter uses scheduler frame index.
- HUD modules stack per catalog rules (may overlay any primary module); extend z-order: tunnel → packet → cert → HUD.

### Catalog alignment
- Add `viz-hud-beat-caption` row to `docs/r3f-module-catalog.md` HUD table (requirements id; was implicit via narration captions).
- Extend `style-tokens.ts` with typography tokens (`--font-hud`, `--color-text-primary`, `--color-text-muted`).

### Testing strategy
- Extend or split tests into `tests/viz-cert-hud-modules.test.ts` (keep Phase 17 tests unchanged).
- Cert tests use tls-server-hello fixture; HUD caption tests use `generateCaptionTimingMap` with TLS topic beats.
- No WebGL mount in CI — frame-state / compose-plan / registry tests only.

### Claude's Discretion
- Whether cert meshes use box/plane vs simplified 3D card geometry
- Exact caption resolver API shape
- Whether to merge all viz tests into one file at end of phase

</decisions>

<canonical_refs>
## Phase 17 foundation

| Artifact | Path |
|----------|------|
| Viz frame state | `src/client/viz/build-viz-frame-state.ts` |
| Module resolver | `src/client/viz/resolve-modules.ts` |
| Compose scene | `src/client/viz/compose-scene.tsx` |
| Registry | `src/client/viz/registry.ts` |
| Style tokens | `src/client/viz/style-tokens.ts` |

## Caption pipeline

| Artifact | Path |
|----------|------|
| Caption map generator | `src/content/composition/generate-caption-timing-map.ts` |
| TLS contract | `src/content/topics/tls/contract.json` |
| Camera presets | `src/engine/camera/preset-registry.ts` |

## Phase 18 catalog ids

**Cert:** `viz-cert-single`, `viz-cert-chain`  
**HUD (requirements):** `viz-hud-actor-label`, `viz-hud-beat-caption`  
**HUD (catalog extras):** `viz-hud-packet-id`, `viz-hud-frame-counter`

</canonical_refs>

<deferred>
## Deferred Ideas

- R3F→MP4 with full HUD text rendering (Phase 19)
- Camera track cues in SceneSpec (post-MVP capability)

</deferred>

---
*Phase: 18-r3f-certificate-hud-modules*
*Context gathered: 2026-05-31*
