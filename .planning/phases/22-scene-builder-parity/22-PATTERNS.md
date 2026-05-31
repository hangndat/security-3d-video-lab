# Phase 22 Patterns

**Mapped:** 2026-05-31
**Phase:** 22-scene-builder-parity

## Closest Analogs

| New artifact | Closest existing | Pattern to follow |
|--------------|------------------|-------------------|
| `src/client/viz/viz-mesh-spec.ts` | `src/client/viz/style-tokens.ts` | `as const` record keyed by module id |
| Headless mesh builders | `src/render/headless/build-viz-three-scene.ts` L19–131 | `addPacketSphere`, `addTunnelTorus` → extract to factory |
| R3F geometry import | `tests/viz-packet-tunnel-modules.test.ts` L48–56 | Hex lint: components use STYLE_TOKENS only |
| Parity tests | `tests/viz-cert-hud-modules.test.ts` L153–157 | Full catalog key parity assertion |
| Verify gate | `scripts/verify-headless-capture.mjs` | JSON evidence under `.artifacts/verification/phase22/` |

## Module Stack Contract

Source: `src/client/viz/compose-scene.tsx` + `resolve-modules.ts`

```
getComposePlan → { renderOrder, vizFrameState, activeCaption }
renderOrder = moduleStack.zOrder  // tunnel, packet, cert, ...hud
```

Headless builder must iterate `renderOrder` and dispatch to factory by `moduleId` with same props as `VizScene`.

## File Touch Map

| File | 22-01 | 22-02 |
|------|-------|-------|
| `src/client/viz/viz-mesh-spec.ts` | CREATE (packet/tunnel) | EXTEND (cert/hud) |
| `src/client/viz/style-tokens.ts` | — | EXTEND (light/camera) |
| `src/render/headless/build-viz-three-scene.ts` | REFACTOR to factory | FULL 11-module + lighting |
| `src/client/viz/packet/*.tsx` | import geometry from spec | — |
| `src/client/viz/tunnel/*.tsx` | import geometry from spec | — |
| `src/client/viz/cert/*.tsx` | — | import geometry from spec |
| `src/client/viz/hud/*.tsx` | — | import geometry from spec |
| `tests/headless-scene-parity.test.ts` | CREATE (partial) | EXTEND (full catalog) |
| `scripts/verify-headless-scene-parity.mjs` | — | CREATE |

## Anti-Patterns to Avoid

- Duplicating geometry literals in headless builder after factory exists
- Adding `#` hex in builder or factory (use STYLE_TOKENS)
- Text/canvas rendering in headless HUD (use placeholder planes + userData)
- Changing CI backend policy (Phase 24)

---
*Phase: 22-scene-builder-parity*
