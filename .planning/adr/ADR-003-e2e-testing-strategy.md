# ADR-003: E2E Testing Strategy

## Metadata
- Status: Accepted
- Date: 2026-05-28
- Owners: Product/Engineering
- Supersedes: None
- Superseded by: None

## Context
The project needs stable, repeatable end-to-end validation across the full video pipeline:
scene template load -> timeline determinism -> render -> export -> artifact checks.

The E2E strategy must support:
- fast PR feedback,
- deeper nightly confidence,
- artifact traceability for debugging.

## Decision

### Test Matrix Levels
- **PR Smoke Matrix (required on pull requests):**
  - TLS canonical flow
  - SSH canonical flow
  - DNS canonical flow
  - Reduced frame budget / faster render profile
- **Nightly Full Matrix (required daily):**
  - TLS, SSH, DNS full-length flow
  - full render/export profile
  - determinism re-run checks

### Determinism Policy
- Each canonical scenario runs at least twice with fixed seed/config.
- Timeline traces must match by strict hash equality.
- Any hash mismatch is a hard failure.

### Artifact Validation Policy
For every E2E run, verify:
- output file exists,
- file size > 0,
- duration in expected window,
- codec/container matches expected profile,
- naming convention includes scenario + run id.

### Flakiness Policy
- No silent retries in PR smoke by default.
- One controlled retry allowed in nightly jobs for infra/transient failures only.
- A test marked flaky requires:
  - issue record,
  - owner assignment,
  - resolution target date.

### Artifact Retention Policy
- PR smoke artifacts: retain 7 days.
- Nightly full artifacts: retain 14 days.
- On failure: preserve logs, trace hashes, and output metadata for forensic review.

## Consequences
### Positive
- Faster feedback for developers via smoke gating.
- Higher confidence from nightly full-matrix checks.
- Better debugging from retained artifacts and determinism traces.

### Negative
- Additional CI runtime and storage overhead.
- Operational discipline needed to manage flaky-test process.

## Revisit Triggers
- PR feedback loop becomes too slow for team velocity.
- Nightly failures are too noisy and mostly non-actionable.
- Artifact storage cost exceeds acceptable budget.
- New scenario classes require expanded matrix design.
