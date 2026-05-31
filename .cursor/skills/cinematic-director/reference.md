# Director Reference — Canonical Repo Paths

## Topic Contracts (manifest order)

| Topic | Contract path |
|-------|---------------|
| tls | `src/content/topics/tls/contract.json` |
| ssh | `src/content/topics/ssh/contract.json` |
| dns | `src/content/topics/dns/contract.json` |
| auth-session | `src/content/topics/auth-session/contract.json` |
| pki-trust-chain | `src/content/topics/pki-trust-chain/contract.json` |
| mitm-defense | `src/content/topics/mitm-defense/contract.json` |
| zero-trust-access | `src/content/topics/zero-trust-access/contract.json` |
| oauth-jwt-session | `src/content/topics/oauth-jwt-session/contract.json` |
| api-gateway-waf | `src/content/topics/api-gateway-waf/contract.json` |

Manifest lock: `src/content/topics/manifest.json`

## Assemblies

| Assembly | Path |
|----------|------|
| Linear long-form | `src/content/assemblies/content-depth-long-v1.json` |
| Branched long-form | `src/content/assemblies/content-depth-branched-v1.json` |

## Composition & KPI

| Artifact | Path |
|----------|------|
| Long-form stitch | `src/content/composition/build-long-form-scene-spec.ts` |
| Module KPI status | `src/verification/module-kpi.ts` |
| KPI acceptance tests | `tests/batch-kpi-acceptance.test.ts` |

## Beat Sheet Template

`templates/beat-sheet.md` — handoff to Phase 14 storyboard skill.
