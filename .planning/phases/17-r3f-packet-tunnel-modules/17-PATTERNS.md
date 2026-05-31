# Phase 17 Patterns

Analogous implementations for R3F packet/tunnel modules.

| Pattern | Closest analog | Use for Phase 17 |
|---------|----------------|------------------|
| Engine frame state | `src/engine/packet/packet-state.ts` | Extend with viz bridge, don't duplicate progress math |
| Route interpolation | `src/client/packet/packet-interpolator.ts` | Position source for packet meshes |
| Deterministic render | `src/render/remotion/render-composition.tsx` | Extend `deriveRenderFrameState` additively |
| Catalog contract | `docs/r3f-module-catalog.md` | Module ids, z-order, composition rules |
| Style tokens | `docs/style-bible.md` | `style-tokens.ts` name→value map |
| Integration tests | `tests/packet-engine.integration.test.ts` | Determinism repeat assertions |
| SceneSpec fixtures | `src/fixtures/golden-scene-spec.json` | Module resolver golden vectors |
| Crew smoke tests | `tests/cinematic-crew-skills.test.ts` | Not extended in Phase 17 (implementation phase) |

## New files (expected)

```
src/client/viz/style-tokens.ts
src/client/viz/registry.ts
src/client/viz/resolve-modules.ts
src/client/viz/build-viz-frame-state.ts
src/client/viz/packet/*.tsx
src/client/viz/tunnel/*.tsx
src/client/viz/compose-scene.tsx
tests/viz-packet-tunnel-modules.test.ts
```

---
*Phase: 17-r3f-packet-tunnel-modules*
