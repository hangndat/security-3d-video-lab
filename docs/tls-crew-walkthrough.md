# TLS Crew Walkthrough

End-to-end proof of the cinematic crew skill chain on the **TLS** topic module (`src/content/topics/tls/contract.json`). Follow steps in order — matches [pipeline-checklist.md](../.cursor/skills/cinematic-production-orchestrator/templates/pipeline-checklist.md).

**Audience:** software engineers · **Publish script:** [src/content/topics/tls/KICH-BAN.md](../src/content/topics/tls/KICH-BAN.md)  
**Publish SceneSpec:** `src/fixtures/tls-production-scene-spec.json` (`tls-production-seed-005`, 600 frames @ 30 fps)

---

## Visual story (spatial layout)

Production TLS uses a fixed **link stage** so each beat reads as protocol semantics, not abstract motion:

```
                    [sniffer]  ← actor-attacker, frames 0–89 only
                        │
         cleartext ─────┼─────  y≈3, viz-packet-threat (hook)
                        │
    [browser] ══════════╪══════════ [origin]
       x=-4          link wire      x=4
                        │
              handshake on wire     y≈0.25, ClientHello / ServerHello
                        │
              tunnel secure           y≈0, viz-tunnel-secure (Finished+)
                        │
              app data in tunnel      y≈-0.25, viz-packet-encrypted
```

| Layer | Implementation |
|-------|----------------|
| Actor anchors | `src/client/viz/actor-anchors.ts` — browser/origin/sniffer positions; sniffer hidden after hook |
| Link wire | Thin box mesh along x=-4…4 (browser ↔ origin) |
| Packet labels | Timeline `payload.messageType` → billboard on sphere (`createHudLabelTexture`) |
| Bottom captions | `contract.json` `scriptIntent` → PNG burn-in (`compositeCaptionOnPng`) |
| Cert placement | `viz-cert-single` at origin side (x≈3.5) during server-hello |
| Tunnel | Torus scaled along X between endpoints; wireframe during hello, solid when secure |

**Regression tests:** `tests/tls-visual-story.test.ts`

---

## Step 1: Director

**Skill:** `.cursor/skills/cinematic-director/SKILL.md`

1. Read `src/content/topics/tls/contract.json` → `storyboardBeats`, `narrationPlaceholders`.
2. Fill `.cursor/skills/cinematic-director/templates/beat-sheet.md`:
   - Beat ids: `tls-hook`, `tls-client-hello-beat`, `tls-server-hello-beat`, `tls-finished-beat`, `tls-app-data-beat`
   - Frames: 0–89, 90–209, 210–329, 330–449, 450–599 (production fixture)
   - Assign retention hooks: `tls-hook` → **p25**; mechanism beats → p50; `tls-finished-beat` → p75; `tls-app-data-beat` → completion
3. Cross-check [KICH-BAN.md](../src/content/topics/tls/KICH-BAN.md) shot table.

**Gate:** Beat ids and frame ranges match contract exactly.

---

## Step 2: Art Director

**Skill:** `.cursor/skills/cinematic-art-director/SKILL.md`

1. Read `docs/style-bible.md`.
2. Map tokens per beat:
   - `tls-hook`: `--color-accent-threat`, `--light-threat-pulse`, wide `--camera-framing`
   - Mechanism beats: `--color-accent-data`, `--light-rim-intensity`, link `--color-accent-neutral`
   - `tls-server-hello-beat`: `--color-accent-trust`, `--camera-fov-intimate`
   - Secure channel: `--color-accent-cyan`, `viz-tunnel-secure`
3. Sniffer marker uses threat token; browser/origin use data/trust markers.

**Gate:** Token names from style bible only.

---

## Step 3: Storyboard Artist

**Skill:** `.cursor/skills/cinematic-storyboard-artist/SKILL.md`

1. Build shot list → `.cursor/skills/cinematic-storyboard-artist/templates/shot-list.md` (TLS rows).
2. Map to SceneSpec per `scenespec-handoff.md` — **publish canonical:** `tls-production-scene-spec.json`.
3. Timeline payload per beat: `packetId`, `packetVariant`, `messageType`.
4. Actors: `actor-client` (browser), `actor-server` (origin), `actor-attacker` (sniffer, hook only in viz).
5. Run `validateSceneSpec` from `src/engine/contracts/validate-scene-spec.ts`.

**Gate:** SceneSpec validation passes; routes match KICH-BAN spatial rules.

**CI short export (unchanged):** `src/fixtures/golden-scene-spec.json` — minimal single-packet demo, not publish storyboard.

---

## Step 4: 3D Motion Designer

**Skill:** `.cursor/skills/cinematic-3d-motion-designer/SKILL.md`

1. Confirm shot list module ids against `docs/r3f-module-catalog.md`:
   - `tls-hook` → `viz-packet-threat` (cleartext above link)
   - Handshake → `viz-packet-flow`, `viz-tunnel-handshake` (on link)
   - Server hello → `viz-cert-single` (not `viz-cert-chain` — sniffer is not a CA actor)
   - Finished → `viz-tunnel-secure`
   - App data → `viz-packet-encrypted` (inside tunnel, y below wire)
   - HUD → `viz-hud-actor-label`, `viz-hud-beat-caption`, `viz-hud-packet-id` (shows `messageType`)
2. Cert module selection: `resolveCertModuleId` uses PKI role keywords only — three network actors do **not** imply chain.

**Gate:** All ids are catalog `viz-*` entries; rubric in `tls-production-rubric.ts` passes.

---

## Step 5: Creative Technologist

**Skill:** `.cursor/skills/cinematic-creative-technologist/SKILL.md`

1. Input: validated **`src/fixtures/tls-production-scene-spec.json`**.
2. Render: `deriveRenderFrameState` (viz-aware trace) → `renderCompositionProductionMp4` (640×360, 600 frames).
3. Backend: `resolveProductionRenderBackend()` — local default **`r3f-headless`**; CI sets **`SECURITY_LAB_RENDER_BACKEND=trace-hash`**.
4. **v1.5 video-only:** default export skips narration/TTS mux; manifest `videoOnly: true`, `frameSource: png`.
5. Quality: `assertExportQuality` with `productionPolicyForScene`.
6. Production artifacts: `generateTlsProductionArtifacts` → `.artifacts/production/tls/`.
7. Verify: `npm run verify:tls-3d-production -- --quick`, `tests/tls-visual-story.test.ts`, `tests/tls-production-export.test.ts`.

**Gate:** MP4 under `.artifacts/production/tls/`; module mapping + security sign-off pass.

### Render Backend Policy

| Profile | `SECURITY_LAB_RENDER_BACKEND` | Backend | Frame source |
|---------|-------------------------------|---------|--------------|
| Local default | *(unset)* | `r3f-headless` | PNG via headless GL + caption burn-in |
| CI / nightly Ubuntu | `trace-hash` | `trace-hash` | Deterministic color hash |
| Legacy narration | `SECURITY_LAB_INCLUDE_NARRATION=true` | same as above | + TTS mux (v1.4 path) |

**Local full 3D publish** (requires headless GL, e.g. macOS):

```bash
unset SECURITY_LAB_RENDER_BACKEND
unset SECURITY_LAB_INCLUDE_NARRATION
npm run test -- tests/tls-production-export.test.ts --testNamePattern="default env export"
```

Output: `.artifacts/production/tls/tls-production.mp4` (~20s)  
Debug frame (ClientHello + labels): `.artifacts/production/tls/debug-frame-150-caption.png`

---

## Step 6: Security SME + Audio (optional for v1.5 video-only)

**Skill:** `.cursor/skills/cinematic-security-sme-audio/SKILL.md`

> **v1.5 note:** Step 6 is optional when publishing video-only TLS exports (`videoOnly: true`). Re-enable with `SECURITY_LAB_INCLUDE_NARRATION=true` for narration artifacts.

1. Walk `docs/security-accuracy-checklist.md` TLS per-beat table (includes spatial visual criteria).
2. Verify `narrationPlaceholders` in contract match `scriptIntent` and KICH-BAN.
3. Caption map: `buildTlsOnlyCaptionMap` from production SceneSpec.
4. Run `validateNarrationAlignment` when narration enabled.
5. Fill `audio-layer-handoff.md` with provider id and track path.

**Gate:** Accuracy sign-off; spatial story does not contradict claims (e.g. no sniffer during encrypted beats).

---

## Step 7: Orchestrator Review

**Skill:** `.cursor/skills/cinematic-production-orchestrator/SKILL.md`

1. Confirm steps 1–6 checklists complete in `pipeline-checklist.md`.
2. KICH-BAN, production SceneSpec, and `docs/r3f-module-catalog.md` agree on modules and layout.
3. Index: [AGENTS.md](../AGENTS.md)

**Gate:** Full chain documented; publish MP4 reflects spatial story.

---

## Verification Commands

```bash
npm run test -- tests/tls-visual-story.test.ts
npm run test -- tests/tls-production-export.test.ts
npm run verify:tls-production
npm run verify:tls-3d-production -- --quick
npm run test -- tests/cinematic-crew-skills.test.ts
node scripts/verify-crew-skills.mjs --quick
npm run test -- tests/headless-capture.test.ts
npm run verify:headless-scene-parity -- --quick
```

## Canonical Paths

| Artifact | Path |
|----------|------|
| Contract | `src/content/topics/tls/contract.json` |
| Kịch bản (VI + shot list) | `src/content/topics/tls/KICH-BAN.md` |
| Publish SceneSpec | `src/fixtures/tls-production-scene-spec.json` |
| Actor / link layout | `src/client/viz/actor-anchors.ts` |
| CI short SceneSpec | `src/fixtures/golden-scene-spec.json` |
| Module rubric | `src/verification/tls-production-rubric.ts` |
