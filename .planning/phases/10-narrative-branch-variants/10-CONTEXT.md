# Phase 10: Narrative Branch Variants - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning (inferred from v1.2 requirements + Phase 06 composition patterns)

<domain>
## Phase Boundary

Extend long-form assembly profiles with named branch variants so creators can declare alternate module sequences (e.g., attack-path vs defense-path) and stitch each path deterministically without core renderer changes.

**In scope:** Assembly schema branches, branch-aware validation, transition overrides for fork pairs, branched assembly profile, per-branch replay tests.

**Out of scope:** Interactive runtime branch selection UI, narration pipeline (Phase 11), full nine-topic scene fixtures for v1.2 modules (Phase 12 VER-04).

</domain>

<decisions>
## Implementation Decisions

### Branch Model
- **D-01:** Assembly profiles may declare optional `branches[]` with `id`, `label`, `sequence`, and optional `transitionOverrides[]` per branch.
- **D-02:** When `branches` is present, top-level `sequence` is omitted; `defaultBranchId` selects the primary branch for backward-compatible loaders.
- **D-03:** Branch sequences must preserve manifest rank (subset/skip allowed, no out-of-order topics) — same rule as linear assemblies.

### Fork Narrative (concrete v1.2 example)
- **D-04:** Profile slug `content-depth-branched-v1` declares two branches:
  - `attack-path`: tls → ssh → dns → auth-session → mitm-defense → oauth-jwt-session → api-gateway-waf (skips pki-trust-chain, zero-trust-access)
  - `defense-path`: tls → ssh → dns → auth-session → pki-trust-chain → zero-trust-access → oauth-jwt-session → api-gateway-waf (skips mitm-defense)
- **D-05:** Attack-path requires transition override auth-session → mitm-defense with new preset `auth-session-to-mitm-defense`; defense-path uses existing contract transitions only.

### Stitch & Replay
- **D-06:** `buildLongFormSceneSpec(assemblySlug, scenes, { branchId })` resolves sequence from selected branch before stitch.
- **D-07:** Replay tests run independently per branch using available scene fixtures (six v1.1 fixtures + stub/minimal scenes for v1.2 topics if needed for stitch-only replay).

### Verification
- **D-08:** Extend `verify-narrative-composition.mjs` quick mode to validate branched assembly schema and branch replay tests.
- **D-09:** Linear assemblies (network-foundations, security-expansion, content-depth) remain unchanged and passing.

### Claude's Discretion
- Minimal stub scene specs for v1.2 topics in replay tests (deterministic seeds, short timelines) vs reusing partial content-depth sequence with fixture gaps documented.
- Exact `targetWindowMinutes` for branched profile.

</decisions>

<canonical_refs>
## Canonical References

### Composition (Phase 06)
- `src/content/assemblies/long-form-assembly.schema.json`
- `src/content/composition/validate-long-form-assembly.ts`
- `src/content/composition/build-long-form-scene-spec.ts`
- `src/content/composition/load-long-form-assembly.ts`
- `tests/narrative-composition-replay.test.ts`
- `tests/long-form-assembly.test.ts`
- `scripts/verify-narrative-composition.mjs`

### Upstream (Phase 09)
- `src/content/assemblies/content-depth-long-v1.json` — linear nine-topic baseline
- `src/content/contracts/transition-presets.ts`

</canonical_refs>

<specifics>
## Specific Ideas

- Attack path emphasizes interception → OAuth abuse → API edge exposure.
- Defense path emphasizes PKI trust → zero-trust gating → OAuth validation → WAF shielding.

</specifics>

<deferred>
## Deferred Ideas

- Runtime branch picker / viewer UX → v3 PLAT scope
- Export quality gates per branch video → Phase 12 VER-04

</deferred>

---

*Phase: 10-narrative-branch-variants*
*Context gathered: 2026-05-31 via plan-phase*
