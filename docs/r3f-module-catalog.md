# R3F Module Catalog

Canonical visual module vocabulary for Security Cinematic Lab. Agents cite **module ids** from this document in shot lists and motion handoffs.

**Scope:** v1.3 defines catalog and conventions only. R3F `.tsx` component implementation is deferred to **v1.4 Production Content**.

Style tokens: [style-bible.md](style-bible.md). SceneSpec inputs: [scene-spec.ts](../src/engine/contracts/scene-spec.ts).

---

## Module Naming Convention

Pattern: **`viz-<family>-<variant>`**

| Segment | Values |
|---------|--------|
| family | `packet`, `tunnel`, `cert`, `hud` |
| variant | descriptive slug (kebab-case) |

Rules:
- Module ids are stable across topics and assemblies.
- Storyboard shot list `module id` column uses catalog ids only.
- New modules require a catalog entry before use in handoffs.

---

## Packet Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-packet-flow` | default | `packets[]`, timeline `track: "packet"` | `--color-accent-data`, `--light-accent-glow` | mechanism (p50) |
| `viz-packet-encrypted` | secure | `packets[]`, timeline after handshake | `--color-accent-cyan` | app-data, completion |
| `viz-packet-threat` | exposed | `packets[]`, hook beats | `--color-accent-threat`, `--light-threat-pulse` | hook (p25) |

**Binding:** `src/engine/packet/packet-state.ts` interpolates position along `packets[].route` for active timeline cues. `src/engine/timeline/scheduler.ts` determines active cues per frame.

---

## Tunnel Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-tunnel-secure` | encrypted channel | timeline during finished-beat | `--color-accent-cyan`, `--color-bg-deep` | tls-finished-beat, SSH session |
| `viz-tunnel-handshake` | in-progress | timeline during kex/hello beats | `--color-accent-data`, `--light-rim-intensity` | client-hello, server-hello |

**Binding:** Tunnel renders as environment wrapper around active packet routes; no separate SceneSpec field — composed at R3F layer from timeline window + packet routes.

---

## Certificate Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-cert-chain` | multi-link | actors (CA, intermediate, leaf) | `--color-accent-trust`, `--camera-fov-intimate` | PKI topics, server-hello |
| `viz-cert-single` | server cert | actor-server focus | `--color-accent-trust`, `--font-hud` | tls-server-hello-beat |

**Binding:** `src/engine/camera/preset-registry.ts` — cert/HUD shots use intimate FOV presets and `focus` on packet or actor ids when camera track cues are added post-MVP.

---

## HUD Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-hud-actor-label` | name plate | `actors[].label` | `--font-hud-md`, `--color-text-primary` | all beats |
| `viz-hud-packet-id` | debug label | `packets[].id` | `--font-hud-sm`, `--color-text-muted` | mechanism beats |
| `viz-hud-frame-counter` | timeline debug | scheduler frame index | `--font-hud-sm`, `--color-text-muted` | optional QA overlay |

**Binding:** HUD overlays read SceneSpec actors/packets; frame counter reads `scheduleFrame(sceneSpec, frame)` from scheduler.

---

## Composition Rules

| Rule | Value |
|------|-------|
| Max primary modules per shot | 2 (e.g. packet + tunnel, or cert + HUD) |
| HUD modules | May stack with any primary module |
| Z-order (back → front) | background → tunnel → packet → cert → HUD |
| Deterministic seed | SceneSpec `seed` required; module randomness derives from seed |
| Capability gate | `postMvpCameraOverrides: false` — use preset-registry defaults |
| Capability gate | `postMvpPacketPhysics: false` — route interpolation only |

Do not combine `viz-packet-threat` and `viz-packet-encrypted` in the same beat window without narrative transition.

---

## Engine Binding Notes

| Engine module | Path | Catalog usage |
|---------------|------|---------------|
| Packet interpolation | `src/engine/packet/packet-state.ts` | All `viz-packet-*` modules |
| Timeline scheduler | `src/engine/timeline/scheduler.ts` | Active cue windows per frame |
| Camera presets | `src/engine/camera/preset-registry.ts` | `viz-cert-*`, `viz-hud-*` framing |
| SceneSpec validation | `src/engine/contracts/validate-scene-spec.ts` | Pre-render gate for all modules |
| Render (deterministic) | `src/render/remotion/render-composition.tsx` | Color trace MVP; R3F binding v1.4+ |

**v1.4 target:** Each catalog id maps to one R3F component under `src/client/viz/` (not created in v1.3).

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-31 | Initial four-family catalog (Phase 14 / CREW-04) |
