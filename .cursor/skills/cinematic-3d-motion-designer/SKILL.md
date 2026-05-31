---
name: cinematic-3d-motion-designer
description: Defines R3F visual module usage for packet, tunnel, certificate, and HUD primitives in security scenes. Use when selecting viz module ids, composition rules, or engine binding for 3D motion design.
---

# Cinematic 3D Motion Designer

Codifies the **3D Motion Designer** crew role. Apply the R3F module catalog to shot lists and motion handoffs — catalog is the single source for `viz-*` module ids.

## When to Use

- Validating or selecting module ids in a storyboard shot list
- Documenting composition rules for a beat (z-order, max modules)
- Explaining engine binding between SceneSpec and future R3F components
- Reviewing motion design consistency across topics

## Module Catalog (required reading)

**Always read first:** [docs/r3f-module-catalog.md](../../docs/r3f-module-catalog.md)

Four families: **packet**, **tunnel**, **cert**, **HUD**. Naming: `viz-<family>-<variant>`.

Do not paste full module tables into agent output — cite catalog ids.

## Workflow

1. **Read shot list** — From [cinematic-storyboard-artist/templates/shot-list.md](../cinematic-storyboard-artist/templates/shot-list.md).
2. **Confirm catalog entry** — Every `module id` must exist in `docs/r3f-module-catalog.md`.
3. **Apply composition rules** — Max 2 primary modules per shot; z-order from catalog; respect capability gates.
4. **Align style tokens** — Cross-check Art Director tokens per module row in catalog tables.
5. **Document binding** — Note which SceneSpec fields feed each module (packets, timeline, actors).

## Rules

- **Catalog ids only** — No ad-hoc module names outside `viz-*` registry.
- **No R3F implementation in v1.3** — Document and plan; `.tsx` components deferred to v1.4.
- **Deterministic motion** — All module animation derives from SceneSpec `seed` and timeline cues.
- **Capability respect** — `postMvpCameraOverrides` and `postMvpPacketPhysics` remain `false` unless registry updated.

## Module Selection Guide

| Narrative moment | Typical modules |
|------------------|-----------------|
| Threat hook (p25) | `viz-packet-threat`, sniffer actor, cleartext **above** link |
| Handshake mechanism | `viz-packet-flow`, `viz-tunnel-handshake`, `messageType` label |
| Certificate proof | `viz-cert-single` at server (chain only when CA/intermediate/leaf labels) |
| Secure channel established | `viz-tunnel-secure`, `viz-packet-encrypted` **inside** tunnel |
| HUD / labels | `viz-hud-actor-label` at anchors, `viz-hud-beat-caption`, packet `messageType` |

TLS publish layout: `docs/r3f-module-catalog.md` v1.1, `actor-anchors.ts`, `tests/tls-visual-story.test.ts`.

## Coordination

| Upstream | Role |
|----------|------|
| Storyboard Artist | Provides shot list `module id` column |
| Art Director | Style tokens per module (catalog Style tokens column) |
| Creative Technologist (Phase 15) | Renders validated SceneSpec through engine |

Cross-link: `.cursor/skills/cinematic-storyboard-artist/SKILL.md` for SceneSpec handoff validation.

## Engine Primitives

See catalog **Engine Binding Notes** for:
- `src/engine/packet/packet-state.ts`
- `src/engine/timeline/scheduler.ts`
- `src/engine/camera/preset-registry.ts`

## Canonical References

[reference.md](reference.md)
