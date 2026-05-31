# Phase 17 Research: R3F Packet & Tunnel Modules

**Researched:** 2026-05-31
**Phase:** 17-r3f-packet-tunnel-modules
**Requirements:** VIZ-01, VIZ-02

## Current State

| Area | Finding |
|------|---------|
| R3F code | **None** — deps pinned (`@react-three/fiber@9.6.1`, `three@0.184.0`) but unused |
| Render | `deriveRenderFrameState` → scheduler only; MP4 = SHA256 color hash via PPM/ffmpeg |
| Packet engine | `packet-state.ts` + `packet-interpolator.ts` exist; **not wired to render** |
| Style tokens | Documented in `docs/style-bible.md`; **no TS constants** |
| Catalog | Five Phase 17 ids defined; target path `src/client/viz/` |

## Recommended Architecture

```
buildVizFrameState(sceneSpec, frame)
  → scheduleFrame (active timeline ids)
  → buildPacketFrameState (progress, visual flags)
  → interpolateRoutePosition per packet
  → resolveActiveModules (catalog id stack)

src/client/viz/
  style-tokens.ts
  registry.ts
  resolve-modules.ts
  packet/  (3 components)
  tunnel/  (2 components)
  compose-scene.tsx
```

## Key Integration Points

1. **Module resolver** — pure function: given `ScheduledFrameState` + `PacketFrameState` + optional beat metadata → ordered `viz-*` ids per composition rules (max 2 primary, z-order).
2. **Tunnel binding** — no SceneSpec field; activate `viz-tunnel-handshake` during kex/hello cue windows, `viz-tunnel-secure` during finished/app-data windows (TLS golden fixture as reference).
3. **Determinism** — SceneSpec `seed` drives any procedural variation via `seedrandom`; same inputs → same frame-state JSON snapshot.

## Render Path Options

| Option | Pros | Cons | Phase 17 |
|--------|------|------|----------|
| A. Frame-state tests only | CI-safe, fast, no GL | No pixel proof | **Recommended default** |
| B. Headless GL snapshot | Pixel hash possible | Flaky in CI, new deps | Optional stretch |
| C. Replace hash MP4 with R3F | End-to-end visual | High complexity, Phase 19 scope | Defer |

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Catalog says interpolation in `packet-state.ts` | Use `packet-interpolator.ts`; fix catalog note in 17-01 |
| Hardcoded hex in R3F materials | `style-tokens.ts` + grep test |
| `viz-packet-threat` + `viz-packet-encrypted` same window | Resolver rejects or prioritizes per catalog rule |
| Breaking existing render tests | Extend `deriveRenderFrameState` additively; keep `timelineTraceInput` stable |

## Stack Notes

- React Three Fiber 9.x + Three 0.184 — use `Canvas` only when needed; Phase 17 can export components accepting props without mounting Canvas in tests.
- Remotion 4.x present but no React composition — do not introduce `@remotion/three` until Phase 19 planning confirms.

## Plan Split Recommendation

| Plan | Scope |
|------|-------|
| 17-01 | Frame-state bridge, style tokens, packet modules, registry (VIZ-01) |
| 17-02 | Tunnel modules, compose-scene, module resolver tests, catalog doc fix (VIZ-02) |

---
*Phase: 17-r3f-packet-tunnel-modules*
