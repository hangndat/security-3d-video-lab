# Render Handoff

> Input: validated SceneSpec from [Storyboard scenespec-handoff](../../cinematic-storyboard-artist/templates/scenespec-handoff.md). Output: MP4 + optional export bundle for Security SME + Audio review.

## Input SceneSpec (TLS publish)

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Fixture reference | `src/fixtures/tls-production-scene-spec.json` |
| Kịch bản | `src/content/topics/tls/KICH-BAN.md` |
| Validation | `validateSceneSpec` passed |
| sceneId | `tls-production-scene` |
| seed | `tls-production-seed-005` |
| totalFrames | 600 |

## Production MP4 Export

| Field | Value |
|-------|-------|
| Generator | `generateTlsProductionArtifacts()` |
| Function | `renderCompositionProductionMp4` (640×360, full frames) |
| Output path | `.artifacts/production/tls/tls-production.mp4` |
| Backend (local) | `r3f-headless` — PNG frames + caption burn-in |
| Backend (CI) | `SECURITY_LAB_RENDER_BACKEND=trace-hash` |
| Manifest | `.artifacts/production/tls/production-manifest.json` |

```bash
unset SECURITY_LAB_RENDER_BACKEND
unset SECURITY_LAB_INCLUDE_NARRATION
npm run test -- tests/tls-production-export.test.ts --testNamePattern="default env export"
```

## CI Short MP4 (legacy demo)

| Field | Value |
|-------|-------|
| Fixture | `src/fixtures/golden-scene-spec.json` |
| Function | `renderCompositionDemoMp4(sceneSpec, outputPath)` |
| Profile | 320×180, 30 frames — **not** spatial publish story |

## Export Quality Assertions

```typescript
import {
  assertExportQuality,
  productionPolicyForScene
} from "src/verification/export-quality.js";
import { assertTlsProductionRubric } from "src/verification/tls-production-rubric.js";

assertExportQuality(outputPath, productionPolicyForScene(sceneSpec));
assertTlsProductionRubric(sceneSpec, captionMap);
```

| Check | Expected (production) |
|-------|----------------------|
| Codec | h264 |
| Container | mp4 |
| Duration | ~20s (600 frames @ 30 fps) |
| Module rubric | All five TLS beats pass |
| Visual story | `tests/tls-visual-story.test.ts` pass |

## Long-Form Bundle (optional)

For assemblies (e.g. `content-depth-long-v1`):

| Field | Value |
|-------|-------|
| Builder | `buildLongFormExportBundle(assemblySlug, topicScenes, options)` |
| Writer | `writeExportBundleArtifacts(bundle, repoRoot)` |
| captionTimingMapPath | `.artifacts/export/<slug>/caption-timing-map.json` |
| narrationTrackPath | `.artifacts/export/<slug>/narration-track.json` |

## Verify Commands

```bash
npm run test -- tests/tls-production-export.test.ts
npm run test -- tests/tls-visual-story.test.ts
npm run test -- tests/headless-scene-parity.test.ts
npm run verify:tls-3d-production -- --quick
node scripts/verify-narration-pipeline.mjs --quick
```

## Determinism Checklist

- [ ] Same SceneSpec → identical `vizRenderTraceInput` for sample frames
- [ ] `bundleHash` stable on repeat long-form build (if applicable)
- [ ] Export paths under `.artifacts/production/tls/` or `.artifacts/export/`

## Handoff to Security SME + Audio

- [ ] MP4 path documented
- [ ] Debug frame `debug-frame-150-caption.png` available (ClientHello)
- [ ] Caption map: `buildTlsOnlyCaptionMap`
- [ ] Ready for `docs/security-accuracy-checklist.md` spatial review
