# Phase 09 Research: Advanced Security Topics

**Date:** 2026-05-31
**Phase:** 09-advanced-security-topics

## Summary

Phase 09 is a mechanical extension of the v1.1 content-authoring foundation (Phase 05). The validation engine, scaffold CLI, manifest lock, and long-form assembly patterns are proven — the work is enum/preset extension plus authoring three new contracts and one nine-topic assembly profile.

## Technical Findings

### Gatekeeper: schema topic enum

`topic-contract.schema.json` hardcodes allowed `topic` and `transitionToNext.toTopic` values. Scaffold output alone will fail CI until enums and `types.ts` TopicId unions are extended.

### Transition chain gap

`mitm-defense` is currently terminal (no `transitionToNext`). Phase 09 must add transition to `zero-trust-access` and three new presets for the v1.2 chain tail.

### Manifest-driven loading

`loadTopicContracts()` reads manifest order and requires every manifest topic to have a contract file. Registration is: extend schema/types → append manifest → add presets → scaffold/author contracts → validate assembly sequence.

### Assembly validation

`validateLongFormAssemblyProfile()` checks manifest rank preservation and adjacent-pair transition coherence. New profile `content-depth-long-v1` must list all nine topics in manifest order with valid preset pairs on each contract.

### Test touchpoints

| File | Update needed |
|------|---------------|
| `types.ts` | Extend topic ID constants |
| `content-contracts.test.ts` | Preset chain, enum coverage |
| `long-form-assembly.test.ts` | New assembly profile validation |
| `content-authoring-foundation.test.ts` | Draft module lists |
| `expansion-module-e2e.test.ts` | Module packet loops for new topics |
| `verify-content-authoring.mjs` | Draft module ID lists |

### Recommended plan split

Mirror Phase 05: **09-01** engine extension (wave 1), **09-02** authoring + assembly integration (wave 2, depends on 09-01).

## Risks

| Risk | Mitigation |
|------|------------|
| Forgetting schema enum update | 09-01 task explicitly updates both enum locations in schema |
| Broken transition chain | 09-01 adds presets + mitm-defense link before 09-02 content |
| Assembly sequence drift | Validate `content-depth-long-v1` in long-form-assembly tests |

## Validation Architecture

| Truth | Test command |
|-------|--------------|
| Schema accepts 9 topics | `npm run test -- tests/content-contracts.test.ts` |
| Preset chain complete | `npm run test -- tests/long-form-assembly.test.ts` |
| Three new modules validate | `npm run test -- tests/content-authoring-foundation.test.ts` |
| Assembly stitches 9 topics | `npm run test -- tests/long-form-assembly.test.ts --testNamePattern=content-depth` |
| Module packets complete | `npm run test -- tests/expansion-module-e2e.test.ts` |
