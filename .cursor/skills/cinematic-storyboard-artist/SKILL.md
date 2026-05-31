---
name: cinematic-storyboard-artist
description: Maps narrative beats to spatial shot lists and SceneSpec handoffs for security visualization. Use when translating beat sheets to actors, packets, timeline cues, or validating SceneSpec JSON against the engine schema.
---

# Cinematic Storyboard Artist

Codifies the **Technical Storyboard Artist** crew role. Bridge Director beat sheets and Art Director style tokens to deterministic **SceneSpec** JSON validated by the engine.

## When to Use

- Translating a Director beat sheet into a spatial shot list
- Mapping shots to `actors`, `packets`, and `timeline` fields
- Producing SceneSpec JSON for a topic module or assembly stitch
- Validating SceneSpec before handoff to Motion Designer or Creative Technologist

## Upstream Inputs

| Input | Path |
|-------|------|
| Beat sheet | `.cursor/skills/cinematic-director/templates/beat-sheet.md` |
| Style tokens | `docs/style-bible.md` |
| Art Director playbook | `.cursor/skills/cinematic-art-director/SKILL.md` |
| Module ids (optional column) | `docs/r3f-module-catalog.md` |

## Workflow

1. **Read beat sheet** — One shot row per contract beat id; frame ranges must match `storyboardBeats`.
2. **Read style bible** — Assign `--camera-*`, `--color-*`, `--light-*` tokens per shot (Art Director column).
3. **Build shot list** — Use [templates/shot-list.md](templates/shot-list.md): framing, module id, actors, packets, timeline cue id.
4. **Map to SceneSpec** — Aggregate actors/packets; timeline cues with `track: "packet"`, `startFrame`/`duration` from beats.
5. **Validate** — Run `validateSceneSpec` from `src/engine/contracts/validate-scene-spec.ts` before handoff. Reject if `ok: false`.
6. **Document handoff** — Fill [templates/scenespec-handoff.md](templates/scenespec-handoff.md) checklist.

## Beat-to-Spatial Rules

- **One shot per beat id** — ids from contract only (e.g. `tls-hook`, not "opening shot").
- **Framing** — Derive from Art Director camera tokens: wide (p25 hook), medium (p50), intimate (p75 cert/HUD).
- **Actors** — Network entities visible in shot (`actor-client`, `actor-server`, `actor-attacker`). Minimum one actor per SceneSpec.
- **Packets** — Each flow needs `id` and `route` with **≥2** points `{ x, y, z }`.
- **Timeline** — Cue `startFrame` aligns to beat `startFrame`; `duration = endFrame - startFrame` (minimum 1). `payload.packetId` must reference an existing packet id.
- **totalFrames** — ≥ max beat `endFrame`; match contract/fixture convention (e.g. TLS golden: 360).

## SceneSpec Field Mapping

Schema: `src/engine/contracts/scene-spec.ts` (v1.0.0 — do not extend in storyboard mode).

| Shot list column | SceneSpec field |
|------------------|-----------------|
| actors | `actors[]` — `{ id, label }` |
| packets | `packets[]` — `{ id, route[] }` |
| timeline cue | `timeline[]` — `{ id, track, startFrame, duration, easing, payload }` |
| (metadata) | `seed`, `sceneId`, `schemaVersion`, `capabilities` |

**Capabilities defaults:**
```json
{
  "postMvpCameraOverrides": false,
  "postMvpPacketPhysics": false
}
```

Only registered capability keys from `src/engine/contracts/capability-registry.ts`.

## Validation Gate

Before any handoff:

```typescript
import { validateSceneSpec } from "src/engine/contracts/validate-scene-spec.js";

const result = validateSceneSpec(draftSceneSpec);
if (!result.ok) {
  // Fix errors[].path / errors[].hint — do not hand off invalid JSON
}
```

Reference fixture: `src/fixtures/golden-scene-spec.json` (TLS canonical structure).

Run existing tests: `npm run test -- tests/content-contracts.test.ts` or import golden fixture in validation scripts.

## Long-Form Assemblies

For multi-topic exports, stitch per-topic SceneSpecs via `src/content/composition/build-long-form-scene-spec.ts`. Storyboard each topic separately first; stitch is Creative Technologist / composition layer (Phase 15).

## Templates

- [templates/shot-list.md](templates/shot-list.md) — spatial shot table
- [templates/scenespec-handoff.md](templates/scenespec-handoff.md) — JSON checklist + validation steps

## Coordination

| Downstream | Receives |
|------------|----------|
| 3D Motion Designer | Shot list `module id` column → catalog validation |
| Creative Technologist (Phase 15) | Validated SceneSpec JSON → render pipeline |

## Rules

- **No parallel schemas** — SceneSpec v1.0.0 only; no extra top-level fields.
- **No invented beat ids** — must exist in topic `contract.json`.
- **Validate before handoff** — `validateSceneSpec` is mandatory.
- **Deterministic seeds** — use `{topic}-seed-001` pattern from fixtures.

## Canonical References

[reference.md](reference.md)
