# Phase 14: Storyboard & 3D Motion Skills — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** Phase 13 handoffs + ROADMAP v1.3 Phase 14 scope

<domain>
## Phase Boundary

Codify the next two cinematic crew roles as project Agent Skills:

1. **Technical Storyboard Artist** — beat sheet → spatial shot list → SceneSpec handoff
2. **3D Motion Designer** — R3F visual module catalog (packet, tunnel, cert, HUD) with naming and composition conventions

This phase delivers skills + `docs/r3f-module-catalog.md`. It does **not** implement full R3F React components or publish-ready renders (v1.4+).

</domain>

<decisions>
## Implementation Decisions

### Storyboard Artist (CREW-03)
- Input: Director beat sheet (`.cursor/skills/cinematic-director/templates/beat-sheet.md`) + Art Director style tokens (`docs/style-bible.md`).
- Output: shot-list template and SceneSpec handoff checklist validated against `validateSceneSpec`.
- SceneSpec fields map from beats: `actors`, `packets`, `timeline` (track `"packet"`), `totalFrames`, `capabilities` — no schema extension in Phase 14.
- Reference fixtures: `golden-scene-spec.json` (TLS), `manifest-scene-fixtures.ts` patterns.
- Shot list columns: beat id, framing, module id (from catalog), style tokens, SceneSpec field targets.

### 3D Motion Designer (CREW-04)
- Catalog documents four module families: **packet**, **tunnel**, **cert**, **HUD** — naming convention `viz-<module>-<variant>`.
- Module API describes props, composition rules, and which SceneSpec/timeline tracks each module consumes.
- Links to existing engine: `packet-state.ts`, `scheduler.ts`, `camera/preset-registry.ts` — catalog describes future R3F binding, not new engine code.
- No `.tsx` R3F components in Phase 14; catalog is the contract for v1.4 implementation.

### Skill conventions (both)
- Location: `.cursor/skills/cinematic-storyboard-artist/` and `.cursor/skills/cinematic-3d-motion-designer/`
- Extend `tests/cinematic-crew-skills.test.ts` with CREW-03/04 describe blocks (same pattern as Phase 13).
- Cross-link Phase 13 skills and Phase 14 handoff chain.

### Claude's Discretion
- Whether SceneSpec handoff template is one file or split shot-list + scenespec-checklist
- Exact module variant names within catalog (must include packet/tunnel/cert/HUD)
- Optional `scripts/validate-scenespec-handoff.mjs` — defer unless plan needs CI gate beyond smoke tests

</decisions>

<canonical_refs>
## Canonical References

### Phase 13 handoffs
- `.cursor/skills/cinematic-director/templates/beat-sheet.md`
- `.cursor/skills/cinematic-art-director/SKILL.md`
- `docs/style-bible.md`

### SceneSpec & validation
- `src/engine/contracts/scene-spec.ts`
- `src/engine/contracts/validate-scene-spec.ts`
- `src/fixtures/golden-scene-spec.json`
- `src/fixtures/manifest-scene-fixtures.ts`

### Engine primitives (motion catalog inputs)
- `src/engine/packet/packet-state.ts`
- `src/engine/timeline/scheduler.ts`
- `src/engine/camera/preset-registry.ts`

### Composition
- `src/content/composition/build-long-form-scene-spec.ts`

</canonical_refs>

<deferred>
## Deferred Ideas

- Full R3F React component implementation (v1.4 Production Content)
- SceneSpec schema extension for style blocks or module refs
- Creative Technologist render wiring (Phase 15 / CREW-05)
- TLS walkthrough verification (Phase 16 / VER-06)

</deferred>

---

*Phase: 14-storyboard-3d-motion-skills*
*Context gathered: 2026-05-31*
