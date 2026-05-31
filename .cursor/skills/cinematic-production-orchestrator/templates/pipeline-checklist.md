# Production Pipeline Checklist

> End-to-end checklist for one topic module. **TLS worked example** — adapt paths for other manifest topics.

## Module Header

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Contract | `src/content/topics/tls/contract.json` |
| Kịch bản | `src/content/topics/tls/KICH-BAN.md` |
| Publish SceneSpec | `src/fixtures/tls-production-scene-spec.json` |
| Assembly | single-topic short (~20s publish) |

---

## Step 1: Director

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-director/SKILL.md` |
| Handoff | `.cursor/skills/cinematic-director/templates/beat-sheet.md` |

- [ ] Beat sheet filled with contract beat ids (`tls-hook` … `tls-app-data-beat`)
- [ ] Frame ranges match contract (0–89 … 450–599 for production)
- [ ] Retention hooks assigned (p25/p50/p75/completion)
- [ ] KICH-BAN shot table aligned

**Gate:** All beat ids exist in contract `storyboardBeats`.

---

## Step 2: Art Director

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-art-director/SKILL.md` |
| Handoff | `docs/style-bible.md` |

- [ ] Style tokens cited per beat (`--color-*`, `--camera-*`, `--light-*`)
- [ ] TLS spatial roles: threat above link, data on link, cyan in tunnel
- [ ] No one-off hex outside style bible

**Gate:** Token names documented for each beat row.

---

## Step 3: Storyboard Artist

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |
| Handoff | `templates/shot-list.md`, `templates/scenespec-handoff.md` |

- [ ] Shot list rows for each beat id (spatial route column filled)
- [ ] SceneSpec JSON assembled → **`tls-production-scene-spec.json`**
- [ ] Timeline payloads include `packetVariant` + `messageType`
- [ ] `validateSceneSpec` passed

**Gate:** Valid publish SceneSpec; `tests/tls-visual-story.test.ts` pass.

---

## Step 4: 3D Motion Designer

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-3d-motion-designer/SKILL.md` |
| Handoff | `docs/r3f-module-catalog.md` |

- [ ] Every shot `module id` is a catalog `viz-*` id
- [ ] Server hello uses `viz-cert-single` (not chain) with sniffer actor present
- [ ] Composition rules respected (max 2 primary modules per shot)

**Gate:** `TLS_BEAT_MODULE_EXPECTATIONS` rubric passes.

---

## Step 5: Creative Technologist

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-creative-technologist/SKILL.md` |
| Handoff | `templates/render-handoff.md` |

- [ ] Production MP4: `.artifacts/production/tls/tls-production.mp4`
- [ ] `assertExportQuality` + `assertTlsProductionRubric` passed
- [ ] Headless GL or `trace-hash` backend documented in manifest

**Gate:** Render handoff checklist complete.

---

## Step 6: Security SME + Audio

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-security-sme-audio/SKILL.md` |
| Handoff | `docs/security-accuracy-checklist.md`, `templates/audio-layer-handoff.md` |

- [ ] Per-beat accuracy checklist signed off (spatial column)
- [ ] `scriptIntent` aligned to contract + KICH-BAN
- [ ] `validateNarrationAlignment` passed (when narration enabled)

**Gate:** SME sign-off; no sniffer during encrypted beats.

---

## Orchestrator Sign-Off

| Field | Value |
|-------|-------|
| All steps 1–6 | ☐ Complete |
| TLS walkthrough | `docs/tls-crew-walkthrough.md` |
| Ready for publish | ☐ |
