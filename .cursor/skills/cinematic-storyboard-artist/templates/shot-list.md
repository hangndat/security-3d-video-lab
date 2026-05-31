# Spatial Shot List

> One row per contract beat id from [Director beat sheet](../../cinematic-director/templates/beat-sheet.md). Module ids from [R3F module catalog](../../../../docs/r3f-module-catalog.md).

## Topic / Scene

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Contract | `src/content/topics/tls/contract.json` |
| Target SceneSpec | `src/fixtures/golden-scene-spec.json` (reference) |

## Shot Table

| Beat id | Framing | Module id | Style tokens | Actors | Packets / route | Timeline cue |
|---------|---------|-----------|--------------|--------|-----------------|--------------|
| tls-hook | wide (`--camera-framing`) | `viz-packet-threat` | `--color-accent-threat`, `--light-threat-pulse` | browser, origin, **sniffer** (hook only) | `packet-cleartext-sniff` **above** link x=-4→4 | tls-hook-cue |
| tls-client-hello-beat | medium tracking | `viz-packet-flow`, `viz-tunnel-handshake` | `--color-accent-data`, wireframe tunnel | browser, origin | `packet-client-hello` **on** link L→R · `ClientHello` | tls-client-hello-beat-cue |
| tls-server-hello-beat | medium + cert at origin | `viz-cert-single`, handshake | `--color-accent-trust`, `--camera-fov-intimate` | browser, origin | `packet-server-hello` R→L · cert @ x≈3.5 | tls-server-hello-beat-cue |
| tls-finished-beat | medium center | `viz-tunnel-secure` | `--color-accent-cyan`, solid tunnel along link | browser, origin | `packet-finished` center exchange | tls-finished-beat-cue |
| tls-app-data-beat | wide hold | `viz-packet-encrypted`, tunnel | `--color-accent-cyan` | browser, origin | `packet-app-encrypted` **inside** tunnel y&lt;0 | tls-app-data-beat-cue |

_All beat ids from contract `storyboardBeats`. Frame ranges in SceneSpec handoff._

## HUD Overlay (cross-beat)

| Module id | Style tokens | Notes |
|-----------|--------------|-------|
| `viz-hud-actor-label` | `--font-hud`, `--color-text-primary` | Actor name plates |
| `viz-hud-packet-id` | `--font-hud-sm`, `--color-text-muted` | Packet debug labels |

## Handoff Checklist

- [ ] Every beat id matches contract `storyboardBeats`
- [ ] Module ids exist in `docs/r3f-module-catalog.md`
- [ ] Style tokens cited from `docs/style-bible.md`
- [ ] SceneSpec handoff template filled and validated
