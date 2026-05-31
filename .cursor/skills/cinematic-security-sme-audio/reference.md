# Security SME + Audio Reference — Canonical Repo Paths

## Accuracy

| Document | Path |
|----------|------|
| Security accuracy checklist | `docs/security-accuracy-checklist.md` |
| TLS contract (reference) | `src/content/topics/tls/contract.json` |
| Topic manifest | `src/content/topics/manifest.json` |

## Narration & Audio

| Artifact | Path |
|----------|------|
| Generate caption map | `src/content/composition/generate-caption-timing-map.ts` |
| Generate narration track | `src/content/narration/generate-narration-track.ts` |
| Validate alignment | `src/content/narration/validate-narration-alignment.ts` |
| Narration schema | `src/content/narration/narration-track.schema.json` |
| Stub provider (CI) | `src/content/narration/providers/deterministic-stub-provider.ts` |
| Provider types | `src/content/narration/providers/types.ts` |

## Upstream Crew

| Skill | Path |
|-------|------|
| Director | `.cursor/skills/cinematic-director/SKILL.md` |
| Creative Technologist | `.cursor/skills/cinematic-creative-technologist/SKILL.md` |
| Render handoff | `.cursor/skills/cinematic-creative-technologist/templates/render-handoff.md` |
| Storyboard | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |

## Export & Verify

| Artifact | Path |
|----------|------|
| Export bundle | `src/render/export/build-long-form-export-bundle.ts` |
| Verify narration | `scripts/verify-narration-pipeline.mjs` (`verify:narration-pipeline`) |

## Templates

| Template | Path |
|----------|------|
| Audio layer handoff | `templates/audio-layer-handoff.md` |

## Deferred (v1.4)

| Feature | Requirement |
|---------|-------------|
| ElevenLabs TTS | PROD-02 |
| Cinematic sound assets | v1.4 Production Content |
