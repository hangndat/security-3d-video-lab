# Phase 13 Patterns

**Mapped:** 2026-05-31

## Closest Analogs

| New artifact | Closest existing pattern |
|--------------|-------------------------|
| `.cursor/skills/cinematic-director/SKILL.md` | `~/.cursor/skills-cursor/create-skill/SKILL.md` (structure only) |
| `docs/style-bible.md` | `docs/brd.md`, `docs/roadmap.md` (project docs) |
| Beat sheet template | Topic `contract.json` `storyboardBeats` fields |
| Skill smoke test | `tests/requirement-traceability.test.ts` (structural assertions) |

## Conventions to Match

- **Docs:** Markdown in `docs/` with clear H2 sections; link to `src/` paths.
- **Tests:** Vitest describe blocks; file-existence + content pattern checks, no render.
- **Requirements:** Map CREW-01/02 to test descriptions referencing requirement IDs.
- **No engine changes:** Skills are agent instructions + docs; do not modify SceneSpec schema in Phase 13.

## Anti-patterns

- Duplicating beat schema outside `contract.json`.
- Embedding hex colors only in SKILL.md without `style-bible.md` single source.
- Personal skills in `~/.cursor/skills/` — use project `.cursor/skills/` for crew.

---

*Phase: 13-director-art-director-skills*
