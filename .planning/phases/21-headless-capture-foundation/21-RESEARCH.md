# Phase 21 Research: Headless Capture Foundation

**Researched:** 2026-05-31
**Phase:** 21-headless-capture-foundation
**Requirements:** RENDER-01

## Current Render Gap

| Layer | v1.4 state | Phase 21 target |
|-------|------------|-----------------|
| R3F components | 11 modules + compose API | Consumed via `getComposePlan` in headless builder |
| Production MP4 | `renderCompositionProductionMp4` branches on backend | `r3f-headless` path calls missing `captureVizFramePng` |
| Headless module | Imports in `render-composition.tsx`; **directory empty** | Restore capture + resolver + minimal scene builder |
| CI | No `SECURITY_LAB_RENDER_BACKEND` in workflow | `trace-hash` on PR; 3D capture local/nightly |
| Dep | `@headless-three/renderer@0.1.7` pinned | Native platform binaries (darwin/linux) |

## Headless Capture Architecture

```
getComposePlan(sceneSpec, frame, { captionMap })
  → buildVizThreeScene(sceneSpec, frame, w, h, captionMap)
       → THREE.Scene + PerspectiveCamera + lights
       → addModuleMeshes from renderOrder (minimal set in Phase 21)
  → renderHeadlessPng(scene, camera, { width, height, background })
  → Buffer (PNG bytes)
```

Integration point in existing production renderer:

```typescript
if (backend === "r3f-headless") {
  renderProductionFramesR3fHeadless(...); // PNG sequence → ffmpeg
} else {
  renderProductionFramesTraceHash(...);   // PPM hash colors → ffmpeg
}
```

## `@headless-three/renderer` Notes

- API: `render(scene, camera, { width, height, background })` → `Buffer`
- Ships platform-specific optional deps (`@headless-three/renderer-darwin-arm64`, etc.)
- Requires Node + native binary match; may fail on unsupported CI runners → trace-hash fallback is mandatory
- Uses raw `THREE.Scene` — does not require React/R3F runtime in capture path

## Backend Resolver

```typescript
export type ProductionRenderBackend = "r3f-headless" | "trace-hash";

export function resolveProductionRenderBackend(env = process.env): ProductionRenderBackend {
  const raw = env.SECURITY_LAB_RENDER_BACKEND?.trim().toLowerCase();
  if (raw === "trace-hash" || raw === "hash") return "trace-hash";
  return "r3f-headless";
}
```

## Minimal Scene Builder (Phase 21)

Phase 21 proves capture — not full cinematic fidelity:

| Module id | Phase 21 mesh |
|-----------|---------------|
| `viz-packet-*` | Sphere at interpolated position, token colors |
| `viz-tunnel-*` | Torus (wireframe for handshake, solid for secure) |
| cert/HUD | **Deferred Phase 22** — skip or no-op when in renderOrder |

Camera: `STYLE_TOKENS.cameraFovIntimate`, position `(0, 2, 8)`, lookAt origin.

## Determinism Strategy

| Backend | Determinism source |
|---------|-------------------|
| `trace-hash` | SHA256 of `vizRenderTraceInput` → PPM RGB |
| `r3f-headless` | Stable mesh params + fixed camera; PNG hash golden on darwin/linux dev |

Tests: two consecutive captures same inputs → equal buffer length and SHA256 hash.

## CI Strategy

| Profile | Backend | When |
|---------|---------|------|
| PR `ubuntu-latest` | `trace-hash` | `SECURITY_LAB_RENDER_BACKEND=trace-hash` in ci.yml |
| Local dev (default) | `r3f-headless` | unset env |
| Nightly / manual | `r3f-headless` | documented in render-handoff |

Phase 21 adds CI env only — full nightly 3D matrix is Phase 24 (RENDER-04).

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| CI fails without GL | trace-hash default in CI workflow |
| Duplicate geometry logic vs R3F | Document Phase 22 unification; minimal builder only in 21 |
| Broken imports block all tests | 21-01 restores files before integration tests |
| PNG flake across GPU | Hash golden per platform; CI skips GL capture |
| Scope creep (full TLS MP4 3D) | Phase 23; 21 proves single/multi frame capture |

## Plan Split

| Plan | Scope |
|------|-------|
| 21-01 | Headless module files, minimal scene builder, capture + resolver, unit tests |
| 21-02 | Production render wiring, verify script, CI env, RENDER-01 gate JSON |

---
*Phase: 21-headless-capture-foundation*
