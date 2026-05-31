# Production Pipeline Checklist

> End-to-end checklist for one topic module. **TLS worked example** — adapt paths for other manifest topics.

## Module Header

| Field | Value |
|-------|-------|
| Topic | `tls` |
| Contract | `src/content/topics/tls/contract.json` |
| Assembly | single-topic short (or `content-depth-long-v1` for long-form) |

---

## Step 1: Director

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-director/SKILL.md` |
| Handoff | `.cursor/skills/cinematic-director/templates/beat-sheet.md` |

- [ ] Beat sheet filled with contract beat ids (`tls-hook` … `tls-app-data-beat`)
- [ ] Retention hooks assigned (p25/p50/p75/completion)
- [ ] Branch section complete (linear or branched)

**Gate:** All beat ids exist in contract `storyboardBeats`.

---

## Step 2: Art Director

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-art-director/SKILL.md` |
| Handoff | `docs/style-bible.md` |

- [ ] Style tokens cited per beat (`--color-*`, `--camera-*`, `--light-*`)
- [ ] No one-off hex outside style bible

**Gate:** Token names documented for each beat row.

---

## Step 3: Storyboard Artist

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-storyboard-artist/SKILL.md` |
| Handoff | `templates/shot-list.md`, `templates/scenespec-handoff.md` |

- [ ] Shot list rows for each beat id
- [ ] SceneSpec JSON assembled
- [ ] `validateSceneSpec` passed

**Gate:** Valid SceneSpec; reference `src/fixtures/golden-scene-spec.json` for TLS.

---

## Step 4: 3D Motion Designer

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-3d-motion-designer/SKILL.md` |
| Handoff | `docs/r3f-module-catalog.md` |

- [ ] Every shot `module id` is a catalog `viz-*` id
- [ ] Composition rules respected (max 2 primary modules per shot)

**Gate:** No ad-hoc module names.

---

## Step 5: Creative Technologist

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-creative-technologist/SKILL.md` |
| Handoff | `templates/render-handoff.md` |

- [ ] Short MP4 exported under `.artifacts/export/`
- [ ] `assertExportQuality` passed
- [ ] Export bundle documented (if long-form): `bundleHash`, caption + narration paths

**Gate:** Render handoff checklist complete.

---

## Step 6: Security SME + Audio

| Field | Value |
|-------|-------|
| Skill | `.cursor/skills/cinematic-security-sme-audio/SKILL.md` |
| Handoff | `docs/security-accuracy-checklist.md`, `templates/audio-layer-handoff.md` |

- [ ] Per-beat accuracy checklist signed off
- [ ] Narration placeholders aligned to contract
- [ ] `validateNarrationAlignment` passed

**Gate:** SME sign-off + audio alignment valid.

---

## Orchestrator Sign-Off

| Field | Value |
|-------|-------|
| All steps 1–6 | ☐ Complete |
| TLS walkthrough reference | `docs/tls-crew-walkthrough.md` |
| Ready for publish planning (v1.4+) | ☐ |
