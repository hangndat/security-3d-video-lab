# Phase 09: Advanced Security Topics - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning (inferred from v1.2 requirements + v1.1 Phase 05 patterns)

<domain>
## Phase Boundary

Extend the v1.1 data-first content pipeline with three advanced security modules and integrate them into the nine-topic manifest and a new long-form assembly — without core renderer changes.

**In scope:** `zero-trust-access`, `oauth-jwt-session`, `api-gateway-waf` topic contracts; transition preset chain extension; manifest and assembly updates; CI validation gates.

**Out of scope:** Narrative branch variants (Phase 10), narration/TTS pipeline (Phase 11), platform UI (PLAT-01/02), scene-spec fixtures and export E2E for new topics (deferred to Phase 12 VER-04 unless trivial).

</domain>

<decisions>
## Implementation Decisions

### Topic Selection
- **D-01:** Three new modules are `zero-trust-access`, `oauth-jwt-session`, and `api-gateway-waf` — aligned with PROJECT.md v1.2 content-first scope and docs/roadmap infrastructure themes.
- **D-02:** Topic chain appends after existing v1.1 modules: `… → mitm-defense → zero-trust-access → oauth-jwt-session → api-gateway-waf`.
- **D-03:** `api-gateway-waf` is the terminal module in the v1.2 chain (no `transitionToNext`).

### Contract & Validation (inherit v1.1)
- **D-04:** Reuse Phase 05 one-file-per-topic contracts, manifest lock, preset catalog, and collect-all validation — extend enums/unions only, no schema version bump.
- **D-05:** Each new module uses scaffold CLI as starting point, then expands to 5+ beats matching auth-session/pki-trust-chain depth.
- **D-06:** Beat-level narration placeholder coverage is mandatory for every new module (CONT-06).

### Assembly Integration
- **D-07:** New long-form profile slug is `content-depth-long-v1` with all nine manifest topics in order.
- **D-08:** `mitm-defense` gains `transitionToNext` to `zero-trust-access` (currently terminal in v1.1).
- **D-09:** Three new transition presets: `mitm-defense-to-zero-trust-access`, `zero-trust-access-to-oauth-jwt-session`, `oauth-jwt-session-to-api-gateway-waf`.

### Verification
- **D-10:** Phase gate reuses existing content-authoring CI suites; extend draft module lists and assembly tests rather than new verify orchestrator.
- **D-11:** Contract-only validation suffices for Phase 09 close; full export E2E for v1.2 topics is Phase 12 scope.

### Claude's Discretion
- Exact beat objectives and narration scriptIntent wording per topic.
- Whether to extend `security-expansion-long-v1` vs add `content-depth-long-v1` (prefer new profile per D-07).
- Minor duration window tuning within schema hard limits.

</decisions>

<canonical_refs>
## Canonical References

### Content authoring (Phase 05)
- `src/content/contracts/topic-contract.schema.json` — topic enum gatekeeper
- `src/content/contracts/transition-presets.ts` — preset whitelist + pair validation
- `src/content/contracts/types.ts` — TopicId unions
- `src/content/topics/manifest.json` — canonical topic order
- `scripts/scaffold-topic-contract.mjs` — new topic scaffolding

### Reference module templates
- `src/content/topics/auth-session/contract.json` — beat depth + transition pattern
- `src/content/topics/mitm-defense/contract.json` — currently terminal; needs transition update

### Assembly (Phase 06)
- `src/content/assemblies/security-expansion-long-v1.json` — six-topic assembly precedent
- `src/content/composition/validate-long-form-assembly.ts` — sequence + transition chain validation

### Tests & CI
- `tests/content-contracts.test.ts`
- `tests/content-authoring-foundation.test.ts`
- `tests/long-form-assembly.test.ts`
- `tests/expansion-module-e2e.test.ts`
- `.github/workflows/ci.yml`

</canonical_refs>

<specifics>
## Specific Ideas

- **zero-trust-access:** Identity-aware perimeter, device posture, policy engine granting least-privilege access.
- **oauth-jwt-session:** Authorization code flow, token issuance, JWT claims, refresh/rotation boundaries.
- **api-gateway-waf:** Edge routing, rate limiting, WAF rule inspection, origin shielding before app tier.

</specifics>

<deferred>
## Deferred Ideas

- Scene spec fixtures and render export E2E for v1.2 topics → Phase 12 (VER-04)
- Narrative branch assemblies → Phase 10
- Narration audio pipeline → Phase 11

</deferred>

---

*Phase: 09-advanced-security-topics*
*Context gathered: 2026-05-31 via plan-phase (no discuss-phase)*
