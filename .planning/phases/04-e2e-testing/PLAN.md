# Phase 04 - E2E Testing

## Goal
Validate the full production path from scene template load to exported video artifacts with deterministic, repeatable E2E checks.

## Inputs
- `.planning/phases/02-mvp-engine/PLAN.md`
- `.planning/phases/02-mvp-engine/VERIFICATION.md`
- `.planning/phases/03-first-content-batch/PLAN.md`
- `.planning/phases/03-first-content-batch/VERIFICATION.md`
- canonical content specs for TLS, SSH, DNS
- `.planning/adr/ADR-002-timeline-architecture.md`
- `.planning/adr/ADR-003-e2e-testing-strategy.md`

## Architecture Alignment
- Determinism rules and timeline trace expectations MUST follow ADR-002.
- Test matrix levels, flakiness handling, and artifact retention MUST follow ADR-003.
- If execution needs to deviate from ADR-003, update ADR first before changing phase behavior.

## Entry Criteria
- Phase 02 is `done` and timeline/render/export pipeline is verified.
- Phase 03 is `done` and canonical TLS/SSH/DNS content flows are ready.
- Implementation workspace is re-enabled (current workspace remains planning-only).

## Execution Steps
1. Define E2E matrix and fixtures for three canonical flows:
   - TLS flow: template load -> deterministic timeline -> render -> export -> artifact checks.
   - SSH flow: template load -> deterministic timeline -> render -> export -> artifact checks.
   - DNS flow: template load -> deterministic timeline -> render -> export -> artifact checks.
2. Add executable test commands (planned tasks once implementation workspace is active):
   - `npm run test:e2e:tls`
   - `npm run test:e2e:ssh`
   - `npm run test:e2e:dns`
   - `npm run test:e2e:all`
3. Add determinism checks:
   - run each scenario twice with fixed seed and compare timeline snapshot hash outputs.
4. Add render/export checks:
   - produce outputs to `artifacts/e2e/{scenario}/`
   - validate file exists, non-zero size, expected duration window, codec/container, and naming convention.
5. Define CI gates:
   - PR gate: `npm run test:e2e:all -- --smoke`
   - nightly gate: full render/export E2E matrix.

## Quality Gates
- All TLS, SSH, DNS canonical flows pass end-to-end.
- Determinism checks produce stable hash equality on repeated runs.
- Export artifacts meet size/duration/format assertions.
- CI gate commands are documented and runnable in automation.

## Exit Criteria
- E2E suite specification is complete and implementation-ready.
- Commands, expected outputs, and pass/fail criteria are defined per scenario.
- Verification evidence format is established for current and historical runs.

## Blockers
- Dependency readiness: `02-mvp-engine` and `03-first-content-batch` not yet complete.
- Current repo state is planning-only until implementation workspace is re-enabled.
