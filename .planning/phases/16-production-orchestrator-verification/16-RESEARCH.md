# Phase 16 Research — Orchestrator & Skills Verification

**Researched:** 2026-05-31
**Scope:** Pipeline routing + VER-06 milestone close

## Handoff Chain (complete)

| Step | Skill | Key artifact |
|------|-------|--------------|
| 1 | cinematic-director | `templates/beat-sheet.md` |
| 2 | cinematic-art-director | `docs/style-bible.md` |
| 3 | cinematic-storyboard-artist | `templates/shot-list.md`, `scenespec-handoff.md` |
| 4 | cinematic-3d-motion-designer | `docs/r3f-module-catalog.md` |
| 5 | cinematic-creative-technologist | `templates/render-handoff.md` |
| 6 | cinematic-security-sme-audio | `docs/security-accuracy-checklist.md`, `audio-layer-handoff.md` |
| 7 | cinematic-production-orchestrator | `templates/pipeline-checklist.md` |

## AGENTS.md Pattern

Cursor discovers project skills via `.cursor/skills/` and optional root `AGENTS.md` for human/agent index. Table columns: skill name, path, role, requirements id, when to use.

No `AGENTS.md` exists yet — Phase 16 creates it.

## TLS Walkthrough Content

Walk each step with TLS-specific paths:
- Beat sheet rows from tls contract beats
- Style tokens for hook/mechanism beats
- Shot list → golden-scene-spec mapping
- viz-packet-* / viz-cert-* module ids
- render handoff → golden export
- accuracy checklist TLS table + narration alignment

## Verification Stack

| Layer | Mechanism |
|-------|-----------|
| Structural | `tests/cinematic-crew-skills.test.ts` (CREW-01–07 + VER-06 doc checks) |
| Script gate | `scripts/verify-crew-skills.mjs` |
| Traceability | `validate-requirement-traceability.mjs` milestone-close |
| Milestone audit | `V13_PHASE_EVIDENCE` + `audit-milestone-v1.3.mjs` |

## v1.2 Close Analog

Phase 12-02: governance re-enable, audit script, MILESTONE-AUDIT.md, REQUIREMENTS archive. Phase 16-02 mirrors for v1.3 with crew-skills evidence instead of content-depth only.

## Recommendations

1. **16-01:** Orchestrator skill + pipeline-checklist.md + CREW-07 tests
2. **16-02:** AGENTS.md + tls-crew-walkthrough.md + verify-crew-skills.mjs + milestone close artifacts

---

*Phase: 16-production-orchestrator-verification*
