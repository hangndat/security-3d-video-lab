# Phase 13 Research — Director & Art Director Skills

**Researched:** 2026-05-31
**Scope:** Cursor project skill format + repo narrative/visual contracts

## Cursor Skill Authoring

| Topic | Finding |
|-------|---------|
| Location | Project skills: `.cursor/skills/<skill-name>/SKILL.md` (not `~/.cursor/skills-cursor/`) |
| Frontmatter | `name` (lowercase-hyphen), `description` (third person + trigger terms) |
| Size | Keep SKILL.md under ~500 lines; use `reference.md` for repo path catalogs |
| Optional | `templates/`, `examples.md`, validation scripts |
| Invocation | Agent auto-discovers via description; avoid overly broad triggers |

## Repo Narrative Contracts (Director inputs)

| Artifact | Role |
|----------|------|
| `src/content/topics/*/contract.json` | `storyboardBeats[]` with id, frame ranges, objectives; `narrationPlaceholders` timing |
| `src/content/assemblies/content-depth-long-v1.json` | Linear long-form sequence |
| `src/content/assemblies/content-depth-branched-v1.json` | attack-path / defense-path branches + `transitionOverrides.rationale` |
| `src/content/composition/build-long-form-scene-spec.ts` | Branch stitch into SceneSpec |
| `src/verification/module-kpi.ts` | p25/p50/p75/completion retention vocabulary |

## Repo Visual Contracts (Art Director inputs)

| Artifact | Role |
|----------|------|
| `src/engine/contracts/scene-spec.ts` | Actor labels, packet colors, timeline — style tokens map here in Phase 14 |
| `src/fixtures/*-scene-spec.json` | Existing color/label patterns in fixtures |
| `docs/brd.md` | Cinematic documentary positioning |

## Gap Analysis

- **No `.cursor/skills/` directory yet** — Phase 13 creates first project skills.
- **No `docs/style-bible.md`** — Art Director plan delivers this.
- **No beat sheet template** — Director plan delivers handoff template for Phase 14 storyboard skill.

## Verification Approach

Lightweight test file asserting:
1. Both skill directories exist with valid YAML frontmatter (`name`, `description`).
2. `docs/style-bible.md` contains required token sections (color, typography, lighting, camera).
3. Director skill references canonical contract/assembly paths (grep-based smoke test).

Avoid testing LLM behavior; test artifact presence and structure only.

## Recommendations for Planner

1. **13-01:** Director skill + `templates/beat-sheet.md` + `tests/cinematic-crew-skills.test.ts` (partial — director half).
2. **13-02:** Art Director skill + `docs/style-bible.md` + extend same test file for style bible sections.
3. Single wave; 13-02 depends on 13-01 only for shared test harness path, not content.

---

*Phase: 13-director-art-director-skills*
