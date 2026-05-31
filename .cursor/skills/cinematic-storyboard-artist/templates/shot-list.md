# Spatial Shot List

> One row per contract beat id from [Director beat sheet](../../cinematic-director/templates/beat-sheet.md). Module ids from [R3F module catalog](../../../../docs/r3f-module-catalog.md).

## Topic / Scene

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Contract | `src/content/topics/tls/contract.json` |
| Target SceneSpec | `src/fixtures/golden-scene-spec.json` (reference) |

## Shot Table

| Beat id | Framing | Module id | Style tokens | Actors | Packets | Timeline cue |
|---------|---------|-----------|--------------|--------|---------|--------------|
| tls-hook | wide (`--camera-framing`) | `viz-packet-threat` | `--color-accent-threat`, `--light-threat-pulse` | actor-client, actor-attacker | packet-client-hello | tls-hook-cue |
| tls-client-hello-beat | medium tracking | `viz-packet-flow` | `--color-accent-data`, `--light-rim-intensity` | actor-client, actor-server | packet-client-hello | tls-client-hello-cue |
| tls-server-hello-beat | medium + cert detail | `viz-cert-single` | `--color-accent-trust`, `--camera-fov-intimate` | actor-server | packet-server-hello | tls-server-hello-cue |
| tls-finished-beat | medium | `viz-tunnel-secure` | `--color-accent-cyan`, `--light-accent-glow` | actor-client, actor-server | packet-finished | tls-finished-cue |
| tls-app-data-beat | wide hold | `viz-packet-encrypted` | `--color-accent-cyan`, `--color-text-primary` | actor-client, actor-server | packet-app-data | tls-app-data-cue |

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
