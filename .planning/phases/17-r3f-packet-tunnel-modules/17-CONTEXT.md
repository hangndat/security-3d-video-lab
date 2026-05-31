# Phase 17: R3F Packet & Tunnel Modules — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.4 Phase 17 + v1.3 R3F catalog deferral

<domain>
## Phase Boundary

Implement the first R3F visual layer for Security Cinematic Lab:

1. **VIZ-01** — Packet modules (`viz-packet-flow`, `viz-packet-encrypted`, `viz-packet-threat`)
2. **VIZ-02** — Tunnel modules (`viz-tunnel-secure`, `viz-tunnel-handshake`)

This phase delivers engine→viz frame-state bridge, style token constants, R3F components under `src/client/viz/`, and deterministic tests. It does **not** implement cert/HUD modules (Phase 18), publish-ready TLS production (Phase 19), or ElevenLabs TTS (Phase 20).

</domain>

<decisions>
## Implementation Decisions

### Render strategy (Phase 17 scope)
- **Frame-state first:** Build `buildVizFrameState(sceneSpec, frame)` combining `scheduleFrame`, `buildPacketFrameState`, and `interpolateRoutePosition` before full WebGL MP4 capture.
- **Keep hash MVP render path:** `renderCompositionDemoMp4` may remain PPM/hash for CI compatibility in Phase 17; extend `deriveRenderFrameState` to expose viz frame state for tests. Full R3F→ffmpeg capture deferred to Phase 19 unless a minimal offscreen proof is low-risk.
- **No SceneSpec schema bump:** Style tokens stay in render layer per style bible; module selection derives from timeline windows + catalog conventions.

### Module resolution
- Packet variant selection maps active timeline + beat heuristics to one of three `viz-packet-*` ids (catalog composition rules apply).
- Tunnel modules wrap active packet routes during handshake vs finished windows — no new SceneSpec fields.
- Z-order: background → tunnel → packet (cert/HUD slots reserved for Phase 18).

### Style tokens
- `src/client/viz/style-tokens.ts` maps `--color-*` / `--light-*` names from `docs/style-bible.md` to Three.js `Color` and numeric intensities.
- Components import tokens only — no inline hex literals (enforced by test grep/lint).

### Testing strategy
- Pure TS tests for `buildVizFrameState` determinism and module resolver (golden-scene-spec.json).
- Component files are structural; assert registry maps all five Phase 17 catalog ids.
- Do not require WebGL in CI for Phase 17 unless `@react-three/test-renderer` is added with clear headless support.

### Claude's Discretion
- Exact file names under `src/client/viz/packet/` and `tunnel/`
- Whether module resolver lives in `engine/` or `client/viz/`
- Minor catalog doc fix: interpolation lives in `packet-interpolator.ts`, not `packet-state.ts`

</decisions>

<canonical_refs>
## v1.3 handoffs

| Artifact | Path |
|----------|------|
| R3F catalog | `docs/r3f-module-catalog.md` |
| Style bible | `docs/style-bible.md` |
| Motion skill | `.cursor/skills/cinematic-3d-motion-designer/SKILL.md` |
| Golden SceneSpec | `src/fixtures/golden-scene-spec.json` |

## Engine (existing)

| Module | Path |
|--------|------|
| SceneSpec | `src/engine/contracts/scene-spec.ts` |
| Scheduler | `src/engine/timeline/scheduler.ts` |
| Packet state | `src/engine/packet/packet-state.ts` |
| Interpolator | `src/client/packet/packet-interpolator.ts` |
| Render MVP | `src/render/remotion/render-composition.tsx` |

## Phase 17 catalog ids

**Packets:** `viz-packet-flow`, `viz-packet-encrypted`, `viz-packet-threat`  
**Tunnels:** `viz-tunnel-secure`, `viz-tunnel-handshake`

</canonical_refs>

<deferred>
## Deferred Ideas

- R3F→ffmpeg MP4 capture (Phase 19)
- Certificate and HUD modules (Phase 18)
- `@remotion/three` composition (evaluate Phase 19)

</deferred>

---
*Phase: 17-r3f-packet-tunnel-modules*
*Context gathered: 2026-05-31*
