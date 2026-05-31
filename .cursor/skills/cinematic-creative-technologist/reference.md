# Creative Technologist Reference — Canonical Repo Paths

## Upstream

| Artifact | Path |
|----------|------|
| SceneSpec handoff | `.cursor/skills/cinematic-storyboard-artist/templates/scenespec-handoff.md` |
| Storyboard skill | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |
| Long-form stitch | `src/content/composition/build-long-form-scene-spec.ts` |
| Manifest fixtures | `src/fixtures/manifest-scene-fixtures.ts` |

## Render & Export

| Artifact | Path |
|----------|------|
| Render composition | `src/render/remotion/render-composition.tsx` |
| Export bundle builder | `src/render/export/build-long-form-export-bundle.ts` |
| Fingerprint / manifest | `src/render/export/fingerprint.ts` |
| Export quality | `src/verification/export-quality.ts` |

## Engine

| Artifact | Path |
|----------|------|
| SceneSpec validation | `src/engine/contracts/validate-scene-spec.ts` |
| Timeline scheduler | `src/engine/timeline/scheduler.ts` |

## Narration (bundle linkage)

| Artifact | Path |
|----------|------|
| Caption timing map | `src/content/composition/generate-caption-timing-map.ts` |
| Narration track | `src/content/narration/generate-narration-track.ts` |
| Stub provider | `src/content/narration/providers/deterministic-stub-provider.ts` |

## Verify Scripts

| Script | npm alias |
|--------|-----------|
| `scripts/verify-content-depth.mjs` | `verify:content-depth` |
| `scripts/verify-narration-pipeline.mjs` | `verify:narration-pipeline` |
| `scripts/verify-batch-quality.mjs` | `verify:batch-quality` |

## Downstream

| Skill | Path |
|-------|------|
| Security SME + Audio | `.cursor/skills/cinematic-security-sme-audio/SKILL.md` |
| Render handoff template | `templates/render-handoff.md` |

## Artifact Roots

| Output | Typical path |
|--------|--------------|
| Short MP4 | `.artifacts/export/phase12/` or test temp dirs |
| Export bundle | `.artifacts/export/<assembly-slug>/export-bundle.json` |
| Verification JSON | `.artifacts/verification/phase11/narration-pipeline.json` |
