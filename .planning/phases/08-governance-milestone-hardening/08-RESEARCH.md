# Phase 08 Research: Governance and Milestone Hardening

**Date:** 2026-05-29
**Phase:** 08-governance-milestone-hardening

## Problem

v1.0 milestone closed with deferred items:
- `v1.0-MILESTONE-AUDIT.md` missing
- `.planning/REQUIREMENTS.md` absent at close

v1.1 implemented all feature requirements (11/12 complete) but **VER-02** remains: traceability and audit must be automated and blocking before archive.

## Research Findings

### 1. Existing evidence is sufficient for audit aggregation

Phases 05–07 already emit:
- `.artifacts/verification/phase05/content-authoring-foundation.json`
- `.artifacts/verification/phase06/narrative-composition.json`
- `.artifacts/verification/phase07/batch-quality.json`
- Matching `VERIFICATION.md` per phase

Audit script can read JSON gateStatus + phase summaries without re-running full E2E (optional `--refresh` flag for full re-verify).

### 2. Traceability validation rules

Parse REQUIREMENTS.md traceability table:

| Check | Failure condition |
|-------|-------------------|
| Coverage count | `Unmapped: 0` not present or N > 0 |
| Row completeness | Any v1.1 ID missing from table |
| Phase alignment | Table phase ≠ ROADMAP requirement list for phases 05–08 |
| Close readiness | Any status is `Pending` when running `--milestone-close` |
| Checkbox sync | Body checkboxes `[ ]` for items marked Complete in table |

Requirement ID regex: `CONT-\d+`, `AUTHR-\d+`, `CINE-\d+`, `VER-\d+`

### 3. Milestone audit document structure

Follow v1.0 MILESTONES.md + RETROSPECTIVE patterns:

```markdown
# v1.1 Milestone Audit

## Verdict: PASS | FAIL
## Requirements Coverage (12/12)
## Phase Verification Summary (05–08)
## Cross-Phase Integration
## Deferred Debt Resolution
## Evidence Index
```

### 4. CI integration

Add to `pr-full-validation`:
```yaml
- npm run test -- tests/requirement-traceability.test.ts tests/milestone-governance.test.ts
- npm run verify:milestone-governance -- --quick
```

Full close (release/tag) runs without `--quick` and includes phase verify refresh optional.

### 5. Close workflow commands

```bash
npm run verify:milestone-governance          # full gate
node scripts/validate-requirement-traceability.mjs --milestone-close
```

## Recommendation

Two-wave execution:
1. **08-01:** Traceability validator + tests + CI
2. **08-02:** Milestone audit generator + governance verify script + STATE/MILESTONES update + archive roadmap
