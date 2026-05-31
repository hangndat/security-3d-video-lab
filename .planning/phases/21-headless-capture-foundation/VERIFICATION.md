# Phase 21 Verification

**Phase:** Headless Capture Foundation  
**Requirement:** RENDER-01  
**Verified:** 2026-05-31

## Automated Gates

| Gate | Command | Result |
|------|---------|--------|
| Headless capture tests | `npm run test -- tests/headless-capture.test.ts` | PASS |
| Render composition backends | `npm run test -- tests/render-composition.test.ts` | PASS |
| Phase 21 verify script | `npm run verify:headless-capture -- --quick` | PASS |
| Full suite | `npm test` | PASS (243) |

## Evidence

- `.artifacts/verification/phase21/headless-capture.json` — gateStatus: pass

## Success Criteria

1. Single-frame PNG capture returns non-empty buffer with stable hash — **PASS**
2. `SECURITY_LAB_RENDER_BACKEND` switches between `r3f-headless` and `trace-hash` — **PASS**
3. CI smoke passes without requiring GPU on default PR path — **PASS** (trace-hash env in ci.yml)
