# Phase 16: Production Orchestrator & Skills Verification — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP Phase 16 + Phases 13–15 crew skill deliverables

<domain>
## Phase Boundary

Close v1.3 Cinematic Crew Skills milestone:

1. **Production Orchestrator** — skill that routes all six domain skills in pipeline order with handoff checklists
2. **Skills Verification (VER-06)** — `AGENTS.md` index, TLS module walkthrough proving full chain, milestone close traceability

This phase completes v1.3. It does **not** start v1.4 production content or new topic modules.

</domain>

<decisions>
## Implementation Decisions

### Orchestrator (CREW-07)
- Pipeline order (fixed): Director → Art Director → Storyboard Artist → 3D Motion Designer → Creative Technologist → Security SME + Audio
- Skill path: `.cursor/skills/cinematic-production-orchestrator/`
- Pipeline checklist template links each step to upstream skill + handoff artifact (beat-sheet, style-bible, shot-list, module catalog, render-handoff, audio-layer-handoff)
- Orchestrator does not replace domain skills — it routes and gates handoffs only

### Verification (VER-06)
- `AGENTS.md` at repo root — table of all seven project skills with paths and trigger terms
- `docs/tls-crew-walkthrough.md` — step-by-step TLS module through full chain referencing real repo paths
- `scripts/verify-crew-skills.mjs` — runs crew smoke tests + walkthrough structural checks; writes `.artifacts/verification/phase16/crew-skills.json`
- Extend `tests/cinematic-crew-skills.test.ts` for orchestrator + AGENTS.md + walkthrough
- Milestone close (16-02): `V13_PHASE_EVIDENCE`, `audit-milestone-v1.3.mjs`, archive v1.3 in MILESTONES.md (mirror v1.2 Phase 12-02 pattern)

### Claude's Discretion
- Whether walkthrough is one doc or split per skill section
- CI wiring for verify-crew-skills in pr-full-validation
- Milestone archive timing (16-02 execution vs separate complete-milestone command)

</decisions>

<canonical_refs>
## Six Domain Skills (Phases 13–15)

| Role | Skill path |
|------|------------|
| Director | `.cursor/skills/cinematic-director/` |
| Art Director | `.cursor/skills/cinematic-art-director/` |
| Storyboard Artist | `.cursor/skills/cinematic-storyboard-artist/` |
| 3D Motion Designer | `.cursor/skills/cinematic-3d-motion-designer/` |
| Creative Technologist | `.cursor/skills/cinematic-creative-technologist/` |
| Security SME + Audio | `.cursor/skills/cinematic-security-sme-audio/` |

## TLS walkthrough anchors

- `src/content/topics/tls/contract.json`
- `src/fixtures/golden-scene-spec.json`
- `docs/style-bible.md`, `docs/r3f-module-catalog.md`, `docs/security-accuracy-checklist.md`

## Governance (v1.2 pattern)

- `src/verification/milestone-audit.ts` — `V12_PHASE_EVIDENCE`
- `scripts/audit-milestone-v1.2.mjs`
- `scripts/validate-requirement-traceability.mjs` — milestone-close mode

</canonical_refs>

<deferred>
## Deferred Ideas

- v1.4 Production Content milestone
- Real TTS / publish-ready renders
- Orchestrator automation (SDK agent routing) — skill is documentation-only in v1.3

</deferred>

---

*Phase: 16-production-orchestrator-verification*
*Context gathered: 2026-05-31*
