# Phase 23 Research: TLS 3D Production Export

**Researched:** 2026-05-31
**Phase:** 23-tls-3d-production-export
**Requirements:** RENDER-03

## Current Export Gap

| Layer | State after Phase 22 | Phase 23 target |
|-------|----------------------|-----------------|
| Backend default | `r3f-headless` when env unset | Explicit 3D path in artifact generator |
| MP4 source | Works via either backend | Local publish = PNG sequence (`frameSource: png`) |
| Narration | Always generated (v1.4 path) | Skipped in default video-only v1.5 export |
| Manifest | v1.0.0 with required narration fields | v1.1.0 video-only; narration optional |
| Rubric | Requires narration alignment | Module rubric only when videoOnly |
| Verify gate | phase19/tls-production.json | Adds 3D manifest checks |

## Export Flow (target)

```
generateTlsProductionArtifacts(repoRoot, sceneSpec, env)
  → buildTlsProductionCaptionMap (still needed for HUD beats)
  → [skip narration if videoOnly]
  → renderCompositionProductionMp4(..., { captionMap, backend: resolved })
       → r3f-headless: captureVizFramePng × totalFrames → ffmpeg PNG
       → trace-hash: PPM hash colors → ffmpeg (CI only)
  → assertTlsProductionRubric(..., { videoOnly: true })
  → write manifest { schemaVersion: 1.1.0, videoOnly, frameSource, renderBackend }
```

## frameSource Mapping

| renderBackend | frameSource |
|---------------|-------------|
| `r3f-headless` | `"png"` |
| `trace-hash` | `"ppm-trace-hash"` |

## Manifest v1.1.0 Shape

```typescript
export type TlsProductionManifest = {
  schemaVersion: "1.1.0";
  sceneId: string;
  sceneSpecPath: string;
  mp4Path: string;
  captionMapPath: string;
  securitySignoffPath: string;
  productionPolicy: ExportQualityPolicy;
  mp4Bytes: number;
  renderBackend: ProductionRenderBackend;
  frameSource: "png" | "ppm-trace-hash";
  videoOnly: true;
  narrationTrackPath?: string;
  narrationProviderId?: string;
  bundleHash: string;
  generatedAt: string;
};
```

## Rubric Changes

| Check | videoOnly=true | videoOnly=false (legacy) |
|-------|----------------|---------------------------|
| Beat coverage | ✓ | ✓ |
| Module mapping | ✓ | ✓ |
| Narration alignment | skip | ✓ |
| approvedForProduction | beats only | beats + narration |

## Testing Strategy

1. **Unit:** `resolveFrameSource(renderBackend)` mapping.
2. **Integration (no GL):** generate with `SECURITY_LAB_RENDER_BACKEND=trace-hash` → manifest valid, frameSource ppm.
3. **Integration (GL-gated):** default env → `renderBackend: r3f-headless`, `frameSource: png`, quality policy pass.
4. **Verify gate:** `verify-tls-3d-production.mjs --quick` or extended tls-production verify.

## Performance Note

Full TLS render = 236 frames × PNG capture. Acceptable for local publish; CI stays on trace-hash (Phase 24).

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking v1.4 narration tests | Legacy opt-in env for narration-inclusive path |
| GL unavailable locally | Document trace-hash fallback; GL-gated 3D tests skipIf |
| Long test runtime | Use `--quick` verify subset; full 3D render in dedicated describe.skipIf |

---
*Phase: 23-tls-3d-production-export*
