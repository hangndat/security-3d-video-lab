# Phase 19 Patterns

Extends Phase 17–18 viz patterns and v1.2/v1.3 export + crew verification patterns.

| Pattern | Closest analog | Use for Phase 19 |
|---------|----------------|------------------|
| Export-quality scene fixture | `src/fixtures/manifest-scene-fixtures.ts` (Phase 12) | tls-production-scene-spec.json structure |
| Partial TLS beat fixture | `src/fixtures/tls-server-hello-scene-spec.json` | Server-hello cue pattern |
| Short MP4 render | `renderCompositionDemoMp4` in render-composition.tsx | Add production sibling function |
| Export quality policy | `src/verification/export-quality.ts` | PRODUCTION_EXPORT_QUALITY_POLICY |
| E2E canonical export | `tests/e2e-canonical-flows.test.ts` | tls-production-export.test.ts |
| Crew verify script | `scripts/verify-crew-skills.mjs` | verify-tls-production.mjs |
| Milestone evidence JSON | `.artifacts/verification/phase16/crew-skills.json` | phase19/tls-production.json |
| Security checklist | `docs/security-accuracy-checklist.md` | tls-production-rubric.ts |
| Caption + narration | `buildLongFormExportBundle` | TLS-only caption map in production export |
| Viz compose | `getComposePlan` + `ComposeOptions` | Production trace + rubric module checks |

## New files (expected)

```
src/fixtures/tls-production-scene-spec.json
src/verification/tls-production-rubric.ts
src/render/export/generate-tls-production-artifacts.ts
scripts/verify-tls-production.mjs
tests/tls-production-export.test.ts
.artifacts/production/tls/          (generated at verify/export)
.artifacts/verification/phase19/    (evidence JSON)
```

## Files to extend

```
src/render/remotion/render-composition.tsx   — vizRenderTraceInput, renderCompositionProductionMp4
src/verification/export-quality.ts           — PRODUCTION_EXPORT_QUALITY_POLICY
docs/tls-crew-walkthrough.md                 — production fixture as canonical publish SceneSpec
.cursor/skills/cinematic-creative-technologist/SKILL.md — production profile row (optional doc touch)
```

---
*Phase: 19-tls-publish-ready-production*
