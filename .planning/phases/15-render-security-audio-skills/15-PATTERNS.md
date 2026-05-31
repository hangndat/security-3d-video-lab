# Phase 15 Patterns

**Mapped:** 2026-05-31

## Closest Analogs

| New artifact | Closest existing pattern |
|--------------|-------------------------|
| `.cursor/skills/cinematic-creative-technologist/SKILL.md` | Phase 13–14 crew skills |
| `templates/render-handoff.md` | `scenespec-handoff.md` (Phase 14) |
| `docs/security-accuracy-checklist.md` | `docs/style-bible.md`, `docs/r3f-module-catalog.md` |
| `templates/audio-layer-handoff.md` | Phase 11 narration pipeline artifacts |
| Smoke tests | `tests/cinematic-crew-skills.test.ts` |

## Conventions to Match

- Project skills under `.cursor/skills/cinematic-*`
- Docs in `docs/` with H2 sections and tables
- Link to verify npm scripts and `.artifacts/` paths
- No real TTS integration — document stub provider + v1.4 deferral

## Handoff Chain (extended)

```
SceneSpec (validated) → Creative Technologist → MP4 + export bundle
                              ↓
Contract beats/objectives → Security SME + Audio → narration + captions + accuracy sign-off
                              ↓
                    (Phase 16) Orchestrator chains all skills
```

## Anti-patterns

- Skipping `validateSceneSpec` before render
- Narration script that contradicts beat objective
- Inventing export paths outside `.artifacts/export/` conventions
- ElevenLabs integration in Phase 15 (out of scope)

---

*Phase: 15-render-security-audio-skills*
