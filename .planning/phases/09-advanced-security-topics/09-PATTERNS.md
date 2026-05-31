# Phase 09 Pattern Map

**Generated:** 2026-05-31

## Closest Analogs

| New artifact | Closest analog | Pattern to copy |
|--------------|----------------|-----------------|
| Topic contract | `src/content/topics/auth-session/contract.json` | 5 beats, narration 1:1, pacingPresetId, transitionToNext |
| Schema enum extension | Phase 05 draft topics in schema | Append to `topic` and `toTopic` enums |
| Transition preset | `pki-trust-chain-to-mitm-defense` in `transition-presets.ts` | `allowedPairs: [{ fromTopic, toTopic }]` |
| Manifest update | v1.1 append of auth-session/pki/mitm | Append 3 slugs to `order` array |
| Long-form assembly | `security-expansion-long-v1.json` | `sequence` mirrors manifest order |
| Plan structure | `05-01-PLAN.md` + `05-02-PLAN.md` | Wave 1 engine, wave 2 content + CI |

## File Modification Map

### Wave 1 (09-01)
- `src/content/contracts/topic-contract.schema.json`
- `src/content/contracts/types.ts`
- `src/content/contracts/transition-presets.ts`
- `src/content/topics/mitm-defense/contract.json`
- `tests/content-contracts.test.ts`
- `tests/long-form-assembly.test.ts`

### Wave 2 (09-02)
- `src/content/topics/zero-trust-access/contract.json` (new)
- `src/content/topics/oauth-jwt-session/contract.json` (new)
- `src/content/topics/api-gateway-waf/contract.json` (new)
- `src/content/topics/manifest.json`
- `src/content/assemblies/content-depth-long-v1.json` (new)
- `tests/content-authoring-foundation.test.ts`
- `tests/expansion-module-e2e.test.ts`
- `src/verification/module-packet.ts`
- `scripts/verify-content-authoring.mjs`
