# Style Bible — Dark Sci-Fi Documentary

Canonical visual identity for Security Cinematic Lab modules. Agents must cite **token names** from this document; do not invent one-off hex values without an explicit exception note.

**Audience:** Art Director skill, Storyboard Artist (Phase 14), 3D Motion Designer (Phase 14+).

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-deep` | `#0a0e17` | Scene background, tunnel void, letterbox bars |
| `--color-bg-panel` | `#121a2b` | HUD panels, actor pedestals, secondary surfaces |
| `--color-bg-grid` | `#1a2438` | Subtle floor grid, network plane |
| `--color-accent-data` | `#f5a623` | Primary packet flow highlights, active data paths |
| `--color-accent-cyan` | `#4ecdc4` | Secondary data flow, encrypted channel glow |
| `--color-accent-trust` | `#3dffa8` | Verified trust states, successful handshake |
| `--color-accent-threat` | `#ff4757` | Attacker paths, MITM interception, failure states |
| `--color-accent-neutral` | `#8892a8` | Idle actors, unencrypted traffic, labels |
| `--color-text-primary` | `#e8ecf4` | Narration overlay, primary HUD text |
| `--color-text-muted` | `#6b7894` | Secondary labels, timestamps, metadata |

### Semantic packet colors

| Role | Token | When to use |
|------|-------|-------------|
| Encrypted | `--color-accent-cyan` | TLS/SSH finished states, secure tunnels |
| Plaintext / risk | `--color-accent-threat` | Hook beats, visible credential exposure |
| Neutral transit | `--color-accent-data` | Default packet animation before state change |
| Trusted endpoint | `--color-accent-trust` | Certificate validation success, zero-trust allow |

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-hud` | `"JetBrains Mono", "SF Mono", monospace` | Actor labels, packet ids, frame counters, debug HUD |
| `--font-narration` | `"Inter", "Helvetica Neue", sans-serif` | On-screen narration captions, chapter titles |
| `--font-size-hud-sm` | `12px` | Inline packet labels |
| `--font-size-hud-md` | `14px` | Actor name plates |
| `--font-size-narration` | `18px` | Caption overlay (safe area lower third) |
| `--font-weight-hud` | `500` | HUD labels — legible at small sizes |
| `--font-weight-narration` | `400` | Body narration; avoid bold unless emphasis beat |

**Rules:** HUD text always monospace; narration always sans-serif. Never mix families on the same label tier.

---

## Lighting

| Token | Value | Usage |
|-------|-------|-------|
| `--light-key-intensity` | `0.35` | Low-key documentary key; never flat bright |
| `--light-rim-intensity` | `0.85` | Rim highlight on network actors and packet origins |
| `--light-ambient` | `#0a0e17` at `0.15` | Deep ambient matching `--color-bg-deep` |
| `--light-accent-glow` | `--color-accent-data` at `0.4` opacity | Packet trail bloom |
| `--light-threat-pulse` | `--color-accent-threat` at `0.6` opacity | p25 hook moments, attacker reveal |

**Mood:** Low-key, observational documentary. Actors read via rim light against deep void. Avoid wash-out or comedy-bright scenes.

**Beat coordination:** Increase `--light-rim-intensity` at p50 mechanism beats; pulse `--light-threat-pulse` at p25 hooks.

---

## Camera Mood

| Token | Value | Usage |
|-------|-------|-------|
| `--camera-dolly-speed` | `slow` | Deliberate push/pull; no snap zooms |
| `--camera-framing` | `observational` | Wide establishing → medium mechanism → close payoff |
| `--camera-orbit-damp` | `0.92` | Smooth damped orbit on tunnel/packet scenes |
| `--camera-fov-default` | `45°` | Standard documentary FOV |
| `--camera-fov-intimate` | `35°` | Certificate/HUD detail beats |
| `--camera-position-default` | `[0, 2, 8]` | Headless/R3F default observational camera (lookAt origin) |
| `--key-light-position` | `[5, 8, 5]` | Directional key light placement for headless capture |

**Framing rules:**
- **Hook (p25):** Wide shot — establish network topology and threat context
- **Mechanism (p50):** Medium tracking — follow packet through tunnel/handshake
- **Payoff (p75):** Slow dolly in — trust indicator or defense layer
- **Completion:** Hold on CTA frame; minimal camera motion

Post-MVP camera overrides remain gated by SceneSpec `capabilities.postMvpCameraOverrides` (default `false`).

---

## SceneSpec Mapping Notes

SceneSpec schema: `src/engine/contracts/scene-spec.ts` (v1.0.0). Style tokens apply at the R3F/headless render layer — not as JSON fields.

| SceneSpec field | Style token application |
|-----------------|-------------------------|
| `actors[].label` | Billboard + marker at world anchor (`actor-anchors.ts` on TLS production) |
| `packets[].route` | Y-axis role: threat above link, handshake on link, encrypted below in tunnel |
| `timeline[].payload.packetVariant` | `threat` / `flow` / `encrypted` → packet semantic colors |
| `timeline[].payload.messageType` | HUD monospace label on active packet (e.g. `ClientHello`) |
| `totalFrames` | Camera mood pacing from Director beat sheet retention hooks |
| `capabilities` | Respect `postMvpCameraOverrides: false` until post-MVP registry update |

### TLS production layout (`tls-production-scene`)

| Role | Token / module |
|------|----------------|
| Browser marker (x=-4) | `--color-accent-data` |
| Origin marker (x=4) | `--color-accent-trust` |
| Sniffer (hook only, x=0 elevated) | `--color-accent-threat`, `--light-threat-pulse` |
| Link wire | `--color-accent-neutral` |
| Bottom narration | `--color-bg-panel`, `--color-text-primary`, `--font-narration` (PNG burn-in) |

Reference: `src/fixtures/tls-production-scene-spec.json`, `src/content/topics/tls/KICH-BAN.md`, `docs/tls-crew-walkthrough.md`.

**Other fixtures:** `src/fixtures/auth-session-scene-spec.json` — minimal structure; `golden-scene-spec.json` — CI short demo only.

**Future:** Parallel `styleNotes` handoff column allowed in storyboard templates; do not add fields to SceneSpec without a schema version bump.

---

## Document Control

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-05-31 | Initial dark sci-fi documentary tokens (Phase 13 / CREW-02) |
| 1.1.0 | 2026-05-31 | Headless lighting/camera tokens in `STYLE_TOKENS` (Phase 22 / RENDER-02) |
| 1.2.0 | 2026-05-31 | TLS production spatial mapping (actor anchors, route Y roles, messageType labels) |
