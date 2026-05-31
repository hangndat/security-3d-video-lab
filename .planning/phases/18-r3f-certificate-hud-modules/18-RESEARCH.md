# Phase 18 Research: R3F Certificate & HUD Modules

**Researched:** 2026-05-31
**Phase:** 18-r3f-certificate-hud-modules
**Requirements:** VIZ-03, VIZ-04

## Phase 17 Baseline

| Delivered | Gap for Phase 18 |
|-----------|------------------|
| 5 module ids (packet + tunnel) | 5 remaining catalog ids + beat-caption |
| `resolveVizModuleStack` (tunnel + packet) | Extend for cert + HUD layers |
| `getComposePlan` z-order 2 layers | Extend to 4-layer z-order |
| `style-tokens.ts` colors/lights | Add typography tokens |

## Certificate Architecture

```
resolveCertModuleId(sceneSpec, frame, activeTimelineIds)
  → viz-cert-single when server-hello cue active or single server actor focus
  → viz-cert-chain when ≥2 trust actors (ca, intermediate, leaf labels)

VizCertSingle / VizCertChain components
  → trust color from STYLE_TOKENS.colorAccentTrust
  → optional camera preset hint from preset-registry (fov 35 intimate)
```

**Fixture gap:** `golden-scene-spec.json` has one actor only — need `tls-server-hello-scene-spec.json` with CA/server actors and server-hello timeline cue id.

## HUD Architecture

```
resolveHudModules(vizFrameState, sceneSpec, captionMap?)
  → viz-hud-actor-label (always when actors present)
  → viz-hud-beat-caption (when captionMap entry active at frame)
  → viz-hud-packet-id (mechanism beats / debug — when packet timeline active)
  → viz-hud-frame-counter (optional QA — capability flag or test-only)

resolveActiveCaption(captionMap, frame) → CaptionTimingEntry | null
```

**Caption alignment:** Use `generateCaptionTimingMap` with TLS contract beats; map `beatId` to `scriptIntent` text for HUD overlay props (2D text via `@react-three/drei` Html or billboard — structural component only in Phase 18, text in props).

## Z-Order Extension

Catalog: `background → tunnel → packet → cert → HUD`

Update `resolveVizModuleStack` → `resolveFullModuleStack` returning:
- `primary` (max 2 non-HUD)
- `hud` (stackable)
- `zOrder` (full back-to-front)

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| REQUIREMENTS vs catalog HUD id mismatch | Add beat-caption to catalog; implement all 4 HUD ids |
| Breaking Phase 17 compose tests | Keep packet/tunnel resolver behavior; additive extension |
| Caption map optional in compose | Overload `getComposePlan(sceneSpec, frame, options?)` |
| Hardcoded hex in HUD text materials | Extend STYLE_TOKENS + grep test |

## Plan Split

| Plan | Scope |
|------|-------|
| 18-01 | Cert components, cert resolver, TLS server-hello fixture, VIZ-03 tests |
| 18-02 | HUD components, caption resolver, compose extension, catalog doc, VIZ-04 tests |

---
*Phase: 18-r3f-certificate-hud-modules*
