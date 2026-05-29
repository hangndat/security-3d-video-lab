# Retrospective

## Milestone: v1.0 — Milestone

**Shipped:** 2026-05-28  
**Phases:** 4 | **Plans:** 6

### What Was Built
- Deterministic engine contracts and reproducibility gates for scene/timeline/export path.
- First TLS/SSH/DNS content batch with long-form assembly and measurable KPI checks.
- Canonical TLS/SSH/DNS E2E matrix with deterministic replay assertions and CI smoke entrypoint.

### What Worked
- Plan -> execute -> verify loop quickly surfaced and closed concrete gaps.
- Gap-closure planning with focused must-haves reduced rework in phase 03.
- Per-scenario E2E command surface made validation and troubleshooting predictable.

### What Was Inefficient
- Milestone close lacked required audit/requirements artifacts, forcing deferred governance.
- Mixed legacy and numbered plan formats created extra orchestration overhead.

### Patterns Established
- Use explicit regression tests mapped to verification truths for each gap closure.
- Keep deterministic checks close to export behavior so breakage is detected early.

### Key Lessons
- Verification quality depends on living requirements/audit artifacts, not only passing tests.
- Closing gaps immediately after verifier findings keeps scope small and confidence high.

### Cost Observations
- Model mix: mostly sonnet/opus for planning and verification subagents.
- Sessions: single milestone completion session after phased execution.
- Notable: tooling edge cases in `gsd-tools` require fallback handling discipline.

## Milestone: v1.1 — Content Expansion

**Shipped:** 2026-05-29  
**Phases:** 4 (05–08) | **Plans:** 6

### What Was Built
- JSON-first topic contracts with scaffold CLI and six-topic manifest (auth-session, pki-trust-chain, mitm-defense added).
- Long-form assembly profiles, caption timing maps, and deterministic replay gates for multi-module narratives.
- Expansion module E2E, export quality gates, and per-module KPI acceptance across the full batch.
- Automated requirement traceability, v1.1 milestone audit, and CI governance orchestrator.

### What Worked
- Data-first contracts let new modules ship without core renderer edits.
- Dual-format verification JSON + markdown kept phase gates auditable across CI and milestone close.
- Phase 08 closed v1.0 governance debt with machine-validated traceability instead of manual checklists.

### What Was Inefficient
- Phases 06–07 executed without formal PLAN.md files, increasing orchestration overhead.
- `gsd-tools audit-open` and `milestone complete` had partial failures requiring manual archive steps.

### Patterns Established
- Assembly JSON profiles under `src/content/assemblies/` drive long-form stitch and caption maps.
- Shared verification modules (`export-quality.ts`, `requirement-traceability.ts`, `milestone-audit.ts`) centralize gate logic.
- `--quick` verify scripts honestly mark E2E as SKIP rather than fake PASS.

### Key Lessons
- Governance automation pays off at milestone close — traceability + audit artifacts prevent deferred debt.
- Composition layer delegation from `first-content-batch.ts` preserves backward compatibility while scaling content.

### Cost Observations
- Model mix: planning and execution across multiple sessions (phases 05–08).
- Notable: milestone close required manual ROADMAP collapse when gsd-tools output was incomplete.

## Cross-Milestone Trends

| Trend | v1.0 | v1.1 |
| --- | --- | --- |
| Verification gates | Per-phase JSON + tests | + governance traceability + milestone audit |
| Content model | Hardcoded batch | JSON contracts + 6-topic manifest |
| Long-form output | TLS→SSH→DNS stitch | Configurable assembly profiles + captions |
| Governance debt | 2 deferred items at close | Zero deferred at close |
