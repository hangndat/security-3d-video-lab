---
name: cinematic-creative-technologist
description: Documents Remotion render pipeline, engine wiring, export profiles, and export bundle linkage for security visualization. Use when rendering SceneSpec to MP4, running export quality gates, or building long-form export bundles.
---

# Cinematic Creative Technologist

Codifies the **Creative Technologist** crew role. Wire validated **SceneSpec** JSON through the deterministic render and export pipeline to MP4 artifacts and long-form export bundles.

## When to Use

- Rendering a validated SceneSpec to short MP4 for CI or module export
- Running export quality assertions (`assertExportQuality`)
- Building long-form export bundles with caption maps and narration tracks
- Debugging determinism (timeline trace, bundleHash, reproducibility manifest)

## Upstream Input

| Input | Path |
|-------|------|
| Validated SceneSpec | Storyboard handoff — `.cursor/skills/cinematic-storyboard-artist/templates/scenespec-handoff.md` |
| Long-form stitch | `src/content/composition/build-long-form-scene-spec.ts` |
| Topic fixtures | `src/fixtures/manifest-scene-fixtures.ts` |

**Prerequisite:** `validateSceneSpec` must pass before render.

## Workflow

1. **Load SceneSpec** — Single topic fixture or stitched long-form scene.
2. **Derive frame state** — `deriveRenderFrameState(sceneSpec, frame)` per frame.
3. **Short MP4 export** — `renderCompositionDemoMp4(sceneSpec, outputPath)`.
4. **Quality gate** — `assertExportQuality` with `DEFAULT_EXPORT_QUALITY_POLICY`.
5. **Long-form bundle (optional)** — `buildLongFormExportBundle` + `writeExportBundleArtifacts`.
6. **Verify** — Run npm verify scripts (see below).
7. **Hand off** — Fill [templates/render-handoff.md](templates/render-handoff.md) for Security SME + Audio review.

## Render Pipeline

### Engine wiring

```
SceneSpec → validateSceneSpec → scheduleFrame (scheduler.ts)
         → deriveRenderFrameState → timelineTraceInput (deterministic)
         → renderCompositionDemoMp4 → ffmpeg → MP4
```

Source: `src/render/remotion/render-composition.tsx`

### Determinism

- **Per-frame trace:** `timelineTraceInput = seed:frame:activeTimelineIds`
- **Color trace (MVP):** SHA-256 hash of trace input drives frame color in demo render
- **Bundle hash:** `buildLongFormExportBundle` produces stable `bundleHash`, `captionMapHash`, `narrationTrackHash`
- **Reproducibility:** `src/render/export/fingerprint.ts` — manifest diff on mismatch

Two runs with identical SceneSpec and trace inputs must produce identical trace strings and bundle hashes.

## Render Profiles

| Profile | Resolution | Frames | FPS | Use |
|---------|------------|--------|-----|-----|
| CI short | 320×180 | 30 | 30 | PR gates, `renderCompositionDemoMp4` default |
| Module export | 320×180 | 30 | 30 | `v12-content-depth-export.test.ts`, expansion E2E |
| Full module | topic `totalFrames` | varies | 30 | Future v1.4 publish-ready renders |

Export quality policy (`src/verification/export-quality.ts`):

- Codec: `h264`
- Container: `mp4`
- Duration: 0.9–1.2 seconds (short CI profile)

Use `assertExportQuality`, `probeExport`, `assertNonZeroFileSize`, `assertExportFileName`.

## Export Bundle Linkage

Long-form assemblies produce linked artifacts via `src/render/export/build-long-form-export-bundle.ts`:

| Field | Description |
|-------|-------------|
| `captionTimingMapPath` | Per-beat caption timing JSON |
| `narrationTrackPath` | Narration segments aligned to captions |
| `bundlePath` | Export bundle envelope JSON |
| `bundleHash` | Stable hash over bundle metadata |
| `captionMapHash` / `narrationTrackHash` | Integrity checks |

Write artifacts with `writeExportBundleArtifacts(bundle, repoRoot)`.

Default export root pattern: `.artifacts/export/<assembly-slug>/` (see phase 12 tests for branch variants).

Caption generation: `src/content/composition/generate-caption-timing-map.ts`  
Narration generation: `src/content/narration/generate-narration-track.ts` (stub provider in CI)

## Verify Commands

| Command | Purpose |
|---------|---------|
| `npm run test -- tests/render-composition.test.ts` | Frame state determinism |
| `npm run test -- tests/v12-content-depth-export.test.ts` | Nine-topic + branch MP4 exports |
| `node scripts/verify-content-depth.mjs --quick` | Phase 12 content depth gate |
| `node scripts/verify-narration-pipeline.mjs --quick` | Caption + narration bundle gate |
| `npm run validate:requirements` | Requirement traceability |

## Coordination

| Downstream | Receives |
|------------|----------|
| Security SME + Audio | Render handoff + export bundle paths for narration alignment |
| Production Orchestrator (Phase 16) | Full pipeline checkpoint |

## Rules

- Never render without prior `validateSceneSpec` pass.
- Use `.artifacts/export/` paths — do not write MP4s to repo root.
- Do not enable disabled capabilities (`postMvpCameraOverrides`, `postMvpPacketPhysics`) without registry update.
- Real Remotion R3F composition is MVP stub (color trace); full cinematic render deferred v1.4.

## Canonical References

[reference.md](reference.md)
