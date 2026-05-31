# Creative Technologist Reference — Canonical Repo Paths

## Upstream

| Artifact | Path |
|----------|------|
| SceneSpec handoff | `.cursor/skills/cinematic-storyboard-artist/templates/scenespec-handoff.md` |
| Storyboard skill | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |
| TLS KICH-BAN | `src/content/topics/tls/KICH-BAN.md` |
| Long-form stitch | `src/content/composition/build-long-form-scene-spec.ts` |
| Manifest fixtures | `src/fixtures/manifest-scene-fixtures.ts` |

## Render & Export

| Artifact | Path |
|----------|------|
| Render composition | `src/render/remotion/render-composition.tsx` |
| TLS production artifacts | `src/render/export/generate-tls-production-artifacts.ts` |
| Headless PNG capture | `src/render/headless/capture-viz-frame-png.ts` |
| Export bundle builder | `src/render/export/build-long-form-export-bundle.ts` |
| Export quality | `src/verification/export-quality.ts` |
| TLS rubric | `src/verification/tls-production-rubric.ts` |

## Engine

| Artifact | Path |
|----------|------|
| SceneSpec validation | `src/engine/contracts/validate-scene-spec.ts` |
| Timeline scheduler | `src/engine/timeline/scheduler.ts` |
| Viz three scene | `src/render/headless/build-viz-three-scene.ts` |

## Narration (bundle linkage)

| Artifact | Path |
|----------|------|
| Caption timing map | `src/content/composition/generate-caption-timing-map.ts` |
| Narration track | `src/content/narration/generate-narration-track.ts` |
| Stub provider | `src/content/narration/providers/deterministic-stub-provider.ts` |

## Verify Scripts / Tests

| Script / test | Purpose |
|---------------|---------|
| `tests/tls-production-export.test.ts` | Production MP4 + rubric |
| `tests/tls-visual-story.test.ts` | Spatial story regression |
| `tests/headless-scene-parity.test.ts` | Headless GL mesh parity |
| `npm run verify:tls-3d-production` | Quick production gate |
| `scripts/verify-narration-pipeline.mjs` | Caption + narration |

## Downstream

| Skill | Path |
|-------|------|
| Security SME + Audio | `.cursor/skills/cinematic-security-sme-audio/SKILL.md` |
| Render handoff template | `templates/render-handoff.md` |

## Artifact Roots

| Output | Path |
|--------|------|
| TLS production MP4 | `.artifacts/production/tls/tls-production.mp4` |
| TLS manifest | `.artifacts/production/tls/production-manifest.json` |
| Debug caption frame | `.artifacts/production/tls/debug-frame-150-caption.png` |
| Short CI MP4 | `.artifacts/export/phase12/` or test temp dirs |
| Export bundle | `.artifacts/export/<assembly-slug>/export-bundle.json` |
