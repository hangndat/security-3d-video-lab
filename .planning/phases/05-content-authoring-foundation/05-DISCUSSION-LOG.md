# Phase 05: content-authoring-foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md` — this log preserves alternatives considered.

**Date:** 2026-05-28
**Phase:** 05-content-authoring-foundation
**Areas discussed:** data contract format, validation rules, authoring workflow, governance

---

## Data contract format

| Option | Description | Selected |
|--------|-------------|----------|
| TypeScript typed files | Strong type safety, closer to current implementation | |
| JSON + schema validator | Easier authoring, decouples content from render logic | ✓ |
| Hybrid JSON -> typed runtime | Flexible pipeline, higher implementation complexity | |

**User's choice:** JSON + schema validator  
**Notes:** Prefers expansion speed with data-first authoring.

| Option | Description | Selected |
|--------|-------------|----------|
| 1 file/topic | Packet + beats + metadata together | ✓ |
| Split packet/scene files | Higher modularity, more files to manage | |
| Manifest + topic children | Scales large batches, adds assembly complexity | |

**User's choice:** 1 file/topic

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit transition pair | Direct and strict pair definitions | |
| Optional with defaults | Faster authoring but less strict | |
| Preset catalog | Curated transition set with compatibility checks | ✓ |

**User's choice:** preset catalog

| Option | Description | Selected |
|--------|-------------|----------|
| Strict literal schema version | Reject mismatch immediately | ✓ |
| Compatible range | Accept minor drift with warnings | |
| Adapter migration layer | Supports legacy contracts with conversion | |

**User's choice:** strict literal versioning

---

## Validation rules

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-fast block | Stop at first error | |
| Collect-all-errors | Aggregate full error report then fail | ✓ |
| Warn-and-skip | Continue with partial batch | |

**User's choice:** collect-all-errors

| Option | Description | Selected |
|--------|-------------|----------|
| Strict window | Hard fail outside min/target/max | |
| Soft window | Warn for minor drift, fail for major drift | ✓ |
| Target-only | Minimal check | |

**User's choice:** soft window

| Option | Description | Selected |
|--------|-------------|----------|
| Manifest-locked order | No runtime reordering | ✓ |
| Auto-reorder | Reorder by dependency metadata | |
| Manual override | Manifest default with manual exceptions | |

**User's choice:** manifest-locked ordering

---

## Authoring workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Topic folders | `src/content/topics/<topic>/contract.json` | ✓ |
| Batch-centric folders | Organize by batch first | |
| Flat registry | Single-level files + map | |

**User's choice:** topic folders

| Option | Description | Selected |
|--------|-------------|----------|
| Slug + semver | `<topic>-short-v<major>` | ✓ |
| Date-based | `<topic>-YYYYMMDD` | |
| Sequence-based | `<batch>-<index>` | |

**User's choice:** slug + semver

| Option | Description | Selected |
|--------|-------------|----------|
| Scaffold CLI | Generate template + beat stubs | ✓ |
| Manual template | Copy/modify by hand | |
| Editor driven | UI editor (defer) | |

**User's choice:** scaffold CLI

---

## Governance

| Option | Description | Selected |
|--------|-------------|----------|
| All-green blocking | Contract tests + E2E smoke all pass | ✓ |
| Contract-blocking only | E2E smoke warning-only | |
| Docs + smoke | Lighter gate, defer strict testing | |

**User's choice:** all-green blocking

| Option | Description | Selected |
|--------|-------------|----------|
| VERIFICATION.md only | Human-readable evidence | |
| JSON only | Machine-readable evidence | |
| Both | JSON artifacts + VERIFICATION.md | ✓ |

**User's choice:** both

| Option | Description | Selected |
|--------|-------------|----------|
| PR smoke + nightly full | Split gate cadence | |
| PR full every time | Highest confidence at merge time | ✓ |
| Manual only | Human-triggered validation | |

**User's choice:** PR full every time

---

## Claude's Discretion

- Validation library selection and schema module organization.
- Soft-window numeric thresholds and warning semantics.
- Scaffolder CLI option naming and output formatting.

## Deferred Ideas

None.
