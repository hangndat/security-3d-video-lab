# Phase 12 Research: v1.2 Verification and Governance

**Date:** 2026-05-31
**Phase:** 12-v12-verification-governance

## Summary

Phases 09–11 delivered v1.2 content, branches, and narration metadata. Phase 12 closes the milestone by filling export E2E gaps and restoring governance gates disabled during v1.2 development.

## Gap Analysis

| Gap | Source | Phase 12 fix |
|-----|--------|--------------|
| 3 v1.2 topics have stub-only scene fixtures | Phase 10/11 | Upgrade to export-quality fixtures (D-01) |
| `expansion-batch-export` covers 6/9 topics | Phase 07 test | Extend to 9 topics + depth assemblies (D-03) |
| No MP4 export for branched assemblies | Phase 10 | Branch stitch + export quality tests (D-04) |
| CI governance commented out | Between-milestones fix | Re-enable traceability + audit (D-07) |
| `milestone-audit.ts` only lists v1.1 phases | Phase 08 | Add V12_PHASE_EVIDENCE (D-08) |
| No phase 09–11 verify JSON in audit | Missing scripts | Ensure verify scripts write JSON or add phase12 aggregator |

## Phase Evidence Paths (proposed)

| Phase | JSON artifact |
|-------|---------------|
| 09 | `.artifacts/verification/phase09/advanced-security-topics.json` (new verify script or extend content-authoring) |
| 10 | `.artifacts/verification/phase10/narrative-branch-variants.json` (extend narrative-composition or new) |
| 11 | `.artifacts/verification/phase11/narration-pipeline.json` (exists) |
| 12 | `.artifacts/verification/phase12/content-depth.json` + `milestone-governance.json` |

**Pragmatic approach:** Phase 12 plan adds lightweight verify scripts for phases 09–10 if missing, OR milestone audit reads existing test-suite evidence generated during phase 12 close verification run. Prefer extending existing verify scripts in 12-02 wave to avoid retroactive phase edits.

## Export Test Architecture

```
manifest-scene-fixtures (9 topics)
  → short export per topic (assertExportQuality)
  → content-depth-long-v1 stitch export
  → content-depth-branched-v1:attack-path export
  → content-depth-branched-v1:defense-path export
  → buildLongFormExportBundle per assembly (metadata, no MP4 required for bundle-only path)
```

## Governance Close Flow

1. All REQUIREMENTS.md checkboxes Complete (9/9)
2. `validate-requirement-traceability.mjs` passes PR mode
3. `validate-requirement-traceability.mjs --milestone-close` passes (zero Pending)
4. `verify-milestone-governance.mjs` aggregates phase 09–12 evidence → PASS
5. Archive v1.2 milestone artifacts

## Risks

| Risk | Mitigation |
|------|------------|
| Render time for 9+3 exports in CI | Use reduced RENDER_PROFILE; quick verify runs export tests in vitest with existing demo renderer |
| Milestone-close fails mid-execute | Mark VER-04 Complete only after tests pass; VER-05 last |
| Missing phase 09/10 JSON evidence | 12-02 adds verify script wrappers or documents evidence from phase 12 unified gate |
