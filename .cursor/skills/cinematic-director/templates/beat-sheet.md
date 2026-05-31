# Beat Sheet Handoff

> Copy this template for each module or assembly planning session. Beat ids must match `storyboardBeats` in the topic `contract.json` — no freeform labels.

## Topic / Assembly

| Field | Value |
|-------|-------|
| Topic slug | `tls` |
| Assembly | single-topic publish (~20s) |
| Contract | `src/content/topics/tls/contract.json` |
| Kịch bản | `src/content/topics/tls/KICH-BAN.md` |
| Duration budget | 20s (`durationBudget.targetSeconds`) |
| Audience | software engineer |

## Branch

| Mode | Value |
|------|-------|
| Branch | `linear` |
| Default branch (if branched) | n/a |

## Beat Table (TLS production)

Derived from contract `storyboardBeats`. Frame ranges must match contract and `tls-production-scene-spec.json`.

| Beat id | Frames | Objective (summary) | Retention hook |
|---------|--------|---------------------|----------------|
| tls-hook | 0–89 | Cleartext observable on untrusted path before TLS | **p25** |
| tls-client-hello-beat | 90–209 | ClientHello; versions/suites; no app secrets | p50 |
| tls-server-hello-beat | 210–329 | ServerHello + cert; client validates trust | p50 |
| tls-finished-beat | 330–449 | Session keys + AEAD record layer ready | **p75** |
| tls-app-data-beat | 450–599 | Application data inside encrypted tunnel | completion |

Narration `scriptIntent` per beat: see contract `narrationPlaceholders` and KICH-BAN burn-in table.

## Spatial handoff (Storyboard)

| Beat id | Visual beat (one line) |
|---------|------------------------|
| tls-hook | Cleartext above link; sniffer visible |
| tls-client-hello-beat | ClientHello L→R on link; wireframe tunnel |
| tls-server-hello-beat | ServerHello R→L; cert at origin |
| tls-finished-beat | Finished at center; solid tunnel |
| tls-app-data-beat | ApplicationData inside tunnel (y below wire) |

## Pacing Verdict Target

| Field | Value |
|-------|-------|
| Target verdict | `balanced` |
| Feedback tags | _optional_ |
| Notes | One packet per beat; sniffer exits after hook |

## Handoff Checklist

- [ ] All beat ids exist in contract `storyboardBeats`
- [ ] p25 / p50 / p75 / completion hooks assigned
- [ ] Frame ranges match publish SceneSpec timeline
- [ ] Ready for storyboard skill → `tls-production-scene-spec.json`
