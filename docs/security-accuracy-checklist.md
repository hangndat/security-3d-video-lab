# Security Accuracy Checklist

Canonical review gate for **Security SME** review of cinematic security modules. Map contract beat objectives to verifiable claims — no parallel claim schema.

**Inputs:** `src/content/topics/<topic>/contract.json` — `storyboardBeats[].objective`, `narrationPlaceholders[].scriptIntent`  
**Visual support:** shot list module ids (`docs/r3f-module-catalog.md`), SceneSpec handoff

---

## Claim Verification Process

1. **Load contract** — Read `storyboardBeats` and `narrationPlaceholders` for the topic.
2. **Extract claim** — Each beat `objective` is the canonical factual claim for that beat.
3. **Cross-check narration** — Matching `scriptIntent` for same `beatId` must not contradict the objective.
4. **Cross-check visual** — Shot list modules and SceneSpec timeline must support the claim (no misleading animation).
5. **Mark pass/fail** — Use per-beat table below; document failures in sign-off.
6. **No invented facts** — Do not add cipher names, protocol steps, or features not implied by the contract.

---

## Per-Beat Checklist Table (TLS worked example)

Contract: `src/content/topics/tls/contract.json`

| Beat id | Objective (claim) | scriptIntent match | Visual/module support | Pass criteria |
|---------|-------------------|--------------------|-----------------------|---------------|
| tls-hook | Show attacker visibility risk. | Same intent | `viz-packet-threat`, exposed path | Plaintext/credential risk shown before encryption |
| tls-client-hello-beat | Client proposes cryptographic capabilities. | Same intent | `viz-packet-flow` | Client-initiated handshake step; no cert yet |
| tls-server-hello-beat | Server presents certificate and selected ciphers. | Same intent | `viz-cert-single` | Certificate presentation; no claim of trust without validation context |
| tls-finished-beat | Key exchange finalizes a secure channel. | Same intent | `viz-tunnel-secure` | Encrypted channel established after handshake |
| tls-app-data-beat | Encrypted application data flows. | Same intent | `viz-packet-encrypted` | App data only after secure channel |

**Pass:** objective ↔ scriptIntent aligned; visual modules appropriate; no oversimplification that misleads.  
**Fail:** contradiction, wrong order, missing step, or invented mechanism.

For other topics, copy table structure using that topic's contract beat ids.

---

## Common Failure Modes

| Failure | Example | Fix |
|---------|---------|-----|
| Oversimplification | "TLS is always secure" without cert context | Qualify with certificate/trust chain beats |
| Wrong protocol order | App data before finished beat | Align timeline cues to contract frame order |
| Invented features | Quantum-resistant cipher not in contract | Remove; stick to contract objectives |
| Narration drift | scriptIntent differs from objective | Rewrite script or update contract (separate change) |
| Misleading visual | Trust green on unvalidated cert | Use threat/neutral tokens until validation beat |
| Skipped beat | Narration segment missing for beat id | Regenerate caption map / narration track |

---

## Sign-Off

| Field | Value |
|-------|-------|
| Topic | _e.g. tls_ |
| Contract path | `src/content/topics/<topic>/contract.json` |
| Reviewer role | Security SME |
| Beats reviewed | _count / total_ |
| Failures | _list beat ids or "none"_ |
| Narration alignment | `validateNarrationAlignment` pass (see Audio handoff) |
| Approved for orchestrator | ☐ Yes ☐ No — blockers: _ |

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-31 | Initial checklist (Phase 15 / CREW-06) |
