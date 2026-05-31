# Phase 08: governance-milestone-hardening - Context

**Gathered:** 2026-05-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Close v1.1 Content Expansion with enforced governance: living requirement traceability, automated milestone audit, and removal of deferred governance debt from v1.0 close.

Out of scope: new content modules, render pipeline changes, new cinematic features, v2 platform work.

</domain>

<decisions>
## Implementation Decisions

### Requirement Traceability (VER-02)
- **D-01:** v1.1 requirements are the canonical set in `.planning/REQUIREMENTS.md` (12 IDs: CONT, AUTHR, CINE, VER).
- **D-02:** Traceability matrix must map every v1.1 requirement ID to exactly one phase (05–08) with status `Complete` or `Pending`.
- **D-03:** Automated validator fails on unmapped IDs, duplicate mappings, phase/requirement drift vs ROADMAP, or any v1.1 requirement still `Pending` at milestone close.
- **D-04:** Traceability check runs in CI on every PR (full validation job) and via standalone script.

### Milestone Audit
- **D-05:** Generate `.planning/milestones/v1.1-MILESTONE-AUDIT.md` from machine evidence (not hand-waved).
- **D-06:** Audit aggregates phase-level `VERIFICATION.md` + JSON artifacts for phases 05–07 with pass/fail gate status.
- **D-07:** Audit includes cross-phase integration summary (authoring → composition → batch quality) and explicit resolution of v1.0 deferred governance items.
- **D-08:** Archive v1.1 roadmap snapshot to `.planning/milestones/v1.1-ROADMAP.md` at close.

### Milestone Close Workflow
- **D-09:** Single orchestrator script `verify-milestone-governance.mjs` produces dual evidence: JSON + markdown.
- **D-10:** `STATE.md` deferred items table must show governance debt resolved (not `deferred`).
- **D-11:** Milestone close blocked unless traceability validator + audit + full test suite pass.
- **D-12:** Backfill note in audit for v1.0 missing artifacts (documented as resolved-by-v1.1, not ignored).

### Claude's Discretion
- Exact audit section headings and scoring rubric wording.
- Whether traceability parser uses regex or structured frontmatter (prefer simple markdown table parse).

</decisions>

<specifics>
## Specific Ideas

- v1.0 close failed because audit/requirements artifacts were missing — phase 08 must make those gates executable, not ceremonial.
- Reuse verify-script patterns from phases 05–07 for consistency.

</specifics>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — v1.1 requirement definitions and traceability table.
- `.planning/ROADMAP.md` — phase 05–08 goals, requirements, success criteria.
- `.planning/STATE.md` — deferred governance debt to clear.
- `.planning/MILESTONES.md` — v1.0 close format precedent.
- `.planning/RETROSPECTIVE.md` — lessons on governance-at-close.
- `.planning/phases/05-content-authoring-foundation/VERIFICATION.md`
- `.planning/phases/06-narrative-cinematic-composition/VERIFICATION.md`
- `.planning/phases/07-batch-quality-verification-expansion/VERIFICATION.md`
- `scripts/verify-content-authoring.mjs`, `verify-narrative-composition.mjs`, `verify-batch-quality.mjs` — evidence patterns.

</canonical_refs>

<deferred>
## Deferred Ideas

- Full v1.0-MILESTONE-AUDIT.md retroactive reconstruction (only document resolution path in v1.1 audit).

</deferred>

---

*Phase: 08-governance-milestone-hardening*
*Context gathered: 2026-05-29*
