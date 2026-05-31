# Phase 21 Patterns

Analogous implementations for headless Three.js capture.

| Pattern | Closest analog | Use for Phase 21 |
|---------|----------------|------------------|
| Production MP4 render | `src/render/remotion/render-composition.tsx` | Extend existing `renderCompositionProductionMp4` backend branch |
| Compose plan | `src/client/viz/compose-scene.tsx` | `getComposePlan` drives headless mesh selection |
| Style tokens | `src/client/viz/style-tokens.ts` | Colors, FOV, lighting in Three.js builder |
| Verify gate script | `scripts/verify-tls-production.mjs` | Template for `verify:headless-capture` |
| Phase 19 viz trace | `buildVizRenderTraceInput` | Parallel path: trace-hash vs PNG capture |
| Export quality | `src/verification/export-quality.ts` | Unchanged in Phase 21 |
| Determinism tests | `tests/viz-packet-tunnel-modules.test.ts` | Repeat-call hash assertions |

## New files (expected)

```
src/render/headless/capture-viz-frame-png.ts
src/render/headless/resolve-production-render-backend.ts
src/render/headless/build-viz-three-scene.ts
scripts/verify-headless-capture.mjs
tests/headless-capture.test.ts
.artifacts/verification/phase21/headless-capture.json
```

## Env conventions

| Variable | Values | Default |
|----------|--------|---------|
| `SECURITY_LAB_RENDER_BACKEND` | `r3f-headless`, `trace-hash`, `hash` | `r3f-headless` |

---
*Phase: 21-headless-capture-foundation*
