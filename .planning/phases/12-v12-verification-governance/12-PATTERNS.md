# Phase 12 Pattern Map

**Generated:** 2026-05-31

## Closest Analogs

| New artifact | Closest analog | Pattern |
|--------------|----------------|---------|
| Nine-topic export tests | `expansion-batch-export.test.ts` | `renderCompositionDemoMp4` + `assertExportQuality` |
| v1.2 module fixtures | `auth-session-scene-spec.json` | Contract-aligned totalFrames, unique seed |
| Branch export tests | `narrative-composition-replay.test.ts` | `branchId` on stitch + export bundle |
| verify-content-depth.mjs | `verify-batch-quality.mjs` | Suite runner + JSON/MD evidence |
| V12 milestone audit | `audit-milestone-v1.1.mjs` | Phase JSON gateStatus aggregation |
| Governance re-enable | Phase 08 `ci.yml` wiring | Uncomment + update phase references |

## File Modification Map

### Wave 1 (12-01) — VER-04
- `src/fixtures/zero-trust-access-scene-spec.json`
- `src/fixtures/oauth-jwt-session-scene-spec.json`
- `src/fixtures/api-gateway-waf-scene-spec.json`
- `src/fixtures/manifest-scene-fixtures.ts` (new)
- `tests/v12-content-depth-export.test.ts` (new)
- `tests/expansion-batch-export.test.ts`
- `tests/expansion-module-e2e.test.ts`
- `src/verification/module-packet.ts`
- `scripts/verify-content-depth.mjs` (new)
- `package.json`

### Wave 2 (12-02) — VER-05 + milestone close
- `src/verification/milestone-audit.ts`
- `scripts/audit-milestone-v1.2.mjs` (new)
- `scripts/verify-milestone-governance.mjs`
- `scripts/verify-content-authoring.mjs` or phase09 wrapper (phase 09 JSON)
- `scripts/verify-narrative-composition.mjs` (phase 10 JSON path note)
- `.github/workflows/ci.yml`
- `.planning/milestones/v1.2-MILESTONE-AUDIT.md`
- `.planning/milestones/v1.2-ROADMAP.md`
- `.planning/MILESTONES.md`
- `.planning/PROJECT.md`
- `.planning/STATE.md`
