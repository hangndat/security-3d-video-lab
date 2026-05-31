# Phase 23 Patterns

**Mapped:** 2026-05-31
**Phase:** 23-tls-3d-production-export

## Closest Analogs

| New behavior | Closest existing | Pattern |
|--------------|------------------|---------|
| Video-only artifact generator | `generate-tls-production-artifacts.ts` | Extend, don't fork |
| Manifest schema bump | Phase 19 `schemaVersion: "1.0.0"` | Additive fields + version bump |
| Rubric option | `assertTlsProductionRubric` | Options object `{ videoOnly }` |
| 3D verify gate | `verify-headless-scene-parity.mjs` | JSON evidence under phase23/ |
| Backend forcing | `render-composition.test.ts` | Explicit `{ backend }` in options |

## File Touch Map

| File | 23-01 | 23-02 |
|------|-------|-------|
| `generate-tls-production-artifacts.ts` | videoOnly path, manifest v1.1.0 | render handoff updates |
| `tls-production-rubric.ts` | videoOnly rubric option | 3D signoff fields |
| `resolve-production-render-backend.ts` | `resolveFrameSource()` helper | — |
| `tests/tls-production-export.test.ts` | video-only manifest tests | GL-gated 3D smoke |
| `scripts/verify-tls-3d-production.mjs` | — | CREATE |
| `docs/tls-crew-walkthrough.md` | Step 5 video-only note | verify command |
| `scripts/verify-tls-production.mjs` | optional frameSource check | — |

## Anti-Patterns

- Requiring narration artifacts in v1.5 default verify gate
- Blocking CI on full 236-frame 3D render
- Removing trace-hash backend (needed for Phase 24 CI)

---
*Phase: 23-tls-3d-production-export*
