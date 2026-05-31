# Phase 24 Research: Render CI & Milestone Close

**Researched:** 2026-05-31
**Phase:** 24-render-ci-milestone-close
**Requirements:** RENDER-04, VER-08

## Current CI State (post Phase 21–23)

| Job | SECURITY_LAB_RENDER_BACKEND | v1.5 verify gates |
|-----|----------------------------|-------------------|
| pr-full-validation | trace-hash ✓ | headless-capture ✓; missing 3d-render umbrella |
| pr-render-smoke | unset | no backend env |
| nightly-render-matrix | unset | no v1.5 gates |

## Backend Policy Target

| Profile | Backend | Purpose |
|---------|---------|---------|
| PR CI | trace-hash | GL-less ubuntu; deterministic PPM smoke |
| Local dev (default) | r3f-headless | Full PNG 3D TLS export |
| Local override | trace-hash | Fast iteration without GL |
| Nightly (linux) | trace-hash | Regression suite + verify:3d-render --quick |
| Nightly/local 3D | r3f-headless | Documented; optional macos job for GL smoke |

## verify:3d-render Design

```javascript
// scripts/verify-3d-render.mjs
const suites = [
  run("verify:headless-capture", ["--quick"]),
  run("verify:headless-scene-parity", ["--quick"]),
  run("verify:tls-3d-production", ["--quick"])
];
// Output: .artifacts/verification/phase24/3d-render.json
```

Non-GL tests always pass in CI. GL-gated tests skip gracefully inside sub-scripts.

## V15 Milestone Audit

```typescript
export const V15_PHASE_EVIDENCE: PhaseEvidenceConfig[] = [
  { phase: "21", name: "Headless Capture Foundation", jsonPath: ".artifacts/verification/phase21/headless-capture.json", ... },
  { phase: "22", name: "Scene Builder Parity", jsonPath: ".artifacts/verification/phase22/scene-parity.json", ... },
  { phase: "23", name: "TLS 3D Production Export", jsonPath: ".artifacts/verification/phase23/tls-3d-production.json", ... },
  { phase: "24", name: "Render CI & Milestone Close", jsonPath: ".artifacts/verification/phase24/3d-render.json", ... }
];
```

Pre-audit: run all phase 21–24 verify scripts to ensure JSON artifacts exist.

## Governance Close Sequence

1. Mark all v1.5 requirements Complete in REQUIREMENTS.md
2. `validate-requirement-traceability.mjs --milestone-close` → PASS
3. Run verify:3d-render, verify:milestone-governance
4. `audit-milestone-v1.5.mjs` → v1.5-MILESTONE-AUDIT.md
5. Archive requirements + roadmap snapshot

## Documentation Updates

| Doc | Content |
|-----|---------|
| tls-crew-walkthrough | verify:3d-render, backend policy table, local 3D publish command |
| PROJECT.md | v1.5 shipped summary |
| MILESTONES.md | v1.5 entry |

## Risks

| Risk | Mitigation |
|------|------------|
| macos nightly flaky | continue-on-error + docs for local 3D |
| Governance still points v1.4 | Update verify-milestone-governance to v1.5 |
| Phase JSON missing at audit | Pre-flight verify script in audit-milestone-v1.5.mjs |

---
*Phase: 24-render-ci-milestone-close*
