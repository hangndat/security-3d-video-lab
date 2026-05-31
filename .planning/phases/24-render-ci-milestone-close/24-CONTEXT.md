# Phase 24: Render CI & Milestone Close — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.5 Phase 24 + Phases 21–23 render stack

<domain>
## Phase Boundary

Close **v1.5 Real 3D Render** with CI/nightly render strategy and milestone governance:

1. **RENDER-04** — Document and enforce backend policy: PR CI `trace-hash`, local default `r3f-headless`, nightly path for 3D verification where feasible.
2. **VER-08** — Machine-validate all v1.5 requirements in CI; milestone audit PASS; zero Pending requirements at close.

This phase delivers umbrella `verify:3d-render`, CI/nightly workflow updates, V15 milestone audit, and v1.5 archive — not new render features.

</domain>

<decisions>
## Implementation Decisions

### Umbrella verify gate (RENDER-04)
- **`verify:3d-render`** orchestrates `--quick` runs of:
  - `verify:headless-capture`
  - `verify:headless-scene-parity`
  - `verify:tls-3d-production`
- Evidence JSON: `.artifacts/verification/phase24/3d-render.json`
- Documents local full 3D command in `docs/tls-crew-walkthrough.md` and `AGENTS.md` if present

### CI backend policy
- **pr-full-validation:** keep `SECURITY_LAB_RENDER_BACKEND=trace-hash`; add `verify:3d-render --quick`
- **pr-render-smoke:** add `SECURITY_LAB_RENDER_BACKEND=trace-hash` for consistency
- **nightly-render-matrix:** keep trace-hash for deterministic gates; add `verify:3d-render --quick` step
- **Optional nightly-3d-tls job:** `macos-latest`, unset backend, run GL-gated 3D smoke test only (`continue-on-error: true` if GL flaky) — document in RESEARCH

### Milestone close (VER-08)
- `V15_PHASE_EVIDENCE` phases 21–24 in `milestone-audit.ts`
- `audit-milestone-v1.5.mjs` mirrors v1.4 pattern
- Update `verify-milestone-governance.mjs` → `.artifacts/verification/phase24/milestone-close.json`
- Archive: `MILESTONES.md`, `milestones/v1.5-REQUIREMENTS.md`, `milestones/v1.5-ROADMAP.md`, collapse ROADMAP v1.5 section

### Claude's Discretion
- Whether nightly 3D uses macos job vs docs-only local path
- Exact phase 24 JSON path for audit (3d-render vs milestone-close split)
- Whether to add render backend policy section to README/AGENTS

</decisions>

<canonical_refs>
## Phase 21–23 handoffs

| Gate | Script | Evidence JSON |
|------|--------|---------------|
| RENDER-01 | verify:headless-capture | phase21/headless-capture.json |
| RENDER-02 | verify:headless-scene-parity | phase22/scene-parity.json |
| RENDER-03 | verify:tls-3d-production | phase23/tls-3d-production.json |

## v1.4 close pattern

| Artifact | Path |
|----------|------|
| Milestone audit | `scripts/audit-milestone-v1.4.mjs` |
| V14 evidence | `src/verification/milestone-audit.ts` |
| Governance | `scripts/verify-milestone-governance.mjs` |

</canonical_refs>

<deferred>
## Deferred Ideas

- PROD-03 multi-topic 3D rollout
- PROD-04 TTS mux on 3D exports
- Dedicated GPU CI runners for full 236-frame nightly 3D on linux

</deferred>

---
*Phase: 24-render-ci-milestone-close*
*Context gathered: 2026-05-31*
