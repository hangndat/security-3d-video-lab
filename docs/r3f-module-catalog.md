# R3F Module Catalog

Canonical visual module vocabulary for Security Cinematic Lab. Agents cite **module ids** from this document in shot lists and motion handoffs.

**Scope:** v1.3+ catalog; R3F/headless implementations under `src/client/viz/`.  
**TLS spatial story:** [tls-crew-walkthrough.md](tls-crew-walkthrough.md), [src/content/topics/tls/KICH-BAN.md](../src/content/topics/tls/KICH-BAN.md)

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
| `viz-packet-flow` | default | `packets[]`, timeline `track: "packet"`, `payload.packetVariant: "flow"` | `--color-accent-data`, `--light-accent-glow` | mechanism (p50) |
| `viz-packet-encrypted` | secure | `packets[]`, `payload.packetVariant: "encrypted"` | `--color-accent-cyan` | app-data, completion |
| `viz-packet-threat` | exposed | `packets[]`, `payload.packetVariant: "threat"` | `--color-accent-threat`, `--light-threat-pulse` | hook (p25) |

**Binding:** `src/engine/packet/packet-state.ts` interpolates position along `packets[].route` for active timeline cues. `resolvePacketModuleId` in `src/client/viz/build-viz-frame-state.ts` reads `packetVariant` and cue id keywords.

**TLS production labels:** Set `payload.messageType` on each timeline cue (e.g. `ClientHello`, `ApplicationData`). Headless render attaches a billboard via `createHudLabelTexture` on the active packet sphere.

---

## Tunnel Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-tunnel-secure` | encrypted channel | timeline during finished/app beats | `--color-accent-cyan`, `--color-bg-deep` | tls-finished-beat, app-data |
| `viz-tunnel-handshake` | in-progress | timeline during hello beats | `--color-accent-data`, `--light-rim-intensity` | client-hello, server-hello |

**Binding:** Composed at R3F/headless layer from active timeline cues. On **tls-production-scene**, torus is scaled along the browser→origin axis (X) between link endpoints from `resolveTlsLinkEndpoints`.

---

## Certificate Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-cert-chain` | multi-link | actors with CA / intermediate / leaf **labels** | `--color-accent-trust`, `--camera-fov-intimate` | PKI topics |
| `viz-cert-single` | server cert | server-hello cue active | `--color-accent-trust`, `--font-hud` | tls-server-hello-beat |

**Binding:** `resolveCertModuleId` in `src/client/viz/resolve-modules.ts` — chain only when ≥2 PKI role keywords match actor labels. A third actor such as `sniffer` does **not** select chain.

**TLS production:** `viz-cert-single` group positioned near origin (`x≈3.5`) with `Certificate` billboard.

---

## HUD Modules

| Module id | Variant | SceneSpec inputs | Style tokens | Beat affinity |
|-----------|---------|------------------|--------------|---------------|
| `viz-hud-actor-label` | name plate + marker | `actors[]` via `resolveVisibleActors` | `--font-hud`, role semantic colors | all beats |
| `viz-hud-beat-caption` | narration overlay | `CaptionTimingMap.scriptIntent` | `--font-size-narration`, `--color-text-primary` | beat windows |
| `viz-hud-packet-id` | protocol label | active packet `messageLabel` (from `messageType`) | `--font-hud-sm`, `--color-text-muted` | mechanism beats |
| `viz-hud-frame-counter` | timeline debug | scheduler frame index | `--font-hud-sm`, `--color-text-muted` | optional QA overlay |

**Binding:**
- Actor labels: world anchors from `src/client/viz/actor-anchors.ts` (TLS production: browser x=-4, origin x=4, sniffer x=0 elevated, sniffer hidden after hook).
- Beat caption: 3D texture in scene + bottom PNG burn-in in `capture-viz-frame-png.ts`.
- Packet id HUD: displays `messageType`, not raw `packets[].id`.

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
| TLS spatial | One active packet per beat; cleartext above link; app data below wire inside tunnel |

Do not combine `viz-packet-threat` and `viz-packet-encrypted` in the same beat window without narrative transition.

---

## Engine Binding Notes

| Engine module | Path | Catalog usage |
|---------------|------|---------------|
| Packet interpolation | `src/client/packet/packet-interpolator.ts` | All `viz-packet-*` modules |
| Viz frame state | `src/client/viz/build-viz-frame-state.ts` | Module id + `messageLabel` |
| Actor anchors | `src/client/viz/actor-anchors.ts` | TLS link layout, visible actors |
| Module stack | `src/client/viz/resolve-modules.ts` | Tunnel/cert/HUD resolution |
| Headless meshes | `src/client/viz/viz-mesh-spec.ts` | Labels, link wire, cert position |
| Timeline scheduler | `src/engine/timeline/scheduler.ts` | Active cue windows per frame |
| SceneSpec validation | `src/engine/contracts/validate-scene-spec.ts` | Pre-render gate |
| Headless capture | `src/render/headless/capture-viz-frame-png.ts` | PNG + caption burn-in |
| Production rubric | `src/verification/tls-production-rubric.ts` | Per-beat module expectations |

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-31 | Initial four-family catalog (Phase 14 / CREW-04) |
| 1.1.0 | 2026-05-31 | TLS production spatial story, messageType labels, actor anchors |
