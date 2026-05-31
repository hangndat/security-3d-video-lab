---
name: cinematic-security-sme-audio
description: Reviews technical accuracy of security claims and guides narration, caption, and sound layers for documentary modules. Use when verifying beat objectives, narration alignment, or audio pipeline handoffs.
---

# Cinematic Security SME + Audio

Codifies the combined **Security SME** and **Audio** crew role. Verify beat-level security claims and ensure narration, captions, and sound layers align with the v1.2 narration pipeline.

## When to Use

- Reviewing module accuracy before orchestrator / publish handoff
- Validating narration placeholders against beat objectives
- Checking caption timing map and narration track alignment
- Documenting sound design notes (guidance only in v1.3 — no real asset library)

## Required Reading

| Document | Path |
|----------|------|
| Accuracy checklist | [docs/security-accuracy-checklist.md](../../docs/security-accuracy-checklist.md) |
| Topic contract | `src/content/topics/<topic>/contract.json` |
| Render handoff | `.cursor/skills/cinematic-creative-technologist/templates/render-handoff.md` |

## Workflow

### Security SME (accuracy)

1. Load contract `storyboardBeats` and `narrationPlaceholders`.
2. Walk [security-accuracy-checklist.md](../../docs/security-accuracy-checklist.md) per-beat table.
3. Cross-check shot list modules support each claim.
4. Record pass/fail in checklist sign-off.

### Audio (narration + captions)

1. Confirm every contract beat has a `narrationPlaceholders` entry (`beatId`, `analyticKey`, `scriptIntent`, `timing`).
2. Generate or verify caption timing map — `generateCaptionTimingMap`.
3. Generate narration track — `generateNarrationTrack` with provider.
4. Run **alignment gate:** `validateNarrationAlignment(captionMap, narrationTrack)` (50ms tolerance).
5. Fill [templates/audio-layer-handoff.md](templates/audio-layer-handoff.md).

## Narration Pipeline

| Step | Module |
|------|--------|
| Caption map | `src/content/composition/generate-caption-timing-map.ts` |
| Narration track | `src/content/narration/generate-narration-track.ts` |
| Alignment | `src/content/narration/validate-narration-alignment.ts` |
| CI provider | `src/content/narration/providers/deterministic-stub-provider.ts` |
| Export bundle | `buildLongFormExportBundle` links caption + narration hashes |

**CI provider:** Deterministic stub — reproducible audio bytes for tests.  
**Production TTS:** ElevenLabs deferred to v1.4 (`PROD-02`). Do not integrate cloud TTS in v1.3 skill workflows.

## Alignment Gate

```typescript
import { validateNarrationAlignment } from "src/content/narration/validate-narration-alignment.js";

const result = validateNarrationAlignment(captionMap, narrationTrack);
if (!result.valid) {
  // Fix result.errors — beatId/analyticKey mismatch or duration tolerance
}
```

Checks:
- Segment count matches caption entries
- `beatId` and `analyticKey` match per index
- Duration within `NARRATION_DURATION_TOLERANCE_MS` (50ms)

## Sound Design Notes (v1.3)

Document optional layers in audio handoff template — **non-blocking**, no bundled assets:

| Layer | Guidance |
|-------|----------|
| Voice | Narration track segments; documentary tone |
| Ambient | Low drone under mechanism beats; style bible low-key mood |
| SFX | Subtle data-flow UI sounds on packet beats; avoid cartoonish |
| Music | Deferred — note intent only |

Real soundtrack assets deferred to v1.4 production content.

## Coordination

| Upstream | Role |
|----------|------|
| Director | Beat sheet — objectives and retention hooks |
| Creative Technologist | Render handoff — export bundle paths |
| Storyboard | SceneSpec + shot list — visual claim support |

| Downstream | Role |
|------------|------|
| Production Orchestrator (Phase 16) | Full chain verification including TLS walkthrough |

## Rules

- **Contract is source of truth** for claims — checklist references `objective` and `scriptIntent` only.
- **Alignment mandatory** — do not sign off if `validateNarrationAlignment` fails.
- **No real TTS in v1.3** — document stub provider path; flag v1.4 for ElevenLabs.
- **Accuracy before audio polish** — fix claim failures before tuning narration timing.

## Canonical References

[reference.md](reference.md)
