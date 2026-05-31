# Security Accuracy Checklist

Canonical review gate for **Security SME** review of cinematic security modules. Map contract beat objectives to verifiable claims — no parallel claim schema.

**Inputs:** `src/content/topics/<topic>/contract.json` — `storyboardBeats[].objective`, `narrationPlaceholders[].scriptIntent`  
**Visual support:** shot list (`KICH-BAN.md` for TLS), `docs/r3f-module-catalog.md`, SceneSpec handoff

---

## Claim Verification Process

1. **Load contract** — Read `storyboardBeats` and `narrationPlaceholders` for the topic.
2. **Extract claim** — Each beat `objective` is the canonical factual claim for that beat.
3. **Cross-check narration** — Matching `scriptIntent` for same `beatId` must not contradict the objective.
4. **Cross-check visual** — SceneSpec routes, actors, timeline `messageType`, and modules must support the claim (no misleading animation).
5. **Mark pass/fail** — Use per-beat table below; document failures in sign-off.
6. **No invented facts** — Do not add cipher names, protocol steps, or features not implied by the contract.

---

## Per-Beat Checklist Table (TLS worked example)

Contract: `src/content/topics/tls/contract.json`  
SceneSpec: `src/fixtures/tls-production-scene-spec.json`  
Shot list: `src/content/topics/tls/KICH-BAN.md`

| Beat id | Objective (claim) | scriptIntent match | Visual / spatial support | Pass criteria |
|---------|-------------------|--------------------|--------------------------|---------------|
| tls-hook | Unencrypted traffic on untrusted networks can be passively observed before TLS protects the session. | Aligned (cleartext/sniff) | `viz-packet-threat`; cleartext route **above** link; `actor-attacker` visible | Sniffer + red packet over wire; no tunnel yet |
| tls-client-hello-beat | Client sends ClientHello with supported versions and cipher suites; no application secrets yet. | Aligned | `viz-packet-flow`, `viz-tunnel-handshake`; L→R on link; label `ClientHello` | Sniffer hidden; handshake on wire, no cert |
| tls-server-hello-beat | ServerHello and certificate chain presented; trust requires client-side validation. | Aligned (cert, no implied trust) | `viz-cert-single` at origin; R→L; `ServerHello` label | Cert shown; not painted as “already trusted” |
| tls-finished-beat | Key exchange and Finished establish session keys and confidential record layer. | Aligned (AEAD) | `viz-tunnel-secure`; center `Finished` exchange | Solid tunnel; keys implied, not app payload yet |
| tls-app-data-beat | Application payloads in encrypted TLS record layer; outsiders cannot read content. | Aligned | `viz-packet-encrypted` **below** wire in tunnel; `ApplicationData` | Cyan packet inside secure channel only |

**Pass:** objective ↔ scriptIntent aligned; spatial story matches modules; no oversimplification that misleads.  
**Fail:** contradiction, wrong order, sniffer during encrypted beats, cert-chain misfire, or invented mechanism.

Automated guard: `npm run test -- tests/tls-visual-story.test.ts`

---

## Common Failure Modes

| Failure | Example | Fix |
|---------|---------|-----|
| Oversimplification | "TLS is always secure" without cert context | Qualify with certificate/trust chain beats |
| Wrong protocol order | App data before finished beat | Align timeline cues to contract frame order |
| Invented features | Quantum-resistant cipher not in contract | Remove; stick to contract objectives |
| Narration drift | scriptIntent differs from objective | Rewrite script or update contract |
| Misleading visual | Trust green on unvalidated cert | Cert without trust claim; validation is client-side |
| Spatial mismatch | Handshake packet above link like cleartext | Routes: hook high, hello on wire, app data in tunnel |
| Wrong cert module | `viz-cert-chain` because of 3 actors including sniffer | Use PKI label keywords only (`resolveCertModuleId`) |
| Sniffer persists | Attacker visible during ApplicationData | `resolveVisibleActors` — sniffer only through hook end frame |
| Skipped beat | Narration segment missing for beat id | Regenerate caption map / narration track |

---

## Sign-Off

| Field | Value |
|-------|-------|
| Topic | _e.g. tls_ |
| Contract path | `src/content/topics/<topic>/contract.json` |
| SceneSpec path | `src/fixtures/tls-production-scene-spec.json` (TLS publish) |
| Reviewer role | Security SME |
| Beats reviewed | _count / total_ |
| Failures | _list beat ids or "none"_ |
| Narration alignment | `validateNarrationAlignment` pass (when narration enabled) |
| Visual story tests | `tests/tls-visual-story.test.ts` pass |
| Approved for orchestrator | ☐ Yes ☐ No — blockers: _ |

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-31 | Initial checklist (Phase 15 / CREW-06) |
| 1.1.0 | 2026-05-31 | TLS spatial visual criteria, KICH-BAN cross-ref, failure modes |
