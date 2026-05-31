# Agent Skills — Cinematic Crew

Project Agent Skills for Security Cinematic Lab production pipeline. Skills live under `.cursor/skills/` and are auto-discovered by Cursor via each skill's `description` frontmatter.

**Full TLS walkthrough:** [docs/tls-crew-walkthrough.md](docs/tls-crew-walkthrough.md)

## Crew Skills

| Skill | Path | Requirement | Role |
|-------|------|-------------|------|
| cinematic-director | `.cursor/skills/cinematic-director/` | CREW-01 | Narrative beats, branch logic, retention pacing |
| cinematic-art-director | `.cursor/skills/cinematic-art-director/` | CREW-02 | Dark sci-fi documentary style tokens |
| cinematic-storyboard-artist | `.cursor/skills/cinematic-storyboard-artist/` | CREW-03 | Beat → shot list → SceneSpec |
| cinematic-3d-motion-designer | `.cursor/skills/cinematic-3d-motion-designer/` | CREW-04 | R3F module catalog (packet/tunnel/cert/HUD) |
| cinematic-creative-technologist | `.cursor/skills/cinematic-creative-technologist/` | CREW-05 | Remotion render, export bundle, determinism |
| cinematic-security-sme-audio | `.cursor/skills/cinematic-security-sme-audio/` | CREW-06 | Security accuracy + narration/audio layers |
| cinematic-production-orchestrator | `.cursor/skills/cinematic-production-orchestrator/` | CREW-07 | Routes steps 1–6 in pipeline order |

## Shared Reference Docs

| Document | Purpose |
|----------|---------|
| [docs/style-bible.md](docs/style-bible.md) | Visual identity tokens |
| [docs/r3f-module-catalog.md](docs/r3f-module-catalog.md) | `viz-*` module ids |
| [docs/security-accuracy-checklist.md](docs/security-accuracy-checklist.md) | Beat → claim verification |

## Pipeline Order

```
Director → Art Director → Storyboard → Motion → Creative Technologist → Security SME + Audio
```

Start with **cinematic-production-orchestrator** for end-to-end module production.

## Verification

```bash
npm run test -- tests/cinematic-crew-skills.test.ts
npm run verify:crew-skills
```
