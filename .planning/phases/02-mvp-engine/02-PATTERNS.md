# Phase 02: mvp-engine - Pattern Map

**Mapped:** 2026-05-28  
**Files analyzed:** 16  
**Analogs found:** 10 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `package.json` | config | batch | `.planning/config.json` | partial |
| `tsconfig.json` | config | transform | `.planning/config.json` | partial |
| `vite.config.ts` | config | request-response | `.planning/adr/ADR-001-tech-stack.md` | partial |
| `src/engine/contracts/scene-spec.ts` | model | transform | `.planning/phases/02-mvp-engine/02-RESEARCH.md` | role-match |
| `src/engine/contracts/validate-scene-spec.ts` | utility | transform | `.planning/phases/02-mvp-engine/02-RESEARCH.md` | role-match |
| `src/engine/contracts/validation-errors.ts` | utility | transform | `.planning/phases/02-mvp-engine/02-CONTEXT.md` | role-match |
| `src/engine/timeline/scheduler.ts` | service | event-driven | `.planning/adr/ADR-002-timeline-architecture.md` | role-match |
| `src/engine/camera/preset-registry.ts` | service | request-response | `.planning/phases/02-mvp-engine/02-CONTEXT.md` | role-match |
| `src/engine/packet/packet-simulator.ts` | service | streaming | `.planning/adr/ADR-002-timeline-architecture.md` | role-match |
| `src/render/remotion/render-composition.tsx` | component | streaming | `.planning/adr/ADR-001-tech-stack.md` | role-match |
| `src/render/export/fingerprint.ts` | utility | file-I/O | `.planning/phases/02-mvp-engine/02-CONTEXT.md` | role-match |
| `src/fixtures/golden-scene-spec.json` | test | file-I/O | `.planning/phases/02-mvp-engine/02-CONTEXT.md` | role-match |
| `tests/scene-spec-validation.test.ts` | test | transform | `.planning/phases/02-mvp-engine/02-RESEARCH.md` | partial |
| `tests/timeline-determinism.test.ts` | test | event-driven | `.planning/adr/ADR-002-timeline-architecture.md` | partial |
| `tests/render-repro-smoke.test.ts` | test | batch | `.planning/adr/ADR-003-e2e-testing-strategy.md` | role-match |
| `.github/workflows/ci.yml` | config | batch | `.planning/adr/ADR-003-e2e-testing-strategy.md` | role-match |

## Pattern Assignments

### `src/engine/contracts/scene-spec.ts` (model, transform)

**Analog:** `.planning/phases/02-mvp-engine/02-RESEARCH.md`

**Imports pattern** (`02-RESEARCH.md`, lines 170-173):
```typescript
// Source: https://zod.dev/?id=objects
import {z} from "zod";
```

**Core contract pattern** (`02-RESEARCH.md`, lines 174-186):
```typescript
const SceneSpec = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  seed: z.string().min(1),
  timeline: z.array(z.object({
    id: z.string().min(1),
    track: z.string().min(1),
    startFrame: z.number().int().min(0),
    duration: z.number().int().positive()
  }))
});

const parsed = SceneSpec.parse(input);
```

**Validation/error surface pattern** (`02-CONTEXT.md`, lines 23-24):
```text
Emit structured validation errors (`path`, `code`, `message`, `hint`).
Require a golden `SceneSpec` fixture in CI.
```

---

### `src/engine/timeline/scheduler.ts` (service, event-driven)

**Analog:** `.planning/adr/ADR-002-timeline-architecture.md`

**Deterministic scheduling pattern** (`ADR-002`, lines 16-19):
```text
Frame index is the single source-of-truth for animation state.
Event scheduling is deterministic for identical inputs.
Scene templates are declarative data, not imperative runtime scripts.
Render outputs must be reproducible.
```

**Stable sort/event constraints** (`ADR-002`, lines 30-36):
```text
Hard rules:
- `id` format: `{topic}-{track}-{action}`
- `startFrame >= 0`
- `duration > 0`
- No duplicate/overlapping semantics for same `id`
- Stable sort before playback by (`startFrame`, `track`, `id`)
```

**Pure function state pattern** (`02-RESEARCH.md`, lines 193-195):
```typescript
function stateAtFrame(spec: SceneSpec, frame: number) {
  return runDeterministicScheduler(spec.timeline, frame, spec.seed);
}
```

---

### `src/engine/camera/preset-registry.ts` (service, request-response)

**Analog:** `.planning/phases/02-mvp-engine/02-CONTEXT.md`

**Preset + override bounds policy** (`02-CONTEXT.md`, lines 39-45):
```text
Author camera behavior as timeline-cued shot presets.
Support bounded per-shot parameter overrides on presets.
Require explicit transition cues in timeline between shots.
Reference packet actor IDs/groups in camera focus/follow cues.
Use centrally versioned preset library.
Hard-fail out-of-bounds preset override requests.
```

---

### `src/engine/packet/packet-simulator.ts` (service, streaming)

**Analog:** `.planning/adr/ADR-002-timeline-architecture.md`

**Packet payload pattern** (`ADR-002`, lines 38-40):
```text
Packet track: payload includes `route` with at least 2 points; glow/trail state depends on frame progress only.
```

**Lifecycle/branching policy** (`02-CONTEXT.md`, lines 47-50):
```text
Use path-segment interpolation over declared route nodes.
Use deterministic trail templates with bounded parameters.
Model branching via explicit spawn events with parent/child IDs.
Model lifecycle termination with explicit terminal states and deterministic visual cues.
```

---

### `src/render/remotion/render-composition.tsx` (component, streaming)

**Analog:** `.planning/adr/ADR-001-tech-stack.md`

**Render stack pattern** (`ADR-001`, lines 23-25):
```text
Use `Remotion` for frame-accurate composition.
Use `FFmpeg` for final encoding and export profiles.
```

**CLI invocation reference** (`02-RESEARCH.md`, lines 250-253):
```bash
npx remotion render <entry-point|serve-url>? <composition-id> <output-location> --codec=h264
```

---

### `src/render/export/fingerprint.ts` (utility, file-I/O)

**Analog:** `.planning/phases/02-mvp-engine/02-CONTEXT.md`

**Fingerprint policy pattern** (`02-CONTEXT.md`, lines 53-56):
```text
Gate on both deterministic run manifest and output fingerprint artifacts.
Require pinned runtime/toolchain versions for reproducibility checks.
Compute output fingerprint from frame-sample hash set plus normalized container metadata.
On gate failure, require failure bundle and rerun-after-fix evidence.
```

**Artifact checks pattern** (`ADR-003`, lines 38-43):
```text
verify output file exists, file size > 0, duration window, codec/container profile,
naming convention includes scenario + run id.
```

---

### `tests/render-repro-smoke.test.ts` (test, batch)

**Analog:** `.planning/adr/ADR-003-e2e-testing-strategy.md`

**Two-run determinism gate** (`ADR-003`, lines 33-36):
```text
Each canonical scenario runs at least twice with fixed seed/config.
Timeline traces must match by strict hash equality.
Any hash mismatch is a hard failure.
```

**CI matrix pattern** (`ADR-003`, lines 22-31):
```text
PR smoke matrix for TLS/SSH/DNS reduced-frame budget.
Nightly full matrix for full-length runs + determinism re-run checks.
```

---

### `.github/workflows/ci.yml` (config, batch)

**Analog:** `.planning/adr/ADR-003-e2e-testing-strategy.md`

**Pipeline policy** (`ADR-003`, lines 45-57):
```text
No silent retries in PR smoke by default.
One controlled retry only for nightly infra/transient failures.
Retain PR artifacts 7 days, nightly artifacts 14 days.
On failure preserve logs, trace hashes, and output metadata.
```

---

## Shared Patterns

### Deterministic-First Execution
**Source:** `.planning/adr/ADR-002-timeline-architecture.md`  
**Apply to:** `src/engine/timeline/*`, `src/engine/packet/*`, `src/engine/camera/*`
```text
Frame index is source-of-truth.
No wall-clock randomness or device-local mutable state.
Stable sort + deterministic replay for identical inputs.
```

### Strict Contract Validation
**Source:** `.planning/phases/02-mvp-engine/02-RESEARCH.md`, `.planning/phases/02-mvp-engine/02-CONTEXT.md`  
**Apply to:** `src/engine/contracts/*`, all render entrypoints
```text
Use strict schema objects.
Reject unknown fields.
Hard-fail unsupported schemaVersion.
Emit path/code/message/hint error items.
```

### Reproducibility Gate and Artifacts
**Source:** `.planning/phases/02-mvp-engine/02-CONTEXT.md`, `.planning/adr/ADR-003-e2e-testing-strategy.md`  
**Apply to:** `src/render/export/*`, `tests/render-repro-smoke.test.ts`, `.github/workflows/ci.yml`
```text
Require deterministic manifest + output fingerprint.
Hash compare repeated runs.
Preserve failure bundles and metadata for forensics.
```

## No Analog Found

Files with no close implementation analog in the current codebase (planner should use `02-RESEARCH.md` + ADRs):

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/engine/contracts/validate-scene-spec.ts` | utility | transform | No existing TS validation utility files in repository |
| `src/engine/contracts/validation-errors.ts` | utility | transform | No existing runtime error-shaping modules |
| `package.json` | config | batch | No Node project manifest exists yet |
| `tsconfig.json` | config | transform | No TS compiler config exists yet |
| `vite.config.ts` | config | request-response | No build tool configuration exists yet |
| `tests/scene-spec-validation.test.ts` | test | transform | No test framework or test files exist yet |

## Metadata

**Analog search scope:** workspace root (`docs/`, `.planning/`, intended `src/`, `tests/`, `.github/workflows/`)  
**Files scanned:** 45  
**Pattern extraction date:** 2026-05-28
