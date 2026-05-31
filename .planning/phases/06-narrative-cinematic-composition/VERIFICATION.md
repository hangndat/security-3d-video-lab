# Phase 06 Narrative Composition Verification

Generated: 2026-05-31T07:45:31.735Z

## Gate Status

| Gate | Status |
| --- | --- |
| Phase 06 blocking gate | **PASS** |
| Assembly profiles valid | yes |
| Caption map present | yes |
| Replay suites passed | yes |

## Suite Results

| Suite | Command | Exit | Pass |
| --- | --- | ---: | --- |
| long-form-assembly | `npm run test -- tests/long-form-assembly.test.ts` | 0 | PASS |
| caption-timing-map | `npm run test -- tests/caption-timing-map.test.ts` | 0 | PASS |
| narrative-composition-replay | `npm run test -- tests/narrative-composition-replay.test.ts` | 0 | PASS |
| e2e-canonical-smoke | `npm run test:e2e:all -- --smoke` | 0 | SKIP |

## Assembly Coverage

| Slug | Topics | Branches | Default branch | Window (min-max) |
| --- | ---: | ---: | --- | --- |
| network-foundations-long-v1 | 3 | — | — | 4-6 min |
| security-expansion-long-v1 | 6 | — | — | 8-12 min |
| content-depth-branched-v1 | 8 | 2 | defense-path | 8-12 min |

## Caption Maps

| Assembly | Entries | Artifact |
| --- | ---: | --- |
| network-foundations-long-v1 | 15 | `.artifacts/captions/network-foundations-long-v1.json` |

## Machine Evidence

- JSON artifact: `.artifacts/verification/phase06/narrative-composition.json`

