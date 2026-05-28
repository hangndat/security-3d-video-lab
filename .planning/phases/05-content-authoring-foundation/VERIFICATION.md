# Phase 05 Content Authoring Foundation Verification

Generated: 2026-05-28T12:56:02.183Z

## Gate Status

| Gate | Status |
| --- | --- |
| D-11 blocking gate (contract + E2E smoke) | **FAIL** |
| Blocking contract errors | 0 |
| E2E smoke suites passed | yes |
| Warning count (contract drift policy) | 0 |

## Suite Results

| Suite | Command | Exit | Pass |
| --- | --- | ---: | --- |
| content-authoring-foundation | `npm run test -- tests/content-authoring-foundation.test.ts` | 1 | FAIL |
| content-contracts | `npm run test -- tests/content-contracts.test.ts` | 0 | PASS |
| e2e-canonical-smoke | `npm run test:e2e:all -- --smoke` | 0 | PASS |

## Module Coverage

| Module ID | Slug | Draft | Schema | Beats | Placeholders |
| --- | --- | --- | --- | ---: | ---: |
| tls | tls-short-v1 | no | valid | 5 | 5 |
| ssh | ssh-short-v1 | no | valid | 5 | 5 |
| dns | dns-short-v1 | no | valid | 5 | 5 |
| auth-session | auth-session-short-v1 | yes | valid | 5 | 5 |
| pki-trust-chain | pki-trust-chain-short-v1 | yes | valid | 5 | 5 |
| mitm-defense | mitm-defense-short-v1 | yes | valid | 5 | 5 |

## New Draft Modules (CONT-01)

- auth-session: valid (auth-session-short-v1)
- pki-trust-chain: valid (pki-trust-chain-short-v1)
- mitm-defense: valid (mitm-defense-short-v1)

## Machine Evidence

- JSON artifact: `.artifacts/verification/phase05/content-authoring-foundation.json`

## Blocking Errors

- content-authoring-foundation failed (npm run test -- tests/content-authoring-foundation.test.ts)

