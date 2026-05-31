# Phase 18 Patterns

Extends Phase 17 viz patterns for certificate and HUD modules.

| Pattern | Closest analog | Use for Phase 18 |
|---------|----------------|------------------|
| Module registry | `src/client/viz/registry.ts` | Add cert + HUD ids to VIZ_REGISTRY |
| Module resolver | `src/client/viz/resolve-modules.ts` | Extend stack for cert/HUD z-order |
| Compose plan | `src/client/viz/compose-scene.tsx` | Render cert + HUD layers |
| Style tokens | `src/client/viz/style-tokens.ts` | Typography + text colors |
| Camera presets | `src/engine/camera/preset-registry.ts` | Cert intimate FOV reference |
| Caption maps | `src/content/composition/generate-caption-timing-map.ts` | Beat caption HUD input |
| SceneSpec fixtures | `src/fixtures/golden-scene-spec.json` | Pattern for tls-server-hello fixture |
| Viz tests | `tests/viz-packet-tunnel-modules.test.ts` | New `viz-cert-hud-modules.test.ts` |

## New files (expected)

```
src/client/viz/cert/viz-cert-single.tsx
src/client/viz/cert/viz-cert-chain.tsx
src/client/viz/hud/viz-hud-actor-label.tsx
src/client/viz/hud/viz-hud-beat-caption.tsx
src/client/viz/hud/viz-hud-packet-id.tsx
src/client/viz/hud/viz-hud-frame-counter.tsx
src/client/viz/resolve-hud-caption.ts
src/fixtures/tls-server-hello-scene-spec.json
tests/viz-cert-hud-modules.test.ts
```

---
*Phase: 18-r3f-certificate-hud-modules*
