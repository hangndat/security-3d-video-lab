# ROADMAP

## Canonical Phase Order
1. `01-docs-foundation`
2. `02-mvp-engine`
3. `03-first-content-batch`
4. `04-e2e-testing`

## Phase Dependency Graph
- `01-docs-foundation` -> `02-mvp-engine` -> `03-first-content-batch` -> `04-e2e-testing`
- `04-e2e-testing` requires readiness of both `02-mvp-engine` and `03-first-content-batch`.

## Current Status
- `01-docs-foundation`: done (plan `01-01` completed with summary and verification evidence)
- `02-mvp-engine`: done (plans `02-01` through `02-04` completed with verified deterministic render/export pipeline)
- `03-first-content-batch`: done (legacy `PLAN.md` executed end-to-end with phase summary and asset quality gates)
- `04-e2e-testing`: done (legacy `PLAN.md` executed with canonical TLS/SSH/DNS E2E pipeline, deterministic replay checks, and CI command gates)

## Status Rules
- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
