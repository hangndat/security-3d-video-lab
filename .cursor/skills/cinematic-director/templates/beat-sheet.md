# Beat Sheet Handoff

> Copy this template for each module or assembly planning session. Beat ids must match `storyboardBeats` in the topic `contract.json` — no freeform labels.

## Topic / Assembly

| Field | Value |
|-------|-------|
| Topic slug | _e.g. `tls`_ |
| Assembly | _e.g. `content-depth-long-v1` or single-topic short_ |
| Contract | `src/content/topics/<topic>/contract.json` |
| Duration budget | _from contract `durationBudget.targetSeconds`_ |

## Branch

| Mode | Value |
|------|-------|
| Branch | `linear` \| `attack-path` \| `defense-path` |
| Default branch (if branched) | `defense-path` |

### Branch sequence (if branched)

List topic order from `content-depth-branched-v1.json` → `branches[].sequence`.

## Beat Table

Derived from contract `storyboardBeats`. Frame ranges must match contract exactly.

| Beat id | Frames | Objective | Narration intent | Retention hook |
|---------|--------|-----------|------------------|----------------|
| tls-hook | 0–30 | Show attacker visibility risk. | Show attacker visibility risk. | **p25** — early threat hook |
| tls-client-hello-beat | 12–48 | Client proposes cryptographic capabilities. | Client proposes cryptographic capabilities. | p50 |
| tls-server-hello-beat | 54–98 | Server presents certificate and selected ciphers. | Server presents certificate and selected ciphers. | p50 |
| tls-finished-beat | 110–168 | Key exchange finalizes a secure channel. | Key exchange finalizes a secure channel. | p75 |
| tls-app-data-beat | 170–236 | Encrypted application data flows. | Encrypted application data flows. | completion |

_Add or remove rows per topic contract. Do not rename beat ids._

## Transition Rationale (branched assemblies only)

| From | To | Preset | Rationale (from assembly) |
|------|-----|--------|---------------------------|
| auth-session | mitm-defense | auth-session-to-mitm-defense | Attack path skips PKI trust chain and jumps directly to interception narrative. |

_Copy from `transitionOverrides[]` in `content-depth-branched-v1.json`. Omit section for linear single-topic modules._

## Pacing Verdict Target

| Field | Value |
|-------|-------|
| Target verdict | `balanced` |
| Feedback tags | _optional, e.g. `clear-pacing`_ |
| Notes | _deviations from documentary-standard preset_ |

## Handoff Checklist

- [ ] All beat ids exist in contract `storyboardBeats`
- [ ] p25 / p50 / p75 / completion hooks assigned
- [ ] Branch rationale cited (if branched)
- [ ] Ready for storyboard skill (Phase 14)
