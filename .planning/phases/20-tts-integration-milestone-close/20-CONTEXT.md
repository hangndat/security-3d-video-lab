# Phase 20: TTS Integration & Milestone Close — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP v1.4 Phase 20 + Phase 19 TLS production + v1.2 narration pipeline

<domain>
## Phase Boundary

Close v1.4 Production Content milestone:

1. **PROD-02** — ElevenLabs TTS provider with env-gated fallback to deterministic dummy audio when `ELEVENLABS_API_KEY` is absent.
2. **VER-07** — v1.4 milestone audit, traceability close, governance verification (mirror v1.3 Phase 16-02 pattern).

Integrates narration into TLS production artifact bundle from Phase 19. Does **not** add new topics, platform UI, or burned-in subtitles.

</domain>

<decisions>
## Implementation Decisions

### Provider selection (PROD-02) — user policy
- **`resolveNarrationProvider()`** reads `process.env.ELEVENLABS_API_KEY`.
- **No API key** → `deterministic-stub` (dummy silent WAV, existing Phase 11 provider) — CI and local keyless runs.
- **API key present** → `elevenlabs` provider calls ElevenLabs TTS API; duration alignment still validated via `validateNarrationAlignment`.
- Never fail export when key missing; never call ElevenLabs network in CI (no key in CI env).

### ElevenLabs provider shape
- New file: `src/content/narration/providers/elevenlabs-provider.ts`
- Env: `ELEVENLABS_API_KEY` (required for live), optional `ELEVENLABS_VOICE_ID` (default voice from ADR/skill docs)
- `synthesizeSegment` uses `scriptIntent` text from caption entry; returns WAV bytes + contentHash
- Tests mock `fetch` for ElevenLabs path; stub path unchanged and deterministic

### TLS production bundle extension
- Extend `generateTlsProductionArtifacts` to write `narration-track.json` + WAV segments via resolved provider
- Update `audio-layer-handoff.md` snapshot: provider id reflects resolved provider
- `security-signoff.json` includes `narrationProviderId` and alignment status

### Verification (PROD-02)
- New `scripts/verify-tts-integration.mjs` — stub path always; optional `--live` when key present
- Extend `tests/narration-track.test.ts` or new `tests/tts-provider.test.ts` for resolver + mocked ElevenLabs
- TLS production test: alignment passes with stub provider (CI default)

### Milestone close (VER-07)
- Add `V14_PHASE_EVIDENCE` (phases 17–20) to `milestone-audit.ts`
- Create `scripts/audit-milestone-v1.4.mjs` (mirror v1.3)
- Archive v1.4: `milestones/v1.4-ROADMAP.md`, `v1.4-MILESTONE-AUDIT.md`, `v1.4-REQUIREMENTS.md`
- Update `MILESTONES.md`, `PROJECT.md`, `STATE.md` (milestone complete)
- `validate-requirement-traceability.mjs --milestone-close` with zero Pending v1.4 reqs

### Claude's Discretion
- Exact ElevenLabs API endpoint/model version
- Whether to add `npm run verify:tts-integration` vs extend `verify:narration-pipeline`
- Phase 17–18 evidence JSON backfill strategy in audit script

</decisions>

<canonical_refs>
## Narration pipeline (v1.2)

| Artifact | Path |
|----------|------|
| Provider interface | `src/content/narration/providers/types.ts` |
| Dummy/stub provider | `src/content/narration/providers/deterministic-stub-provider.ts` |
| Track generator | `src/content/narration/generate-narration-track.ts` |
| Alignment validator | `src/content/narration/validate-narration-alignment.ts` |

## Phase 19 production

| Artifact | Path |
|----------|------|
| TLS artifacts | `src/render/export/generate-tls-production-artifacts.ts` |
| Production caption map | `buildTlsProductionCaptionMap` in tls-production-rubric.ts |
| Verify gate | `scripts/verify-tls-production.mjs` |
| Evidence JSON | `.artifacts/verification/phase19/tls-production.json` |

## Milestone close pattern (v1.3)

| Artifact | Path |
|----------|------|
| Audit module | `src/verification/milestone-audit.ts` |
| v1.3 audit script | `scripts/audit-milestone-v1.3.mjs` |
| Traceability | `scripts/validate-requirement-traceability.mjs` |
| Governance tests | `tests/milestone-governance.test.ts` |

</canonical_refs>

<deferred>
## Deferred Ideas

- Optional `--live` ElevenLabs integration test in CI (secrets-gated workflow only)
- Piper/local TTS provider
- Burned-in subtitles from caption maps

</deferred>

---
*Phase: 20-tts-integration-milestone-close*
*Context gathered: 2026-05-31*
