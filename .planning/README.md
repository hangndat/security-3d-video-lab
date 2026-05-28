# GSD Planning Artifacts

This directory stores GSD-style planning artifacts for the project.

## Folder Layout
- `.planning/PROJECT.md` - project mission, scope, constraints.
- `.planning/ROADMAP.md` - canonical phase ordering and status.
- `.planning/adr/` - architecture decision records (ADR).
- `.planning/phases/` - phase-by-phase planning and execution tracking.
- `.planning/templates/` - reusable templates for ADR and phase documents.

## Architecture Decisions
- `.planning/adr/ADR-001-tech-stack.md`
- `.planning/adr/ADR-002-timeline-architecture.md`
- `.planning/adr/ADR-003-e2e-testing-strategy.md`
- `.planning/adr/ADR-INDEX.md`

## Phase Plans
- `.planning/phases/01-docs-foundation/PLAN.md`
- `.planning/phases/02-mvp-engine/PLAN.md`
- `.planning/phases/03-first-content-batch/PLAN.md`

## Per-Phase Standard Files
Each phase folder should contain:
- `PLAN.md` (execution plan)
- `CONTEXT.md` (scope, assumptions, dependencies)
- `VERIFICATION.md` (quality gates and evidence)
- `STATUS.md` (current state and next step)

## Naming Conventions
- ADR files: `ADR-XXX-kebab-case-title.md`
- Phase folders: `NN-short-phase-name`
- Phase docs: uppercase fixed names (`PLAN.md`, `CONTEXT.md`, `VERIFICATION.md`, `STATUS.md`)

## Governance Rules
- `.planning/ROADMAP.md` is the source of truth for phase status.
- A phase can be `in_progress` only when all dependencies are `done`.
- `VERIFICATION.md` must separate `Current Evidence` and `Historical Evidence`.
