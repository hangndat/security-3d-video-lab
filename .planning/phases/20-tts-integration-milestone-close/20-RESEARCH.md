# Phase 20 Research: TTS Integration & Milestone Close

**Researched:** 2026-05-31
**Phase:** 20-tts-integration-milestone-close
**Requirements:** PROD-02, VER-07

## Narration Provider Gap

| Layer | Current state | Phase 20 target |
|-------|---------------|-----------------|
| Interface | `NarrationProvider` exists | Unchanged |
| CI provider | `deterministic-stub` only | Default when no API key |
| Cloud provider | Deferred since Phase 11 | `elevenlabs` when key set |
| Provider selection | Hardcoded stub in callers | `resolveNarrationProvider()` |
| TLS production bundle | Caption map only; stub in rubric | Full narration artifacts via resolver |

## Provider Resolver Architecture

```
resolveNarrationProvider(env = process.env)
  → if ELEVENLABS_API_KEY → createElevenLabsProvider({ apiKey, voiceId })
  → else → createDeterministicStubProvider()

generateNarrationTrack(captionMap, resolveNarrationProvider())
  → existing alignment validation unchanged
```

**CI guarantee:** No `ELEVENLABS_API_KEY` in GitHub Actions → always stub → deterministic hashes.

**Local with key:** Real WAV from ElevenLabs; alignment tolerance (50ms) may require duration padding/truncation helper if API duration drifts.

## ElevenLabs Integration Notes

- Endpoint: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` (plan execution picks stable model)
- Input text: `CaptionTimingEntry.scriptIntent`
- Output: audio/mpeg or convert to WAV for pipeline consistency (prefer WAV to match stub artifact layout)
- Errors: throw with clear message; do not fall back to stub mid-run if key was explicitly set (fail loud for production runs)

## TLS Production Bundle Extension

```
generateTlsProductionArtifacts(repoRoot)
  + captionMap (existing)
  + provider = resolveNarrationProvider()
  + track = generateNarrationTrack(captionMap, provider)
  + writeNarrationArtifacts(track, captionMap, provider, repoRoot)
  + production-manifest.json includes narrationTrackPath, providerId
```

## Milestone Close Architecture (VER-07)

```
V14_PHASE_EVIDENCE = [
  { phase: "17", jsonPath: ".artifacts/verification/phase17/viz-modules.json", ... },
  { phase: "18", jsonPath: ".artifacts/verification/phase18/viz-modules.json", ... },
  { phase: "19", jsonPath: ".artifacts/verification/phase19/tls-production.json", ... },
  { phase: "20", jsonPath: ".artifacts/verification/phase20/milestone-close.json", ... }
]

audit-milestone-v1.4.mjs → buildV14MilestoneAuditReport → v1.4-MILESTONE-AUDIT.md
```

Phase 17–18 evidence: backfill via `scripts/verify-v14-viz-modules.mjs --quick` writing JSON gate results (retroactive, no re-execute phases 17–18).

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| CI calls ElevenLabs | Resolver defaults stub; tests unset API key |
| Non-deterministic CI with stub | Stub hashes already stable; regression tests |
| Alignment fails with real TTS | Duration normalize helper; stub tests remain primary CI gate |
| Milestone close with Pending reqs | Mark PROD-02/VER-07 Complete only after verify passes |
| Phase 17–18 missing audit JSON | Backfill verify script in 20-02 before audit |

## Plan Split

| Plan | Scope |
|------|-------|
| 20-01 | ElevenLabs provider, resolver, TLS bundle narration, verify-tts, PROD-02 tests |
| 20-02 | V14 audit, milestone archive, governance, VER-07 close |

---
*Phase: 20-tts-integration-milestone-close*
