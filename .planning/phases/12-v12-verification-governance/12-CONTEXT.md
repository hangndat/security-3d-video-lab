# Phase 12: v1.2 Verification and Governance - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning (inferred from VER-04/VER-05 + deferred Phase 09–11 gaps)

<domain>
## Phase Boundary

Close v1.2 Content Depth with full automated verification for nine-topic content, branched assemblies, narration export bundles, and restored CI governance gates.

**In scope:** v1.2 module export E2E, depth/branched long-form export tests, phase 12 verify script, governance re-enable, v1.2 milestone audit and archive.

**Out of scope:** v3 platform (PLAT-01/02), cloud TTS, new content modules, milestone v1.3 planning.

</domain>

<decisions>
## Implementation Decisions

### VER-04 — Content Depth Verification
- **D-01:** Upgrade v1.2 scene fixtures (`zero-trust-access`, `oauth-jwt-session`, `api-gateway-waf`) from stitch stubs to export-quality specs aligned with contract duration budgets (match auth-session fixture pattern).
- **D-02:** Centralize nine-topic scene map in `src/fixtures/manifest-scene-fixtures.ts` (or test helper) for reuse across export, batch, and branch tests.
- **D-03:** Expand export coverage: all 9 short module exports, `content-depth-long-v1` long-form export, both `content-depth-branched-v1` branches (attack-path, defense-path).
- **D-04:** Each branch variant test asserts contract packet completeness, assembly linkage, stitched export quality, and `buildLongFormExportBundle` metadata linkage (VOIC-02 integration).
- **D-05:** Export artifacts under `.artifacts/export/phase12/` with slug-based naming consistent with Phase 07 gates.
- **D-06:** New `scripts/verify-content-depth.mjs --quick` orchestrates v1.2 export tests and writes `.artifacts/verification/phase12/content-depth.json`.

### VER-05 — Governance Close
- **D-07:** Re-enable CI steps: `validate:requirements`, governance test suites, `verify:milestone-governance --quick` (uncomment in `.github/workflows/ci.yml`).
- **D-08:** Extend `milestone-audit.ts` with `V12_PHASE_EVIDENCE` for phases 09–12 JSON verification artifacts.
- **D-09:** Generate `.planning/milestones/v1.2-MILESTONE-AUDIT.md` from phase evidence + milestone-close traceability pass.
- **D-10:** Archive v1.2: copy ROADMAP to `milestones/v1.2-ROADMAP.md`, update `MILESTONES.md` and `PROJECT.md`, mark milestone shipped in STATE.

### Verification Evidence
- **D-11:** Phase 12 dual evidence: `.artifacts/verification/phase12/content-depth.json` + `.artifacts/verification/phase12/milestone-governance.json`.
- **D-12:** Milestone-close mode requires all 9 v1.2 requirements Complete in REQUIREMENTS.md (execute-time, not plan-time).

### Claude's Discretion
- Whether to extend `expansion-batch-export.test.ts` vs new `v12-content-depth-export.test.ts` file.
- Exact KPI thresholds for nine-topic long-form exports (reuse Phase 07 `assertExportQuality`).

</decisions>

<canonical_refs>
## Canonical References

### Deferred from Phase 09–11
- Phase 09 CONTEXT D-11: scene export deferred to VER-04
- Phase 10 VERIFICATION: full export fixtures deferred to Phase 12
- Phase 11 VERIFICATION: video mux deferred; metadata-only export bundles sufficient for branch coverage

### Verification patterns (Phase 07–08)
- `tests/expansion-batch-export.test.ts` — six-topic export (extend to nine)
- `tests/expansion-module-e2e.test.ts` — module packet + short export
- `src/verification/module-packet.ts` — packet completeness
- `src/verification/milestone-audit.ts` — phase evidence aggregation
- `scripts/verify-milestone-governance.mjs` — governance orchestrator

### v1.2 deliverables under test
- `content-depth-long-v1.json`, `content-depth-branched-v1.json`
- `buildLongFormExportBundle`, `buildLongFormSceneSpec(..., { branchId })`
- All nine topic contracts in manifest

</canonical_refs>

<specifics>
## Specific Ideas

- Branch export tests: attack-path (7 topics) and defense-path (8 topics) each get stitch + export bundle hash stability assertion.
- Governance close mirrors v1.1 Phase 08 playbook adapted for v1.2 phase IDs 09–12.

</specifics>

<deferred>
## Deferred Ideas

- Nightly render matrix for v1.2 nine-topic exports → post-milestone hardening
- ElevenLabs narration in export pipeline → future milestone

</deferred>

---

*Phase: 12-v12-verification-governance*
*Context gathered: 2026-05-31 via plan-phase*
