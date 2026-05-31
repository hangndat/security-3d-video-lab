# Phase 11: Narration Pipeline - Context

**Gathered:** 2026-05-31
**Status:** Ready for planning (inferred from v1.2 VOIC requirements + Phase 06 caption maps)

<domain>
## Phase Boundary

Build a narration pipeline that turns caption timing maps into beat-aligned audio segments and attaches synchronized narration track metadata to long-form export bundles.

**In scope:** Narration track schema, deterministic stub provider, caption→narration generator, duration alignment validation, export bundle linkage, CI verification.

**Out of scope:** ElevenLabs/cloud TTS integration (provider hook only), burned-in subtitles, soundtrack mixing, full v1.2 module export E2E (Phase 12 VER-04), platform UI.

</domain>

<decisions>
## Implementation Decisions

### Pipeline Input/Output
- **D-01:** Narration generation consumes `CaptionTimingMap` entries (one segment per beat) — no duplicate timing logic.
- **D-02:** Output artifact is `NarrationTrackManifest` JSON (schema version `1.0.0`) with per-segment timing, content hash, and audio artifact path.
- **D-03:** Stub provider writes deterministic silent WAV segments sized to caption window duration (VOIC-01 without external API).

### Provider Strategy (ADR-001 aligned)
- **D-04:** `NarrationProvider` interface with pluggable providers; CI uses `deterministic-stub` only.
- **D-05:** Cloud provider (`elevenlabs`) deferred — register provider ID enum slot but no network calls in phase 11.

### Duration Alignment (VOIC-01)
- **D-06:** Target duration = `endSeconds - startSeconds` from caption entry (per beat).
- **D-07:** Alignment tolerance: 50ms max delta between target and actual segment duration.
- **D-08:** Validator fails closed when any segment exceeds tolerance or misses caption beat coverage.

### Branch Support
- **D-09:** Extend `generateCaptionTimingMap(assemblySlug, scenes, { branchId })` for branched assemblies (Phase 10 gap).
- **D-10:** Narration artifacts namespaced as `<assemblySlug>[:<branchId>]` matching stitch sceneId convention.

### Export Bundle (VOIC-02)
- **D-11:** `buildLongFormExportBundle()` produces deterministic manifest + caption map ref + narration track manifest.
- **D-12:** Stable artifact paths: `.artifacts/exports/<slug>/` (linear) or `.artifacts/exports/<slug>-<branchId>/` (branched).
- **D-13:** Export bundle JSON includes `captionTimingMapPath`, `narrationTrackPath`, and cross-artifact content hashes.

### Verification
- **D-14:** New `scripts/verify-narration-pipeline.mjs --quick` gate for phase 11.
- **D-15:** Canonical assembly (`network-foundations-long-v1`) is primary CI target; branched defense-path as secondary coverage.

### Claude's Discretion
- WAV sample rate (22050 vs 44100) for stub segments.
- Whether export bundle extends `DeterministicManifest` inline vs companion `export-bundle.json`.

</decisions>

<canonical_refs>
## Canonical References

### Upstream (Phase 06)
- `src/content/composition/generate-caption-timing-map.ts`
- `src/content/composition/caption-timing-map.schema.json`
- `.artifacts/captions/network-foundations-long-v1.json`

### Upstream (Phase 10)
- `buildLongFormSceneSpec(..., { branchId })` — branch naming convention
- `content-depth-branched-v1` — branched assembly for secondary tests

### Export (v1.0/v1.1)
- `src/render/export/fingerprint.ts` — deterministic manifest pattern
- `tests/e2e-canonical-flows.test.ts` — export artifact conventions

### ADR
- `.planning/adr/ADR-001-tech-stack.md` — hybrid narration strategy (stub for CI, cloud deferred)

</canonical_refs>

<specifics>
## Specific Ideas

- Stub audio: silent PCM WAV with duration derived from caption beat window — deterministic content hash from analyticKey + durationMs.
- Narration pipeline must run without ffmpeg/ffprobe for segment generation (metadata + stub WAV only); full video export remains Phase 12.

</specifics>

<deferred>
## Deferred Ideas

- ElevenLabs/Piper provider implementations → post-v1.2 or env-gated follow-up
- Soundtrack sync and cinematic sound design → v3 / BRD 6.6
- Burned-in subtitles from caption maps → future phase

</deferred>

---

*Phase: 11-narration-pipeline*
*Context gathered: 2026-05-31 via plan-phase*
