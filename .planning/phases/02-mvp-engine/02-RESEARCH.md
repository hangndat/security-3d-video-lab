# Phase 02: mvp-engine - Research

**Researched:** 2026-05-28
**Domain:** Deterministic 3D scene/timeline/render engine foundations
**Confidence:** HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a single `SceneSpec` as the canonical source of truth for scene, timeline, camera, and packet definitions.
- **D-02:** Require strict schema with required fields and explicit `schemaVersion`.
- **D-03:** Use ID-based cross-module references with upfront link validation.
- **D-04:** Run pre-render validation as a hard gate before render/export.
- **D-05:** Reject unknown fields in strict mode.
- **D-06:** Hard-fail unsupported `schemaVersion` values (no silent compatibility fallback).
- **D-07:** Emit structured validation errors (`path`, `code`, `message`, `hint`).
- **D-08:** Require a golden `SceneSpec` fixture in CI.
- **D-09:** Extend post-MVP capabilities via explicit feature-flag capability registry.
- **D-10:** Require author-defined stable IDs for scene/track/cue/packet actors.
- **D-11:** Block CI when deterministic-critical fields are missing.
- **D-12:** Enforce strict numeric constraints and bounds in schema.
- **D-13:** Require a deterministic seed in every `SceneSpec`.
- **D-14:** Use frame index as canonical timebase.
- **D-15:** Apply deterministic math policy with fixed precision normalization at comparison boundaries.
- **D-16:** Require matching deterministic manifest plus stable artifact fingerprint policy for identical spec+seed runs.
- **D-17:** Hard-fail reproducibility violations and emit diff bundle.
- **D-18:** Include engine/runtime provenance fingerprint in deterministic manifests.
- **D-19:** Author camera behavior as timeline-cued shot presets.
- **D-20:** Support bounded per-shot parameter overrides on presets.
- **D-21:** Require explicit transition cues in timeline between shots.
- **D-22:** Reference packet actor IDs/groups in camera focus/follow cues.
- **D-23:** Use centrally versioned preset library.
- **D-24:** Hard-fail out-of-bounds preset override requests.
- **D-25:** Use path-segment interpolation over declared route nodes.
- **D-26:** Use deterministic trail templates with bounded parameters.
- **D-27:** Model branching via explicit spawn events with parent/child IDs.
- **D-28:** Model lifecycle termination with explicit terminal states and deterministic visual cues.
- **D-29:** Gate on both deterministic run manifest and output fingerprint artifacts.
- **D-30:** Require pinned runtime/toolchain versions for reproducibility checks.
- **D-31:** Compute output fingerprint from frame-sample hash set plus normalized container metadata.
- **D-32:** On gate failure, require failure bundle and rerun-after-fix evidence.

### Claude's Discretion
- Cross-module linking policy was selected by Claude: ID-based references with upfront validation.
- Pre-render validation policy was selected by Claude: hard gate before render/export.
- Unknown-field handling was selected by Claude: strict rejection.
- Unsupported schema-version handling was selected by Claude: hard fail.
- Error reporting format was selected by Claude: structured error list.
- Reproducibility fixture policy was selected by Claude: required golden fixture in CI.

### Deferred Ideas (OUT OF SCOPE)
- Physics-like packet motion engine.
- Runtime camera auto-focus heuristics.
- Loose/compatibility schema execution modes.
- Manual reproducibility overrides without artifact evidence.

## Summary

Phase 02 should be planned as a contract-first deterministic engine slice, not as ad-hoc visual coding. The architecture should establish a strict `SceneSpec`, deterministic timeline execution by frame index, camera/preset orchestration, packet interpolation primitives, and reproducibility gates before expanding content complexity. This is directly aligned with ADR-001/002/003 and the phase context decisions. [VERIFIED: local repo ADR/context docs]

Current ecosystem evidence supports the same stack direction: Three.js + React Three Fiber for scene authoring and Remotion + FFmpeg for render/export, with schema validation and deterministic hashing utilities as supporting infrastructure. Latest registry versions were verified on 2026-05-28 and should be pinned in lockfiles for reproducibility policy D-30. [VERIFIED: npm registry]

This repository is still docs-only (no app source, no tests, no package manager manifest), so Wave 0 planning must include bootstrap tasks for runtime scaffolding, validation framework, and CI artifact checks before feature tasks. [VERIFIED: workspace scan]

**Primary recommendation:** Plan Phase 02 in two layers: (1) deterministic contract/validator/scheduler core, then (2) render/export reproducibility pipeline with hard CI gates.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `SceneSpec` schema + validation | API / Backend (Node engine modules) | Browser / Client | Contract parsing and deterministic validation should be runtime-agnostic and test-first, with UI consuming validated data only. [VERIFIED: ADR-002 + D-01..D-12] |
| Timeline scheduler | API / Backend (Node engine modules) | Browser / Client | Frame-index canonical state and stable sort rules belong in pure deterministic modules, not render hooks. [VERIFIED: ADR-002] |
| Camera preset orchestration | API / Backend (engine logic) | Browser / Client (Three camera apply) | Cue resolution and bounds checks are deterministic logic; Three scene applies final transforms. [VERIFIED: D-19..D-24] |
| Packet interpolation primitive | Browser / Client | API / Backend | Visual interpolation executes in Three/R3F runtime, while route/state contracts are validated in core modules. [VERIFIED: ADR-001 + D-25..D-28] |
| Render/export + fingerprint | Frontend Server (Remotion CLI/renderer) | API / Backend | Render orchestration and ffmpeg output checks are pipeline responsibilities outside interactive scene runtime. [VERIFIED: Remotion docs + ADR-001 + ADR-003] |
| Determinism manifest + CI gate | API / Backend + CI pipeline | — | Hashing, provenance, artifact diffing, and hard-fail policy are build-time quality gates. [VERIFIED: D-16..D-32, ADR-003] |

## Project Constraints (from .cursor/rules/)

No `.cursor/rules/` directory found in this repository; no additional project-specific rule constraints were discovered. [VERIFIED: filesystem scan]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | `0.184.0` | 3D primitives, math, camera/object transforms | Canonical underlying 3D engine for R3F and deterministic transform math policies. [VERIFIED: npm registry + ADR-001] |
| `@react-three/fiber` | `9.6.1` | React renderer for Three scenes | Provides declarative scene composition while keeping deterministic engine logic in pure TS modules. [VERIFIED: npm registry + ADR-001] |
| `@react-three/drei` | `10.7.7` | common helpers/controls/material utilities | Reduces hand-rolled scene utilities and keeps authoring velocity high. [VERIFIED: npm registry + ADR-001] |
| `remotion` | `4.0.468` | frame-accurate composition + CLI render | Officially supports controlled render flags and deterministic render invocation from CLI. [VERIFIED: npm registry + CITED: https://www.remotion.dev/docs/cli/render] |
| `ffmpeg` | `8.1` (local) | final encoding, metadata normalization checks | Required for artifact/container-level reproducibility assertions in export gate. [VERIFIED: local env + CITED: https://ffmpeg.org/ffmpeg-formats.html] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | `4.4.3` | strict schema validation + typed parse | Use for `SceneSpec` contract validation and unknown-key rejection (`z.strictObject`). [VERIFIED: npm registry + CITED: https://zod.dev/?id=objects] |
| `ajv` | `8.20.0` | JSON Schema validation (optional CI/tooling path) | Use if JSON Schema export/interop with external tooling is needed. [VERIFIED: npm registry] |
| `seedrandom` | `3.0.5` | deterministic seeded PRNG | Use for any pseudo-randomized visual variation under deterministic seed control. [VERIFIED: npm registry] |
| `typescript` | `6.0.3` | typed deterministic engine modules | Use strict typing for scene/timeline/camera/event contracts. [VERIFIED: npm registry] |
| `vite` | `8.0.14` | app/dev tooling baseline | Use for local authoring shell aligned with ADR-001 baseline. [VERIFIED: npm registry + ADR-001] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `zod` runtime schema | `ajv`-only JSON Schema pipeline | AJV is strong for pure schema interoperability; Zod is faster for TS-first developer ergonomics in early engine modules. [VERIFIED: ecosystem practice + local constraints] |
| R3F declarative scene authoring | raw Three.js imperative scene graph | Raw Three gives lower-level control but increases boilerplate and reduces authoring velocity for MVP. [VERIFIED: ADR-001] |

**Installation:**
```bash
npm install three @react-three/fiber @react-three/drei remotion zod ajv seedrandom
npm install -D typescript vite
```

**Version verification:**
- `three@0.184.0` published 2026-04-16. [VERIFIED: npm registry]
- `@react-three/fiber@9.6.1` published 2026-04-28. [VERIFIED: npm registry]
- `@react-three/drei@10.7.7` published 2025-11-13. [VERIFIED: npm registry]
- `remotion@4.0.468` published 2026-05-27. [VERIFIED: npm registry]
- `zod@4.4.3` published 2026-05-04. [VERIFIED: npm registry]
- `ajv@8.20.0` published 2026-04-24. [VERIFIED: npm registry]
- `seedrandom@3.0.5` published 2019-09-17. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
SceneSpec JSON
   |
   v
[Schema Validator + Link Checker] --(errors:path/code/message/hint)--> [CI Gate Fail]
   |
   v
[Deterministic Timeline Builder]
   |
   +--> [Camera Preset Resolver + Override Bounds Check]
   |
   +--> [Packet Route/Spawn/Lifecycle Resolver]
   |
   v
[Frame Runner (seed + frame index)]
   |
   v
[R3F/Three Renderer] --> [Remotion Composition] --> [FFmpeg Export]
                                                    |
                                                    v
                          [Manifest + Fingerprint + Provenance Diff]
                                                    |
                                                    v
                                              [Reproducibility Gate]
```

### Recommended Project Structure
```text
src/
├── engine/contracts/      # SceneSpec schemas, validators, error mapping
├── engine/timeline/       # scheduler, stable sort, cue resolution
├── engine/camera/         # shot preset registry + override checks
├── engine/packet/         # route interpolation + lifecycle transitions
├── render/remotion/       # compositions, render entrypoints
├── render/export/         # ffmpeg profiles, metadata normalization, fingerprinting
├── fixtures/              # golden SceneSpec and expected manifests
└── tests/                 # unit + integration + reproducibility gates
```

### Pattern 1: Strict contract gate before render
**What:** Parse `SceneSpec` with strict schema and fail unknown keys/version mismatch before timeline/render.
**When to use:** Every render/export run (local + CI).
**Example:**
```typescript
// Source: https://zod.dev/?id=objects
import {z} from "zod";

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

### Pattern 2: Deterministic frame runner as pure function
**What:** Derive state from `(SceneSpec, frameIndex, seed)` only.
**When to use:** Timeline, packet state, and camera state computation.
**Example:**
```typescript
function stateAtFrame(spec: SceneSpec, frame: number) {
  return runDeterministicScheduler(spec.timeline, frame, spec.seed);
}
```

### Pattern 3: Reproducibility artifacts as first-class outputs
**What:** Emit timeline trace hash, manifest, output fingerprint, and provenance every run.
**When to use:** PR smoke, nightly matrix, and release candidate renders.
**Example:**
```typescript
const manifest = buildDeterminismManifest({specHash, seed, runtime, toolchain});
const fingerprint = await fingerprintOutputMp4(outputPath);
assertReproducible(manifest, fingerprint, baseline);
```

### Anti-Patterns to Avoid
- **Render-first validation:** Allowing invalid specs to reach renderer creates expensive failures and non-actionable CI output. [VERIFIED: D-04, ADR-003]
- **Wall-clock or device-state logic in scheduler:** Breaks determinism policy and invalidates strict trace checks. [VERIFIED: ADR-002]
- **Implicit fallback for schema version:** Violates hard-fail policy and hides migration debt. [VERIFIED: D-06]
- **Manual ad-hoc camera values per scene:** Bypasses preset library consistency and raises rewrite risk in Phase 03+. [VERIFIED: D-23]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime schema validation | custom recursive validator | `zod` strict objects | Unknown keys, nested paths, and useful error surfaces are already solved. [CITED: https://zod.dev/?id=objects] |
| Video render orchestration | bespoke Chromium + encoder glue | `remotion` CLI/renderer | Remotion already provides composition/render pipeline and codec/runtime flags. [CITED: https://www.remotion.dev/docs/cli/render] |
| Container metadata handling | custom mp4 metadata parser | `ffmpeg`/`ffprobe` pipeline | Container-level metadata and muxer details are complex and standardized in ffmpeg tools. [CITED: https://ffmpeg.org/ffmpeg-formats.html] |
| 3D scene graph abstraction | proprietary mini-engine wrapper | `three` + `@react-three/fiber` | Reinventing scene graph orchestration slows delivery and adds maintenance risk. [VERIFIED: ADR-001] |

**Key insight:** In this domain, correctness and reproducibility failures usually come from edge-case handling (schema, timing, metadata), where mature libraries are safer than custom implementations. [VERIFIED: ADR decisions + docs]

## Common Pitfalls

### Pitfall 1: Deterministic policy leakage into render hooks
**What goes wrong:** Camera/packet state mutates in component effects based on elapsed real time.
**Why it happens:** Convenience use of per-frame runtime state without canonical frame-index source.
**How to avoid:** Keep scheduler pure in engine modules; render layer only consumes computed frame state.
**Warning signs:** Same seed/spec creates different trace hashes across runs. [VERIFIED: ADR-002/003]

### Pitfall 2: Schema strictness drift
**What goes wrong:** New fields slip in silently and are ignored, creating hidden authoring bugs.
**Why it happens:** Non-strict object parsing defaults.
**How to avoid:** Use strict schema mode and reject unknown keys in CI fixtures.
**Warning signs:** Scene fields appear in source but not reflected in timeline output. [CITED: https://zod.dev/?id=objects + VERIFIED: D-05]

### Pitfall 3: Repro checks based only on filename/size
**What goes wrong:** Pipeline appears stable while frame content drifts.
**Why it happens:** Artifact validation lacks frame-sample hashing + normalized metadata comparison.
**How to avoid:** Persist deterministic manifests and sample-frame hash sets per run.
**Warning signs:** Codec/container passes but visual diff appears between supposedly identical runs. [VERIFIED: D-31, ADR-003]

## Code Examples

Verified patterns from official sources:

### Remotion CLI render
```bash
# Source: https://www.remotion.dev/docs/cli/render
npx remotion render <entry-point|serve-url>? <composition-id> <output-location> --codec=h264
```

### R3F frame loop hook
```typescript
// Source: https://github.com/pmndrs/react-three-fiber/blob/master/docs/API/hooks.mdx
useFrame((state, delta) => {
  // apply already computed deterministic state for this frame
});
```

### Strict object unknown-key rejection
```typescript
// Source: https://zod.dev/?id=objects
const StrictDog = z.strictObject({ name: z.string() });
StrictDog.parse({ name: "Yeller", extraKey: true }); // throws
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual animation scripts tied to component lifecycle | Data-driven timeline specs with deterministic frame-based scheduling | Ongoing ecosystem trend; codified in ADR-002 (2026-05-28) | Better reproducibility and testability for content pipelines. [VERIFIED: ADR-002] |
| One-off video export scripts | Declarative render pipelines with reproducible CLI flags/artifacts | Modernized by tools like Remotion v4 era | Easier CI integration and reproducibility gates. [CITED: https://www.remotion.dev/docs/cli/render] |

**Deprecated/outdated:**
- Unstructured scene config without explicit schema version is incompatible with this phase's hard-fail policy. [VERIFIED: D-02, D-06]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `ajv` will be needed if external JSON Schema interoperability is required in this phase. [ASSUMED] | Standard Stack | Could add unnecessary dependency scope if interop is not actually required. |
| A2 | Frame-sample hashing strategy can be implemented without unacceptable render-time overhead for MVP CI budgets. [ASSUMED] | Common Pitfalls / Reproducibility | CI duration may exceed acceptable PR gate times, requiring alternative sampling strategy. |

## Open Questions (RESOLVED)

1. **`SceneSpec.schemaVersion` policy for MVP**
   - **Resolution:** MVP uses a fixed literal `schemaVersion: "1.0.0"` only.
   - **Execution rule:** Validator hard-fails any non-`1.0.0` value with structured error + hint to migrate or pin the spec.
   - **Why this resolves risk:** Removes patch-range ambiguity and keeps deterministic compatibility behavior explicit (D-02, D-06).

2. **Frame-sample set for D-31 output fingerprinting**
   - **Resolution:** Use a deterministic 7-frame sample set per render scenario: `0`, `floor(totalFrames*0.1)`, `floor(totalFrames*0.25)`, `floor(totalFrames*0.5)`, `floor(totalFrames*0.75)`, `floor(totalFrames*0.9)`, `totalFrames-1`.
   - **Execution rule:** Persist sampled frame indexes and hashes inside the deterministic manifest and compare strict equality on reruns.
   - **Why this resolves risk:** Captures start/early/mid/late/end drift while keeping PR smoke runtime bounded (D-31, D-32).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Engine modules, build scripts | ✓ | `v25.6.0` | — |
| npm | Package install + scripts | ✓ | `11.8.0` | — |
| ffmpeg | Export and metadata checks | ✓ | `8.1` | — |
| Python 3 | optional scripting support | ✓ | `3.9.6` | — |
| Remotion CLI global binary | direct CLI usage | ✗ (global) | — | use local project `npx remotion` after dependency install |

**Missing dependencies with no fallback:**
- None identified in current machine audit.

**Missing dependencies with fallback:**
- Global Remotion binary is absent; local npm dependency + `npx remotion` is sufficient for phase execution.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none detected yet (recommend `vitest` + node integration tests) [VERIFIED: workspace scan + ASSUMED] |
| Config file | none — create in Wave 0 |
| Quick run command | `npm run test:quick` (to be created in Wave 0) [ASSUMED] |
| Full suite command | `npm test` (to be created in Wave 0) [ASSUMED] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-02/D-05/D-06 | strict schema + unknown key/version hard fail | unit | `npm run test:quick -- scene-spec-validation` | ❌ Wave 0 |
| D-13/D-14/D-15 | deterministic frame-state output for same seed/frame | unit | `npm run test:quick -- timeline-determinism` | ❌ Wave 0 |
| D-19..D-24 | camera preset application and override bounds | unit | `npm run test:quick -- camera-preset-bounds` | ❌ Wave 0 |
| D-25..D-28 | packet interpolation/branch/lifecycle determinism | integration | `npm run test:quick -- packet-engine` | ❌ Wave 0 |
| D-29..D-32 | render/export reproducibility gate + artifact checks | smoke/e2e | `npm run test:e2e:render-smoke` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** targeted quick deterministic tests (`test:quick`) [ASSUMED]
- **Per wave merge:** full engine + render smoke suite (`npm test` + e2e smoke) [ASSUMED]
- **Phase gate:** two-run reproducibility check per canonical scenario before `/gsd-verify-work` [VERIFIED: ADR-003]

### Wave 0 Gaps
- [ ] `package.json` and test scripts scaffold.
- [ ] `tests/scene-spec-validation.test.ts` — D-02/D-05/D-06.
- [ ] `tests/timeline-determinism.test.ts` — D-13/D-14/D-15.
- [ ] `tests/camera-preset-bounds.test.ts` — D-19..D-24.
- [ ] `tests/packet-engine.integration.test.ts` — D-25..D-28.
- [ ] `tests/render-repro-smoke.test.ts` — D-29..D-32.
- [ ] CI workflow for PR smoke and nightly full matrix aligned with ADR-003.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Not in scope for phase engine foundations. [VERIFIED: phase scope] |
| V3 Session Management | no | Not in scope for phase engine foundations. [VERIFIED: phase scope] |
| V4 Access Control | no | Not in scope for current local render pipeline work. [VERIFIED: phase scope] |
| V5 Input Validation | yes | Strict schema validation (`zod`) for scene/timeline/camera/packet payloads. [CITED: https://zod.dev/?id=objects] |
| V6 Cryptography | yes | Use platform crypto (`node:crypto`) for hashing/fingerprints; never custom crypto primitives. [VERIFIED: security best practice + phase determinism needs] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed/hostile SceneSpec causing undefined engine behavior | Tampering | Strict schema parsing, bounds checks, unknown-key rejection, hard-fail pre-render gate. [VERIFIED: D-02, D-04, D-05, D-12] |
| Artifact tampering between render and verification | Tampering | Hash manifest + provenance fingerprint + CI artifact retention policy. [VERIFIED: D-16..D-18, ADR-003] |
| Non-deterministic runtime state causing untraceable failures | Repudiation | Deterministic trace hashing and failure diff bundles retained on failure. [VERIFIED: D-17, ADR-003] |

## Sources

### Primary (HIGH confidence)
- Local repository artifacts (`02-CONTEXT.md`, ADR-001, ADR-002, ADR-003, `docs/roadmap.md`, `docs/brd.md`, `docs/phase2-content-packets.md`) - phase constraints, stack and gate policy.
- npm registry (`npm view <pkg> version time`) - latest package versions and publish timestamps.
- Context7 `/remotion-dev/remotion` - CLI render usage and codec flag behavior.
- Context7 `/pmndrs/react-three-fiber` - frame loop and scheduling hook patterns.
- Context7 `/colinhacks/zod` - strict object unknown-key rejection semantics.

### Secondary (MEDIUM confidence)
- [Remotion CLI render docs](https://www.remotion.dev/docs/cli/render) - confirmed flags and invocation shape.
- [Zod Objects docs](https://zod.dev/?id=objects) - strict object behavior.
- [FFmpeg Formats docs](https://ffmpeg.org/ffmpeg-formats.html) - mux/container metadata and format handling.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - locked ADR stack plus registry-verified current versions.
- Architecture: HIGH - strongly constrained by D-01..D-32 and ADR-002/003.
- Pitfalls: MEDIUM - mostly policy-derived; concrete implementation data will increase confidence after Wave 0 scaffolding.

**Research date:** 2026-05-28
**Valid until:** 2026-06-27
