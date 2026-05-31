# Phase 15 Research — Render & Security Audio Skills

**Researched:** 2026-05-31
**Scope:** Render/export pipeline + narration alignment for crew skills

## Render Pipeline

| Step | Module | Notes |
|------|--------|-------|
| Validate SceneSpec | `validate-scene-spec.ts` | Pre-render gate (Storyboard handoff) |
| Schedule frame | `scheduler.ts` | Active timeline cues per frame |
| Derive render state | `render-composition.tsx` → `deriveRenderFrameState` | Deterministic trace input |
| Demo encode | `renderCompositionDemoMp4` | 320×180, 30fps, 30 frames, ffmpeg |
| Export quality | `export-quality.ts` | h264, mp4, duration 0.9–1.2s (short CI profile) |
| Long-form bundle | `build-long-form-export-bundle.ts` | Caption map + narration track + bundleHash |
| Determinism | `fingerprint.ts` | Manifest diff on reproducibility mismatch |

## Verify Scripts (CI)

| Script | npm alias | Phase |
|--------|-----------|-------|
| `verify-content-depth.mjs` | `verify:content-depth` | 12 |
| `verify-narration-pipeline.mjs` | `verify:narration-pipeline` | 11 |
| `verify-batch-quality.mjs` | `verify:batch-quality` | 07 |

Creative Technologist skill should document which verify gates apply after render/export.

## Narration Pipeline

| Artifact | Generator | Validation |
|----------|-----------|------------|
| Caption timing map | `generate-caption-timing-map.ts` | Schema + beat spans |
| Narration track | `generate-narration-track.ts` | `narration-track.schema.json` |
| Alignment | `validate-narration-alignment.ts` | 50ms tolerance, beatId/analyticKey match |
| Provider (CI) | `deterministic-stub-provider.ts` | Deterministic audio bytes |

Contract fields: `narrationPlaceholders[]` with `beatId`, `analyticKey`, `scriptIntent`, `timing`.

## Security SME Inputs

- Beat `objective` from `storyboardBeats` — factual claim to verify
- `scriptIntent` from narration placeholders — spoken claim must match objective
- Topic-specific accuracy (TLS: encryption, cert validation; no invented cipher names beyond contract)

## Recommendations for Planner

1. **15-01:** Creative Technologist skill + `templates/render-handoff.md` + CREW-05 tests
2. **15-02:** Security SME + Audio skill + `docs/security-accuracy-checklist.md` + `templates/audio-layer-handoff.md` + CREW-06 tests
3. Single wave; 15-02 depends on 15-01 for shared test file; SME reviews narration after render path documented

---

*Phase: 15-render-security-audio-skills*
