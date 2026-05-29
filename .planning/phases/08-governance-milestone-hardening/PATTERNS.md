# Phase 08 Patterns Map

**Mapped:** 2026-05-29

| New artifact | Closest analog | Reuse guidance |
|--------------|----------------|----------------|
| `validate-requirement-traceability.mjs` | `verify-batch-quality.mjs` | Parse planning markdown, emit JSON, exit non-zero on fail |
| `audit-milestone-v1.1.mjs` | `gsd-audit-milestone` workflow | Aggregate phase VERIFICATION + JSON artifacts |
| `verify-milestone-governance.mjs` | `verify-content-authoring.mjs` | Suite runner + dual evidence writer |
| `tests/requirement-traceability.test.ts` | `tests/content-authoring-foundation.test.ts` | CI policy assertions on planning files |
| `tests/milestone-governance.test.ts` | `tests/batch-kpi-acceptance.test.ts` | Gate behavior tests |
| `.planning/milestones/v1.1-MILESTONE-AUDIT.md` | `.planning/MILESTONES.md` | Human-readable close record |

## Integration Points

- Read-only access to `.planning/` during validation (no mutation unless `--write-audit`).
- Phase 08 completion triggers update to `MILESTONES.md`, `STATE.md`, archive `v1.1-ROADMAP.md`.
- Mark VER-02 Complete only after automated gates pass.
