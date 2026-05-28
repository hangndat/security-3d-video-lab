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
- `01-docs-foundation`: in_progress
- `02-mvp-engine`: blocked (waiting for phase 01 done and implementation workspace active)
- `03-first-content-batch`: blocked (waiting for phase 02 done)
- `04-e2e-testing`: planned (queued behind phase 02 and 03 readiness; planning-only until implementation workspace is active)

## Status Rules
- `planned`: phase defined but not started.
- `in_progress`: actively being executed.
- `blocked`: cannot proceed due to dependency or missing prerequisite.
- `done`: exit criteria and verification completed.
