# Phase 15: Render & Security Audio Skills — Context

**Gathered:** 2026-05-31
**Status:** Ready for planning
**Source:** ROADMAP Phase 15 + Phase 14 SceneSpec handoff chain

<domain>
## Phase Boundary

Codify the final two **domain** crew roles (before orchestrator in Phase 16):

1. **Creative Technologist** — Remotion composition, engine wiring, render profiles, export bundle linkage
2. **Security SME + Audio** — technical accuracy checklist + voice/sound layer guidance tied to narration pipeline

Delivers skills + `docs/security-accuracy-checklist.md`. Does **not** integrate real ElevenLabs TTS or publish-ready production renders (v1.4).

</domain>

<decisions>
## Implementation Decisions

### Creative Technologist (CREW-05)
- Input: validated SceneSpec from Storyboard skill + long-form stitch when applicable.
- Documents render path: `deriveRenderFrameState` → demo MP4 → export quality gates → export bundle (caption + narration hashes).
- Render profiles: CI short export (320×180, ~30 frames) vs full module export; reference `DEFAULT_EXPORT_QUALITY_POLICY`.
- Export artifacts under `.artifacts/export/`; bundle via `buildLongFormExportBundle` / `writeExportBundleArtifacts`.
- Verify gates: `verify:content-depth`, `verify:narration-pipeline`, `assertExportQuality`.

### Security SME + Audio (CREW-06)
- Single combined skill (matches ROADMAP "Security SME + Audio skill").
- Accuracy checklist maps contract `storyboardBeats[].objective` and `narrationPlaceholders[].scriptIntent` to verifiable security claims per topic.
- Audio layers: narration track (stub provider in CI), caption timing map, optional sound-design notes (deferred real assets).
- Alignment gate: `validateNarrationAlignment` with 50ms tolerance.
- No new narration schema — use existing `narration-track.schema.json` and caption map.

### Skill conventions
- `.cursor/skills/cinematic-creative-technologist/`
- `.cursor/skills/cinematic-security-sme-audio/`
- Extend `tests/cinematic-crew-skills.test.ts` for CREW-05/06 (CREW-01–04 pattern).

### Claude's Discretion
- Whether render handoff is template vs embedded in SKILL.md
- Checklist granularity (per-topic vs generic with TLS worked example)
- Combined vs split SME/Audio templates (ROADMAP implies one skill)

</decisions>

<canonical_refs>
## Canonical References

### Phase 14 upstream
- `.cursor/skills/cinematic-storyboard-artist/templates/scenespec-handoff.md`
- Validated SceneSpec + `src/content/composition/build-long-form-scene-spec.ts`

### Render & export
- `src/render/remotion/render-composition.tsx`
- `src/render/export/build-long-form-export-bundle.ts`
- `src/render/export/fingerprint.ts`
- `src/verification/export-quality.ts`

### Narration & audio
- `src/content/narration/generate-narration-track.ts`
- `src/content/narration/validate-narration-alignment.ts`
- `src/content/composition/generate-caption-timing-map.ts`
- `src/content/narration/providers/deterministic-stub-provider.ts`
- `scripts/verify-narration-pipeline.mjs`

### Contracts
- `src/content/topics/*/contract.json` — objectives + narrationPlaceholders

</canonical_refs>

<deferred>
## Deferred Ideas

- ElevenLabs / real TTS (PROD-02, v1.4)
- Production orchestrator (Phase 16 / CREW-07)
- TLS full-chain walkthrough doc (Phase 16 / VER-06)
- Cinematic sound asset library

</deferred>

---

*Phase: 15-render-security-audio-skills*
*Context gathered: 2026-05-31*
