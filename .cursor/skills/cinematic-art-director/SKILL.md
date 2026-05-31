---
name: cinematic-art-director
description: Applies dark sci-fi documentary visual style using codified tokens from the style bible. Use when choosing colors, typography, lighting, camera mood, or SceneSpec-adjacent visual decisions for security visualization scenes.
---

# Cinematic Art Director

Codifies the **Art Director** crew role. Apply the dark sci-fi documentary look using named tokens from the canonical style bible — single source of truth, no duplicated palettes in agent output.

## When to Use

- Selecting colors, typography, lighting, or camera mood for a module
- Documenting visual choices for storyboard / SceneSpec handoff (Phase 14)
- Aligning packet, actor, and HUD styling with retention beat moments
- Reviewing renders or fixtures for visual consistency

## Style Bible (required reading)

**Always read first:** [docs/style-bible.md](../../docs/style-bible.md)

All visual decisions cite token names (e.g. `--color-accent-data`, `--font-hud`). Do not paste full hex tables into agent responses — link to the bible.

## Workflow

1. **Read style bible** — Load `docs/style-bible.md` sections: Color Palette, Typography, Lighting, Camera Mood.
2. **Read beat sheet** — From Director skill output ([cinematic-director/templates/beat-sheet.md](../cinematic-director/templates/beat-sheet.md)).
3. **Select tokens per scene role** — Map beat retention hooks to lighting/camera tokens (see Coordination below).
4. **Document choices** — In storyboard handoff, list token names per shot; no one-off hex without `exception:` note.
5. **Verify SceneSpec mapping** — Use bible "SceneSpec Mapping Notes"; do not modify schema in Art Director mode.

## Rules

- **Single source:** `docs/style-bible.md` owns all hex, font, and mood values.
- **No inline duplicate palettes** in SKILL output or handoffs — reference token names only.
- **No schema changes** — SceneSpec fields are documented in bible mapping notes; implementation deferred to Phase 14+.
- **Semantic colors for packets** — Use encrypted/trust/threat/neutral roles from bible semantic table.
- **Exceptions** — If a beat requires a non-bible color, document: `exception: <reason>` and propose bible amendment separately.

## Coordination with Director

| Director beat hook | Art direction response |
|--------------------|------------------------|
| **p25** (early hook) | `--light-threat-pulse`, wide `--camera-framing`, `--color-accent-threat` on exposed paths |
| **p50** (mechanism) | Increase `--light-rim-intensity`, medium tracking, `--color-accent-cyan` for secure flows |
| **p75** (payoff) | Slow `--camera-dolly-speed`, `--color-accent-trust`, intimate `--camera-fov-intimate` for cert/HUD |
| **completion** | Hold frame, minimal motion, `--color-text-primary` narration overlay |

Director skill: `.cursor/skills/cinematic-director/`

## SceneSpec & Fixtures

- Schema: `src/engine/contracts/scene-spec.ts`
- Reference fixture: `src/fixtures/auth-session-scene-spec.json`
- Apply tokens at render layer (R3F/Remotion); JSON fixtures stay structural until style schema lands

See bible **SceneSpec Mapping Notes** for field-level token mapping.

## Handoff to Storyboard (Phase 14)

For each shot, document:

| Column | Content |
|--------|---------|
| Beat id | From Director beat sheet (contract id) |
| Background | `--color-bg-*` tokens |
| Packet / actor style | Semantic color + `--font-hud` |
| Lighting | `--light-*` tokens |
| Camera | `--camera-*` tokens |

## Canonical References

Full path catalog: [reference.md](reference.md)
