---
name: cinematic-production-orchestrator
description: Routes the six cinematic crew domain skills in production pipeline order with handoff checklists. Use when running end-to-end module production or verifying crew workflow completeness.
---

# Cinematic Production Orchestrator

Codifies the **Production Orchestrator** crew role. Single entry point for full-module production — routes domain skills in fixed order with handoff gates. Does **not** replace domain playbooks.

## When to Use

- Running end-to-end production for a topic module (e.g. TLS)
- Onboarding agents to the cinematic crew workflow
- Verifying all handoff artifacts exist before render or publish planning
- Preparing for Phase 16 TLS walkthrough or milestone verification

## Pipeline Order (fixed)

| Step | Role | Skill | Handoff artifact |
|------|------|-------|------------------|
| 1 | Director | [cinematic-director](../cinematic-director/SKILL.md) | [beat-sheet.md](../cinematic-director/templates/beat-sheet.md) |
| 2 | Art Director | [cinematic-art-director](../cinematic-art-director/SKILL.md) | [style-bible.md](../../docs/style-bible.md) |
| 3 | Storyboard Artist | [cinematic-storyboard-artist](../cinematic-storyboard-artist/SKILL.md) | [shot-list.md](../cinematic-storyboard-artist/templates/shot-list.md), [scenespec-handoff.md](../cinematic-storyboard-artist/templates/scenespec-handoff.md) |
| 4 | 3D Motion Designer | [cinematic-3d-motion-designer](../cinematic-3d-motion-designer/SKILL.md) | [r3f-module-catalog.md](../../docs/r3f-module-catalog.md) |
| 5 | Creative Technologist | [cinematic-creative-technologist](../cinematic-creative-technologist/SKILL.md) | [render-handoff.md](../cinematic-creative-technologist/templates/render-handoff.md) |
| 6 | Security SME + Audio | [cinematic-security-sme-audio](../cinematic-security-sme-audio/SKILL.md) | [security-accuracy-checklist.md](../../docs/security-accuracy-checklist.md), [audio-layer-handoff.md](../cinematic-security-sme-audio/templates/audio-layer-handoff.md) |

## Workflow

1. Open [templates/pipeline-checklist.md](templates/pipeline-checklist.md) for the target topic.
2. Execute steps 1–6 in order; do not skip gates.
3. At each step, invoke the domain skill — do not merge roles into one agent pass.
4. Confirm handoff artifact exists and gate criteria pass before advancing.
5. Final sign-off when step 6 accuracy + narration alignment complete.

## Gate Criteria (per step)

| Step | Gate — must pass before next step |
|------|-----------------------------------|
| 1 | Beat sheet filled; beat ids from contract `storyboardBeats` |
| 2 | Style tokens assigned from style bible per beat/shot |
| 3 | Shot list complete; SceneSpec passes `validateSceneSpec` |
| 4 | All shot `module id` values exist in R3F module catalog |
| 5 | MP4 export + quality assertions; export bundle paths documented (if long-form) |
| 6 | Accuracy checklist signed off; `validateNarrationAlignment` pass |

## Rules

- **Fixed order** — never run Storyboard before Director beat sheet exists.
- **No role merging** — orchestrator routes; domain skills execute their playbooks.
- **No schema invention** — contracts and SceneSpec v1.0.0 only.
- **TLS reference module** — use `docs/tls-crew-walkthrough.md`, `src/content/topics/tls/KICH-BAN.md`, and `tls-production-scene-spec.json` as worked example.

## Discovery

- Agent index: [AGENTS.md](../../AGENTS.md) (repo root)
- Full skill table: [reference.md](reference.md)

## Verification

```bash
npm run test -- tests/cinematic-crew-skills.test.ts
node scripts/verify-crew-skills.mjs --quick
```

See [docs/tls-crew-walkthrough.md](../../docs/tls-crew-walkthrough.md) for step-by-step TLS proof.
