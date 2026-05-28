# Phase 03: first-content-batch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28T08:33:54Z  
**Phase:** 03-first-content-batch  
**Areas discussed:** Batch output definition, Template/storyboard normalization, Narration placeholder strategy, KPI capture contract, Release sequencing and risk handling

---

## Batch Output Definition

| Option | Description | Selected |
|--------|-------------|----------|
| Strict normalized batch contract | 45-60s shorts, single 4-6m stitched long-form, strict all-assets pass policy | ✓ |
| Flexible duration/partial completion options | Allows wider ranges and partial batch success | |
| Long-form optional or de-prioritized | Relaxes phase goal consistency | |

**User's choice:** strict normalized batch contract.  
**Notes:** accepted deterministic naming, per-asset bundles + top-level manifest, long-form dependent on all shorts passing.

---

## Template and Storyboard Normalization

| Option | Description | Selected |
|--------|-------------|----------|
| Uniform scaffold + strict validation | Shared core template with whitelisted extension slots and schema/lint gate | ✓ |
| Loose per-topic templates | More flexibility, less comparability | |
| Fully rigid no-extension templates | Maximum consistency but reduced topic clarity | |

**User's choice:** uniform scaffold with controlled topic extension and schema/lint enforcement before render.  
**Notes:** beat taxonomy standardized with topic-prefixed identifiers.

---

## Narration Placeholder Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Beat-level structured placeholders | One placeholder per beat with required fields and timing envelopes | ✓ |
| Coarser or free-form placeholdering | Lower structure and weaker KPI traceability | |
| Topic-custom ad hoc placeholders | Flexible but weak normalization | |

**User's choice:** beat-level structured placeholders tied to deterministic analytic keys.  
**Notes:** hard timing envelope selected; placeholders must remain machine-verifiable.

---

## KPI Capture Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Strict KPI schema and completeness gate | Retention checkpoints + feedback tags + pacing verdict, all required | ✓ |
| Minimal KPI capture | Retention-only or partial categories | |
| Manual KPI interpretation | Analyst-driven, lower automation | |

**User's choice:** strict schema-driven KPI capture and completeness checks.  
**Notes:** retention checkpoints fixed at 25/50/75/completion; pacing enum fixed to `too_fast|balanced|too_slow`.

---

## Release Sequencing and Risk Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential gated pipeline | TLS -> SSH -> DNS -> long-form with fail-stop and bounded retry | ✓ |
| Parallel/partial progression | Faster but higher risk and weaker gate discipline | |
| End-phase-only escalation | Delays detection and correction | |

**User's choice:** sequential gated release with stop-on-failure, one deterministic retry, then escalate to `--gaps` on blockers/repeated KPI schema failures.  
**Notes:** chosen policy tightly aligns with prior deterministic gate strategy from Phase 02.

---

## Claude's Discretion

No discretionary decisions were needed; user consistently selected explicit options.

## Deferred Ideas

None recorded.
