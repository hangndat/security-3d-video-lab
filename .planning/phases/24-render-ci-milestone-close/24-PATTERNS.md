# Phase 24 Patterns

**Mapped:** 2026-05-31
**Phase:** 24-render-ci-milestone-close

## Closest Analogs

| New artifact | Closest existing | Pattern |
|--------------|------------------|---------|
| verify-3d-render.mjs | verify-headless-capture.mjs | Orchestrate sub-gates + JSON evidence |
| audit-milestone-v1.5.mjs | audit-milestone-v1.4.mjs | milestone-close then buildV15 audit |
| V15_PHASE_EVIDENCE | V14_PHASE_EVIDENCE | Phases 21–24 jsonPath + VERIFICATION.md |
| CI backend env | Phase 21 ci.yml change | SECURITY_LAB_RENDER_BACKEND on PR jobs |

## File Touch Map

| File | 24-01 | 24-02 |
|------|-------|-------|
| scripts/verify-3d-render.mjs | CREATE | — |
| .github/workflows/ci.yml | UPDATE | — |
| docs/tls-crew-walkthrough.md | UPDATE | — |
| package.json | verify:3d-render | — |
| src/verification/milestone-audit.ts | — | V15 evidence + render |
| scripts/audit-milestone-v1.5.mjs | — | CREATE |
| scripts/verify-milestone-governance.mjs | — | UPDATE v1.5 |
| tests/milestone-governance.test.ts | — | UPDATE |
| .planning/MILESTONES.md | — | ARCHIVE |
| .planning/milestones/v1.5-* | — | CREATE |

## Anti-Patterns

- Requiring full 236-frame 3D render on every PR
- Removing trace-hash backend from CI
- Closing milestone before phase 21–23 VERIFICATION.md exist

---
*Phase: 24-render-ci-milestone-close*
