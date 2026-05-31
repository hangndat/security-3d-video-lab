# Phase 22 Research: Scene Builder Parity

**Researched:** 2026-05-31
**Phase:** 22-scene-builder-parity
**Requirements:** RENDER-02

## Phase 21 Baseline

| Metric | State |
|--------|-------|
| R3F catalog | 11/11 modules in `VIZ_REGISTRY` |
| Headless builder | 5/11 (packet×3 + tunnel×2) |
| Geometry SOT | Duplicated inline in R3F tsx + headless builder |
| Lighting/camera | Partial token use; hardcoded ambient/key light and camera position |

## Parity Architecture

```
viz-mesh-spec.ts (geometry + token keys per module id)
       ↓                    ↓
R3F components         build-viz-three-scene.ts
  (import args)          (createVizModuleMeshes)
       ↓                    ↓
getComposePlan → renderOrder + props (actors, activeCaption, packets, frame)
```

Headless `addModuleMeshes` must mirror `VizScene` prop wiring from `compose-scene.tsx`:

| Module | Props required |
|--------|----------------|
| `viz-packet-*` | `packet` from `vizFrameState.packets` by `moduleId` |
| `viz-tunnel-*` | none (always visible when in stack) |
| `viz-cert-*` | `sceneSpec.actors` |
| `viz-hud-actor-label` | `sceneSpec.actors` |
| `viz-hud-beat-caption` | `plan.activeCaption` |
| `viz-hud-packet-id` | `vizFrameState.packets.map(p => p.id)` |
| `viz-hud-frame-counter` | `frame` (when in stack via `showFrameCounter`) |

## Module Geometry Reference (from R3F components)

| Module | Geometry |
|--------|----------|
| `viz-packet-flow` | sphere r=0.15 |
| `viz-packet-encrypted` | sphere r=0.15 |
| `viz-packet-threat` | sphere r=0.18 |
| `viz-tunnel-secure` | torus [1.2, 0.12, 16, 48] solid |
| `viz-tunnel-handshake` | torus [1.2, 0.08, 16, 48] wireframe |
| `viz-cert-single` | box [0.8, 1.1, 0.05] + label plane [0.7, 0.15] at y=0.5 |
| `viz-cert-chain` | 3× box [0.65, 0.95, 0.05] + connector boxes |
| `viz-hud-actor-label` | invisible planes per actor at [-1.5, 1.2-i*0.25, 0] |
| `viz-hud-beat-caption` | plane [2.4, 0.35] at [0, -1.2, 0] |
| `viz-hud-packet-id` | invisible planes at [1.4, 0.8-i*0.2, 0] |
| `viz-hud-frame-counter` | invisible plane at [1.6, 1.3, 0] |

## Style Token Gaps

Add to `STYLE_TOKENS` from `docs/style-bible.md`:

| New key | Source |
|---------|--------|
| `lightKeyIntensity` | `--light-key-intensity` (0.35) |
| `lightAmbientColor` | `--light-ambient` base `#0a0e17` |
| `lightAmbientIntensity` | `--light-ambient` alpha (0.15) |
| `cameraPositionDefault` | `[0, 2, 8]` (document in style-bible; not yet a CSS var) |

## Testing Approach

1. **Spec parity tests** (no GL): assert `VIZ_MESH_SPEC` keys === `CATALOG_VIZ_MODULE_IDS`.
2. **Scene mesh tests** (GL-gated): build scene for TLS server-hello frame with cert + HUD active → count meshes ≥ expected minimum per module family.
3. **Hex lint extension**: headless builder files must not contain `#` literals outside `style-tokens.ts`.
4. **Evidence gate**: `scripts/verify-headless-scene-parity.mjs` → `.artifacts/verification/phase22/scene-parity.json`.

## Plan Split Rationale

| Plan | Scope |
|------|-------|
| 22-01 | Factory + packet/tunnel refactor + R3F geometry import |
| 22-02 | Cert/HUD builders + lighting/camera tokens + full catalog tests + verify gate |

Single wave; 22-02 depends on 22-01 factory module existing.

## Risks

| Risk | Mitigation |
|------|------------|
| R3F refactor breaks existing viz tests | Geometry-args-only change; run viz-packet/tunnel tests in 22-01 |
| HUD without text looks empty in PNG | Accept placeholder planes; parity via mesh metadata tests |
| Scope creep to 3D MP4 default | Explicit Phase 23 boundary in plans |

---
*Phase: 22-scene-builder-parity*
