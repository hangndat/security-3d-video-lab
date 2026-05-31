# Phase 14 Patterns

**Mapped:** 2026-05-31

## Closest Analogs

| New artifact | Closest existing pattern |
|--------------|-------------------------|
| `.cursor/skills/cinematic-storyboard-artist/SKILL.md` | `.cursor/skills/cinematic-director/SKILL.md` (Phase 13) |
| `templates/shot-list.md` | `cinematic-director/templates/beat-sheet.md` |
| `docs/r3f-module-catalog.md` | `docs/style-bible.md` (token catalog) |
| Skill smoke tests | `tests/cinematic-crew-skills.test.ts` (Phase 13) |
| SceneSpec validation in skill workflow | `tests/content-contracts.test.ts`, fixture JSON patterns |

## Conventions to Match

- **Skills:** YAML frontmatter, reference.md path catalog, <500 line SKILL.md
- **Templates:** Markdown tables, worked TLS example rows
- **Docs:** H2 sections, named tokens/ids, link to `src/` paths
- **Tests:** Vitest structural assertions; requirement id in describe block name
- **No schema changes:** SceneSpec v1.0.0 unchanged; catalog is forward-looking

## Handoff Chain

```
Director beat-sheet → Storyboard shot-list → SceneSpec JSON → Motion module ids → (Phase 15) Render
         ↑                      ↑
   Art Director tokens    r3f-module-catalog
```

## Anti-patterns

- Inventing SceneSpec fields not in `scene-spec.ts`
- Building R3F `.tsx` in Phase 14 (deferred to v1.4)
- Shot list beat ids that don't match contract `storyboardBeats`
- Duplicating module catalog tables inside SKILL.md (link to `docs/r3f-module-catalog.md`)

---

*Phase: 14-storyboard-3d-motion-skills*
