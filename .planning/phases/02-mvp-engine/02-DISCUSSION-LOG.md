# Phase 02: mvp-engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 02-mvp-engine
**Areas discussed:** Engine contract shape, Determinism policy, Camera orchestration style, Packet primitive behavior, Render/export reproducibility gate

---

## Engine Contract Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Single `SceneSpec` source of truth | Canonical unified spec for timeline/camera/packet wiring | ✓ |
| Independent module configs + binder | Flexible, but more integration risk | |
| Imperative script-first API | Fast prototyping, weaker deterministic auditability | |

**User's choice:** Single `SceneSpec` source of truth; strict schema and strict gate posture throughout deep-dive questions.  
**Notes:** User repeatedly selected strict deterministic defaults (or accepted Claude discretion when prompted), resulting in hard-fail-first contract governance.

---

## Determinism Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Seed required per `SceneSpec` + frame-canonical timebase | Explicit deterministic inputs and frame-index scheduling | ✓ |
| Global/implicit seeding alternatives | More convenient but weaker traceability | |
| Relaxed or heuristic modes | Higher drift risk and weaker CI reproducibility confidence | |

**User's choice:** Determinism-first policy with required per-scene seed, frame canonical timebase, precision normalization, hard-fail diff bundles, and provenance fingerprints.  
**Notes:** User favored strict and diagnosable reproducibility over convenience and permissive fallback behavior.

---

## Camera Orchestration Style

| Option | Description | Selected |
|--------|-------------|----------|
| Timeline-cued shot presets | Reusable cinematic language with deterministic control | ✓ |
| Fully keyframed camera tracks | Maximum control, heavier authoring overhead | |
| Procedural-only camera behavior | Dynamic but less predictable for MVP | |

**User's choice:** Timeline-cued preset model with bounded overrides, explicit transition cues, packet-actor focus references, central preset library, and hard validation on bound violations.  
**Notes:** Style consistency and deterministic repeatability were prioritized over authoring flexibility.

---

## Packet Primitive Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Path-segment interpolation + explicit events | Deterministic route-based motion and lifecycle state control | ✓ |
| Physics-like or inferred branching models | Dynamic but less deterministic and harder to validate | |
| Minimal/teleport behavior | Simpler but weaker cinematic continuity | |

**User's choice:** Explicit deterministic packet model with route interpolation, bounded template trails, explicit spawn events, and explicit terminal states.  
**Notes:** Chosen model supports security narrative clarity (delivery/drop/timeout semantics) while preserving deterministic gates.

---

## Render/Export Reproducibility Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Manifest + fingerprint pair with pinned environment | Strongest gate confidence and root-cause diagnostics | ✓ |
| Single-hash or manifest-only checks | Simpler but weaker diagnostics/completeness | |
| Manual override-heavy process | Fast unblock, weaker discipline | |

**User's choice:** Dual-artifact reproducibility gate with pinned runtime/toolchain, frame-sample hash + metadata normalization strategy, and mandatory failure bundle + rerun evidence.  
**Notes:** User favored enforceable CI quality gates over flexible manual overrides.

---

## Claude's Discretion

- Cross-module linking policy: ID-based references with upfront validation.
- Pre-render validation policy: hard fail-fast gate.
- Unknown-field policy: strict reject.
- Unsupported schema version policy: hard fail.
- Validation error format: structured `path/code/message/hint`.
- Golden fixture policy: required in CI.

## Deferred Ideas

- Physics-like packet motion model.
- Procedural camera heuristics as default.
- Relaxed schema compatibility mode.
- Manual reproducibility bypass paths.
