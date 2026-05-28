# ADR-002: Timeline Architecture Contract

## Metadata
- Status: Accepted
- Date: 2026-05-28
- Owners: Product/Engineering
- Supersedes: None
- Superseded by: None

## Context
All scene templates (TLS, SSH, DNS, and future topics) need the same deterministic behavior guarantees across authoring, testing, and rendering.

## Decision

### Core Principles
- Frame index is the single source-of-truth for animation state.
- Event scheduling is deterministic for identical inputs.
- Scene templates are declarative data, not imperative runtime scripts.
- Render outputs must be reproducible.

### Event Contract
Required event fields:
- `id`
- `track`
- `startFrame`
- `duration`
- `easing`
- `payload`

Hard rules:
- `id` format: `{topic}-{track}-{action}`
- `startFrame >= 0`
- `duration > 0`
- No duplicate/overlapping semantics for same `id`
- Stable sort before playback by (`startFrame`, `track`, `id`)

### Track Requirements
- Camera track: payload includes `from` and `to`; interpolation is pure and frame-derived.
- Packet track: payload includes `route` with at least 2 points; glow/trail state depends on frame progress only.
- Label/overlay track: payload includes `text`, `position`, `styleToken`; visibility aligns with storyboard beats.

### Storyboard and Narration Alignment
- Every storyboard beat maps to one or more timeline windows.
- Every beat has a narration marker with `startFrame` and `endFrame`.
- Critical protocol milestones must have explicit marker coverage.

### Determinism and Tests
- Same scene definition + same render config => same timeline trace.
- Timeline trace is strict-comparable in tests.
- No implicit wall-clock randomness or device-local mutable state.

Minimum gates:
- Scene contract validation
- Camera determinism
- Packet interpolation/state transition
- Timeline strict equality
- Render/export smoke check

## Consequences
### Positive
- Easier debugging with deterministic traces.
- Safer scene-template reuse across topics.
- Stronger confidence in regression testing.

### Negative
- Authoring requires stricter schema discipline.
- Additional up-front test requirements for each new track.

## Change Control
- Breaking event-schema updates require ADR revision and migration note.
- New track types require payload documentation + unit tests + one integration case.

## Non-Goals
- Cinematic style direction.
- Final audio mastering/subtitle implementation details.
