# ADR-001: Tech Stack Baseline

## Metadata
- Status: Accepted
- Date: 2026-05-28
- Owners: Product/Engineering
- Supersedes: None
- Superseded by: None

## Context
The project needs a maintainable stack for cinematic security/infrastructure visualization with:
- deterministic timeline behavior,
- fast content iteration,
- stable render/export quality for short-form and long-form outputs.

## Decision

### Scene Authoring and Runtime
- Use `Three.js + React Three Fiber (+ Drei)` for scene authoring.
- Keep orchestration and timeline logic in deterministic TypeScript modules, separated from UI components.

### Render and Export
- Use `Remotion` for frame-accurate composition.
- Use `FFmpeg` for final encoding and export profiles.

### Narration Strategy
- Production path: `ElevenLabs`.
- Local/dev fallback: self-hosted OSS TTS (`Piper` or `Coqui`).

## Consequences
### Positive
- Faster scene authoring than pure low-level Three.js workflows.
- Reproducible frame-based outputs with clear testing boundaries.
- Hybrid narration path reduces lock-in risk.

### Negative
- React abstraction adds runtime complexity versus pure Three.js.
- Hybrid narration increases operational overhead (two integration paths).
- Cloud narration adds external dependency and usage cost.

## Guardrails
- Timeline scheduler remains source-of-truth for animation state.
- Scene templates must be testable without direct dependency on narration provider.
- Export presets must be versioned and reusable across runs.

## Revisit Triggers
- Authoring layer becomes a measurable performance bottleneck.
- Scene control requirements exceed practical R3F abstractions.
- Narration cost/compliance constraints block cloud usage.
- Export throughput needs exceed local Remotion + FFmpeg workflow.
