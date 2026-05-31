# Render Handoff

> Input: validated SceneSpec from [Storyboard scenespec-handoff](../../cinematic-storyboard-artist/templates/scenespec-handoff.md). Output: MP4 + optional export bundle for Security SME + Audio review.

## Input SceneSpec

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Fixture reference | `src/fixtures/golden-scene-spec.json` |
| Validation | `validateSceneSpec` passed |
| sceneId | `tls-golden-scene` |
| totalFrames | 360 |

## Short MP4 Export

| Field | Value |
|-------|-------|
| Function | `renderCompositionDemoMp4(sceneSpec, outputPath)` |
| Output path | `.artifacts/export/phase15/tls-golden-scene-short.mp4` |
| Profile | CI short — 320×180, 30 frames, 30 fps |
| Pre-check | `deriveRenderFrameState(sceneSpec, 0)` succeeds |

## Export Quality Assertions

Run after MP4 write:

```typescript
import { assertExportQuality, DEFAULT_EXPORT_QUALITY_POLICY } from "src/verification/export-quality.js";

assertExportQuality(outputPath, DEFAULT_EXPORT_QUALITY_POLICY);
```

| Check | Expected |
|-------|----------|
| Codec | h264 |
| Container | mp4 |
| Duration | 900–1200 ms (short profile) |
| File size | > 0 bytes |

## Long-Form Bundle (optional)

For assemblies (e.g. `content-depth-long-v1`):

| Field | Value |
|-------|-------|
| Builder | `buildLongFormExportBundle(assemblySlug, topicScenes, options)` |
| Writer | `writeExportBundleArtifacts(bundle, repoRoot)` |
| captionTimingMapPath | `.artifacts/export/<slug>/caption-timing-map.json` |
| narrationTrackPath | `.artifacts/export/<slug>/narration-track.json` |
| bundlePath | `.artifacts/export/<slug>/export-bundle.json` |
| bundleHash | Record in handoff — must be stable across two identical runs |

Branched assemblies: pass `branchId: "attack-path"` or `"defense-path"`.

## Verify Commands

```bash
npm run test -- tests/render-composition.test.ts
npm run test -- tests/v12-content-depth-export.test.ts
node scripts/verify-content-depth.mjs --quick
node scripts/verify-narration-pipeline.mjs --quick
```

## Determinism Checklist

- [ ] Same SceneSpec → identical `timelineTraceInput` for sample frames
- [ ] Long-form bundle: `bundleHash` stable on repeat build
- [ ] Export paths under `.artifacts/export/`

## Handoff to Security SME + Audio

- [ ] MP4 path documented
- [ ] Export bundle paths (if long-form) documented
- [ ] Caption map + narration track available for `validateNarrationAlignment`
- [ ] Ready for accuracy checklist review
