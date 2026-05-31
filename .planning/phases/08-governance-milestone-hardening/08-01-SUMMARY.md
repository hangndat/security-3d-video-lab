---
phase: 08-governance-milestone-hardening
plan: 01
subsystem: verification
tags: [traceability, governance, vitest, ci]
requires:
  - phase: 07-batch-quality-verification-expansion
    provides: phase verification JSON artifacts for milestone audit aggregation
provides:
  - Pure requirement traceability validator for v1.1 REQUIREMENTS.md and ROADMAP.md
  - CLI with JSON evidence and milestone-close strict mode
  - CI gate on every PR via validate:requirements
affects: [milestone-close, phase-08-plan-02]
tech-stack:
  added: []
  patterns: [dual-format-verification-json, milestone-close-strict-gate]
key-files:
  created:
    - src/verification/requirement-traceability.ts
    - scripts/validate-requirement-traceability.mjs
    - tests/requirement-traceability.test.ts
  modified:
    - package.json
    - .github/workflows/ci.yml
    - .planning/REQUIREMENTS.md
key-decisions:
  - "Cross-check ROADMAP phase requirement lists against EXPECTED_PHASE_REQUIREMENTS for phases 05–08."
  - "Milestone-close mode fails on any Pending status or checkbox/table drift."
patterns-established:
  - "Traceability validation is pure TypeScript; scripts write .artifacts/verification/phase08/*.json."
requirements-completed: [VER-02]
duration: 15m
completed: 2026-05-29
---

# Phase 08 Plan 01: Requirement Traceability Summary

**Automated traceability now validates all 12 v1.1 requirements against REQUIREMENTS.md and ROADMAP.md, with CI blocking drift and milestone-close enforcing zero Pending rows.**

## Verification

- `npm run validate:requirements` — PASS
- `npm run validate:requirements -- --milestone-close` — PASS
- `.artifacts/verification/phase08/requirement-traceability.json` — gateStatus pass
- `tests/requirement-traceability.test.ts` — 6/6 passed

## Outcomes

1. Every v1.1 requirement maps to exactly one phase with auditable Complete status.
2. Unmapped rows, ROADMAP drift, and checkbox/table mismatch produce deterministic errors.
3. PR CI runs traceability tests and `validate:requirements` before merge.
