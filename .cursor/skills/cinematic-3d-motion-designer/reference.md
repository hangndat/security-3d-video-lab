# 3D Motion Designer Reference — Canonical Repo Paths

## Module Catalog

| Document | Path |
|----------|------|
| R3F module catalog (single source) | `docs/r3f-module-catalog.md` |
| Style bible | `docs/style-bible.md` |
| TLS visual story | `docs/tls-crew-walkthrough.md` |

## Engine & Viz

| Artifact | Path |
|----------|------|
| Packet frame state | `src/engine/packet/packet-state.ts` |
| Viz frame state + messageLabel | `src/client/viz/build-viz-frame-state.ts` |
| Actor anchors (TLS layout) | `src/client/viz/actor-anchors.ts` |
| Module resolution | `src/client/viz/resolve-modules.ts` |
| Headless meshes + labels | `src/client/viz/viz-mesh-spec.ts` |
| Timeline scheduler | `src/engine/timeline/scheduler.ts` |
| SceneSpec validation | `src/engine/contracts/validate-scene-spec.ts` |
| TLS production rubric | `src/verification/tls-production-rubric.ts` |

## Upstream Skills

| Skill | Path |
|-------|------|
| Storyboard Artist | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |
| Shot list template | `.cursor/skills/cinematic-storyboard-artist/templates/shot-list.md` |
| KICH-BAN (TLS) | `src/content/topics/tls/KICH-BAN.md` |
| Art Director | `.cursor/skills/cinematic-art-director/SKILL.md` |

## Fixtures

| Fixture | Path | Role |
|---------|------|------|
| TLS publish SceneSpec | `src/fixtures/tls-production-scene-spec.json` | ~20s spatial story |
| TLS CI short | `src/fixtures/golden-scene-spec.json` | PR demo only |
| TLS server-hello unit | `src/fixtures/tls-server-hello-scene-spec.json` | Cert module tests |
| Manifest scenes | `src/fixtures/manifest-scene-fixtures.ts` | Nine-topic registry |

## Tests

| Test | Path |
|------|------|
| TLS visual story | `tests/tls-visual-story.test.ts` |
| TLS production export | `tests/tls-production-export.test.ts` |
| Cert/HUD modules | `tests/viz-cert-hud-modules.test.ts` |

## R3F Components

| Target | Path |
|--------|------|
| R3F components | `src/client/viz/` |
