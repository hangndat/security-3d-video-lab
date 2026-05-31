# Audio Layer Handoff

> After [Creative Technologist render handoff](../../cinematic-creative-technologist/templates/render-handoff.md). Align narration to contract beats and pass SME accuracy sign-off.

## Topic / Assembly

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Contract | `src/content/topics/tls/contract.json` |
| Assembly (if long-form) | _e.g. content-depth-long-v1 or single-topic_ |
| Export bundle path | `.artifacts/export/<slug>/export-bundle.json` |

## Narration Placeholders

From contract `narrationPlaceholders[]` — one row per beat:

| beatId | analyticKey | scriptIntent | timing.targetSeconds |
|--------|-------------|--------------|----------------------|
| tls-hook | tls:tls-hook | Show attacker visibility risk. | 7 |
| tls-client-hello-beat | tls:tls-client-hello-beat | Client proposes cryptographic capabilities. | 7 |
| tls-server-hello-beat | tls:tls-server-hello-beat | Server presents certificate and selected ciphers. | 7 |
| tls-finished-beat | tls:tls-finished-beat | Key exchange finalizes a secure channel. | 7 |
| tls-app-data-beat | tls:tls-app-data-beat | Encrypted application data flows. | 7 |

_scriptIntent must match checklist objective for same beatId._

## Caption Timing Map

| Field | Value |
|-------|-------|
| Generator | `generateCaptionTimingMap(assemblySlug, topicScenes)` |
| Artifact path | `.artifacts/export/<slug>/caption-timing-map.json` |
| captionMapHash | _from export bundle_ |
| Entry count | _must equal narrationPlaceholders count_ |

## Narration Track

| Field | Value |
|-------|-------|
| Generator | `generateNarrationTrack(captionMap, provider)` |
| Provider (CI) | `deterministic-stub-provider` |
| Provider (production) | ElevenLabs — **deferred v1.4** |
| Artifact path | `.artifacts/export/<slug>/narration-track.json` |
| narrationTrackHash | _from export bundle_ |

## Sound Design Notes (optional, v1.3)

| Beat id | Layer | Notes |
|---------|-------|-------|
| tls-hook | Ambient + SFX | Low tension drone; subtle packet expose sound |
| tls-finished-beat | SFX | Soft secure-channel chime (describe intent; no asset path) |
| _all_ | Voice | Documentary pacing; match `timing.targetSeconds` |

No bundled sound files in v1.3 — notes for v1.4 production.

## Alignment Validation

```bash
npm run test -- tests/narration-track.test.ts
node scripts/verify-narration-pipeline.mjs --quick
```

Programmatic gate:

```typescript
validateNarrationAlignment(captionMap, narrationTrack); // 50ms tolerance
```

| Check | Status |
|-------|--------|
| Segment count = caption entries | ☐ |
| beatId / analyticKey match | ☐ |
| Duration tolerance | ☐ |
| `result.valid === true` | ☐ |

## Security SME Sign-Off

| Check | Status |
|-------|--------|
| [security-accuracy-checklist.md](../../../../docs/security-accuracy-checklist.md) complete | ☐ |
| No claim failures | ☐ |
| Ready for orchestrator (Phase 16) | ☐ |
