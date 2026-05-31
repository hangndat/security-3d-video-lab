# Phase 13: Director & Art Director Skills — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** Milestone v1.3 scoping conversation + `/gsd-new-milestone`

<domain>
## Phase Boundary

Codify the first two cinematic crew roles as **project Agent Skills** under `.cursor/skills/`:

1. **Director** — narrative beats, branch logic, retention pacing
2. **Art Director** — dark sci-fi documentary style bible with codifiable tokens

This phase delivers skills + `docs/style-bible.md`. It does **not** implement R3F modules, publish-ready scenes, or new topic content.

</domain>

<decisions>
## Implementation Decisions

### Director (CREW-01)
- Beat sheets derive from existing `contract.json` `storyboardBeats` — do not invent a parallel beat schema.
- Branch guidance references `content-depth-branched-v1` attack-path / defense-path sequences and transition rationale fields.
- Retention pacing uses KPI checkpoint vocabulary from `src/verification/module-kpi.ts` (p25, p50, p75, completion) as planning targets, not live analytics.
- Director skill outputs a **beat sheet handoff template** (markdown) the Storyboard phase will consume in Phase 14.

### Art Director (CREW-02)
- Visual identity: **dark sci-fi documentary** — deep space blues, amber accent data flows, monospace HUD labels, low-key lighting, slow deliberate camera.
- Style bible lives at `docs/style-bible.md` with named tokens (colors, typography, lighting, camera mood) agents can reference without guessing.
- Art Director skill maps tokens to SceneSpec-adjacent concerns (actor labels, packet colors, background mood) without modifying engine code.

### Skill conventions (both)
- Location: `.cursor/skills/cinematic-director/` and `.cursor/skills/cinematic-art-director/`
- Each skill: `SKILL.md` (<500 lines) + optional `reference.md` linking repo artifacts
- Descriptions in third person with trigger terms per Cursor skill authoring guidelines
- Skills link to canonical repo paths; no duplicated engine logic

### Claude's Discretion
- Exact token hex values and font stack choices within dark sci-fi documentary lane
- Whether beat sheet template is embedded in SKILL.md vs separate `templates/beat-sheet.md`
- Test strategy: lightweight skill smoke test vs docs-only verification

</decisions>

<canonical_refs>
## Canonical References

### Topic & narrative contracts
- `src/content/topics/tls/contract.json` — reference beat structure (5 beats, frame ranges, objectives)
- `src/content/assemblies/content-depth-branched-v1.json` — branch sequences and transition overrides
- `src/content/composition/build-long-form-scene-spec.ts` — branch stitch API

### KPI & pacing
- `src/verification/module-kpi.ts` — retention checkpoint schema (p25/p50/p75/completion)
- `tests/batch-kpi-acceptance.test.ts` — KPI acceptance patterns

### Skill authoring
- Cursor create-skill guidelines — YAML frontmatter, description triggers, progressive disclosure

### Vision
- `docs/brd.md` — cinematic documentary positioning
- `.planning/PROJECT.md` — v1.3 milestone goal

</canonical_refs>

<deferred>
## Deferred Ideas

- Production orchestrator skill (Phase 16 / CREW-07)
- Storyboard → SceneSpec mapping (Phase 14 / CREW-03)
- R3F visual module implementation (Phase 14+ / v1.4)
- Real TTS and publish-ready exports (v1.4)

</deferred>

---

*Phase: 13-director-art-director-skills*
*Context gathered: 2026-05-31*
