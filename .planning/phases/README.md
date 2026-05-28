# Phase Index

## Active Phases
1. `01-docs-foundation`
2. `02-mvp-engine`
3. `03-first-content-batch`
4. `04-e2e-testing`

## Dependency Chain
`01-docs-foundation` -> `02-mvp-engine` -> `03-first-content-batch` -> `04-e2e-testing`

`04-e2e-testing` depends explicitly on readiness of:
- `02-mvp-engine`
- `03-first-content-batch`

## Folder Contract
Each phase folder must include:
- `PLAN.md`
- `CONTEXT.md`
- `VERIFICATION.md`
- `STATUS.md`
