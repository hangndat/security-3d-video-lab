# TLS Crew Walkthrough

End-to-end proof of the cinematic crew skill chain on the **TLS** topic module (`src/content/topics/tls/contract.json`). Follow steps in order — matches [pipeline-checklist.md](../.cursor/skills/cinematic-production-orchestrator/templates/pipeline-checklist.md).

---

## Step 1: Director

**Skill:** `.cursor/skills/cinematic-director/SKILL.md`

1. Read `src/content/topics/tls/contract.json` → `storyboardBeats`, `narrationPlaceholders`.
2. Fill `.cursor/skills/cinematic-director/templates/beat-sheet.md`:
   - Beat ids: `tls-hook`, `tls-client-hello-beat`, `tls-server-hello-beat`, `tls-finished-beat`, `tls-app-data-beat`
   - Assign retention hooks: `tls-hook` → **p25**; mechanism beats → p50; `tls-finished-beat` → p75; `tls-app-data-beat` → completion

**Gate:** Beat ids match contract exactly.

---

## Step 2: Art Director

**Skill:** `.cursor/skills/cinematic-art-director/SKILL.md`

1. Read `docs/style-bible.md`.
2. Map tokens per beat:
   - `tls-hook`: `--color-accent-threat`, `--light-threat-pulse`, wide `--camera-framing`
   - Mechanism beats: `--color-accent-data`, `--light-rim-intensity`
   - `tls-server-hello-beat`: `--color-accent-trust`, `--camera-fov-intimate`
   - Secure channel: `--color-accent-cyan`, `viz-tunnel-secure` mood

**Gate:** Token names from style bible only.

---

## Step 3: Storyboard Artist

**Skill:** `.cursor/skills/cinematic-storyboard-artist/SKILL.md`

1. Build shot list → `.cursor/skills/cinematic-storyboard-artist/templates/shot-list.md` (TLS rows included).
2. Map to SceneSpec fields per `scenespec-handoff.md`.
3. Validate against `src/fixtures/tls-production-scene-spec.json` (publish canonical) or `src/fixtures/golden-scene-spec.json` (CI short export).
4. Run `validateSceneSpec` from `src/engine/contracts/validate-scene-spec.ts`.

**Gate:** SceneSpec validation passes.

---

## Step 4: 3D Motion Designer

**Skill:** `.cursor/skills/cinematic-3d-motion-designer/SKILL.md`

1. Confirm shot list module ids against `docs/r3f-module-catalog.md`:
   - `tls-hook` → `viz-packet-threat`
   - Handshake → `viz-packet-flow`, `viz-tunnel-handshake`
   - Server hello → `viz-cert-single`
   - Finished → `viz-tunnel-secure`
   - App data → `viz-packet-encrypted`
   - HUD → `viz-hud-actor-label`

**Gate:** All ids are catalog `viz-*` entries.

---

## Step 5: Creative Technologist

**Skill:** `.cursor/skills/cinematic-creative-technologist/SKILL.md`

1. Input: validated SceneSpec — **`src/fixtures/tls-production-scene-spec.json`** for publish-ready TLS.
2. Render: `deriveRenderFrameState` (viz-aware trace) → `renderCompositionProductionMp4` (640×360, full `totalFrames`).
3. Quality: `assertExportQuality` with `productionPolicyForScene` per `src/verification/export-quality.ts`.
4. Short CI export: `renderCompositionDemoMp4` + `golden-scene-spec.json` (unchanged).
5. Production artifacts: `generateTlsProductionArtifacts` → `.artifacts/production/tls/`.
6. Verify: `npm run verify:tls-production`.

**Gate:** MP4 under `.artifacts/production/tls/`; production quality + security sign-off pass.

---

## Step 6: Security SME + Audio

**Skill:** `.cursor/skills/cinematic-security-sme-audio/SKILL.md`

1. Walk `docs/security-accuracy-checklist.md` TLS per-beat table.
2. Verify `narrationPlaceholders` in contract match spoken intent.
3. Generate/verify caption map + narration track via `resolveNarrationProvider()` (ElevenLabs when `ELEVENLABS_API_KEY` set; `deterministic-stub` dummy audio in CI).
4. Run `validateNarrationAlignment` from `src/content/narration/validate-narration-alignment.ts`.
5. Fill `audio-layer-handoff.md` with provider id and narration track path.

**Gate:** Accuracy sign-off + alignment valid.

---

## Step 7: Orchestrator Review

**Skill:** `.cursor/skills/cinematic-production-orchestrator/SKILL.md`

1. Confirm steps 1–6 checklists complete in `pipeline-checklist.md`.
2. Cross-check handoff artifacts exist at paths listed above.
3. Index: [AGENTS.md](../AGENTS.md)

**Gate:** Full chain documented; ready for v1.4 production content work.

---

## Verification Commands

```bash
npm run test -- tests/tls-production-export.test.ts
npm run verify:tls-production
npm run verify:tts-integration -- --quick
npm run test -- tests/cinematic-crew-skills.test.ts
node scripts/verify-crew-skills.mjs --quick
npm run test -- tests/render-composition.test.ts
node scripts/verify-narration-pipeline.mjs --quick
node scripts/validate-requirement-traceability.mjs --milestone-close
```

**Canonical TLS contract:** `src/content/topics/tls/contract.json`  
**Publish SceneSpec:** `src/fixtures/tls-production-scene-spec.json`  
**CI short SceneSpec:** `src/fixtures/golden-scene-spec.json`
