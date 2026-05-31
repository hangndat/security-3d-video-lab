# Phase 14 Research — Storyboard & 3D Motion Skills

**Researched:** 2026-05-31
**Scope:** SceneSpec handoff patterns + R3F module catalog conventions

## SceneSpec Schema (v1.0.0)

| Field | Type | Storyboard mapping |
|-------|------|-------------------|
| `schemaVersion` | `"1.0.0"` | Fixed |
| `seed` | string | Deterministic; `{topic}-seed-001` pattern in fixtures |
| `sceneId` | string | `{topic}-scene` or `{topic}-golden-scene` |
| `actors[]` | id, label | One row per network entity in shot list |
| `packets[]` | id, route (≥2 points) | Packet flow shots; route defines spatial path |
| `timeline[]` | id, track, startFrame, duration, easing, payload | Beat frame ranges → cue windows; `track: "packet"`, `payload.packetId` |
| `totalFrames` | int | Max beat `endFrame` or contract-aligned total |
| `capabilities` | record | Default `postMvpCameraOverrides: false`, `postMvpPacketPhysics: false` |

Validation: `validateSceneSpec()` — Zod + capability registry. Storyboard skill must run validation before handoff.

## Fixture Patterns

| Fixture | Topic | Frames | Notes |
|---------|-------|--------|-------|
| `golden-scene-spec.json` | tls | 360 | Canonical TLS handshake structure |
| `ssh-scene-spec.json` | ssh | — | Multi-packet pattern |
| `dns-scene-spec.json` | dns | — | Resolver hierarchy routes |
| `manifest-scene-fixtures.ts` | all 9 | 270–360 | Export-quality registry |

## Engine Binding (future R3F)

| Engine module | Role | Catalog module |
|---------------|------|----------------|
| `packet-state.ts` | Interpolate packet position along route | `viz-packet-*` |
| `scheduler.ts` | Active timeline cues per frame | All modules via timeline |
| `camera/preset-registry.ts` | Shot presets (fov, distance, focus) | HUD + cert framing |

Render today: `render-composition.tsx` uses deterministic color trace (no R3F yet). Catalog documents target R3F API for v1.4.

## R3F Module Catalog (CREW-04)

Four families per ROADMAP/REQUIREMENTS:

| Module | Purpose | Typical beats |
|--------|---------|---------------|
| **packet** | Glowing data particles, trails, encrypted/plain states | hook, mechanism, app-data |
| **tunnel** | Secure channel visualization | finished-beat, encrypted flow |
| **cert** | Certificate chain, trust indicators | server-hello, PKI topics |
| **HUD** | Monospace labels, frame counters, actor plates | all beats; style bible `--font-hud` |

Naming: `viz-<family>-<variant>` (e.g. `viz-packet-flow`, `viz-tunnel-secure`, `viz-cert-chain`, `viz-hud-actor-label`).

## Verification Approach

Extend `tests/cinematic-crew-skills.test.ts`:
- CREW-03: storyboard skill frontmatter, references to `validateSceneSpec`, shot-list template exists
- CREW-04: motion skill frontmatter, `docs/r3f-module-catalog.md` sections for all four modules, naming pattern tests

No LLM behavior tests.

## Recommendations for Planner

1. **14-01:** Storyboard skill + `templates/shot-list.md` + `templates/scenespec-handoff.md`
2. **14-02:** Motion skill + `docs/r3f-module-catalog.md` + extend smoke tests
3. Single wave; 14-02 depends on 14-01 for shared test file and module id references in shot list

---

*Phase: 14-storyboard-3d-motion-skills*
