# CONTEXT - Phase 04 E2E Testing

## Scope
- End-to-end verification path: scene template load -> timeline determinism -> render -> export -> artifact validation.
- Canonical scenarios required: TLS, SSH, DNS (at least one flow each).
- Test-first planning for executable commands and CI gates, without assuming implementation already exists.

## Assumptions
- Phase 02 provides deterministic timeline and stable render/export interfaces.
- Phase 03 provides canonical content fixtures/story packets for TLS, SSH, DNS.
- Implementation work will start only after implementation workspace is re-enabled.

## Dependencies
- Hard dependency: `02-mvp-engine` readiness.
- Hard dependency: `03-first-content-batch` readiness.
- Runtime dependency: Node toolchain and render/export stack available in implementation workspace.

## Non-Goals
- Building new animation/content features outside canonical TLS/SSH/DNS flows.
- Re-architecting the render engine or timeline scheduler.
- Performance benchmarking beyond pass/fail acceptance thresholds for E2E.
