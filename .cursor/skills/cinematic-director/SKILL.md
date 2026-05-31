---
name: cinematic-director
description: Guides narrative beats, branch logic, and retention pacing for security documentary modules. Use when planning story beats, assembly branches, KPI pacing checkpoints (p25/p50/p75), or filling beat sheet handoffs aligned to topic contracts.
---

# Cinematic Director

Codifies the **Director** crew role for Security Cinematic Lab. Produce beat sheets and pacing plans from existing topic contracts and assemblies — never invent a parallel beat schema.

## When to Use

- Planning narrative beats for a topic module or long-form assembly
- Choosing or documenting `attack-path` vs `defense-path` branch logic
- Assigning retention hooks (p25/p50/p75/completion) to beats before storyboard work
- Filling the beat sheet handoff template for Phase 14 storyboard skill

## Workflow

1. **Read contract** — Load `src/content/topics/<topic>/contract.json`. Beats come from `storyboardBeats[]` only (`id`, `startFrame`, `endFrame`, `objective`).
2. **Map beats** — Copy beat ids and frame ranges verbatim. Cross-check `narrationPlaceholders[]` for script intent per beat.
3. **Choose branch or linear** — For single-topic modules, use linear. For long-form, pick assembly:
   - Linear: `content-depth-long-v1` (manifest order, all nine topics)
   - Branched: `content-depth-branched-v1` (`attack-path` or `defense-path`)
4. **Assign retention hooks** — Tag each beat with a checkpoint target (see Retention Pacing below).
5. **Fill beat sheet** — Use [templates/beat-sheet.md](templates/beat-sheet.md). Hand off to storyboard skill.

## Rules

- **Never duplicate beat schema.** Beat ids and frame ranges must match `contract.json` `storyboardBeats`.
- **Branch transitions must cite assembly rationale.** Copy `transitionOverrides[].rationale` from `content-depth-branched-v1.json`; do not invent transition copy without noting the source field.
- **Do not modify contracts or engine code** in Director mode — produce planning artifacts only.
- **Frame math stays at 30fps** unless the contract explicitly states otherwise.

## Branch Logic

Assembly: `src/content/assemblies/content-depth-branched-v1.json`

| Branch | Id | Narrative intent |
|--------|-----|------------------|
| Attack path | `attack-path` | Adversarial sequence; skips PKI trust chain; emphasizes MITM and token abuse |
| Defense path | `defense-path` | Defensive sequence; includes PKI and zero-trust; skips MITM module |

Default branch: `defense-path` (`defaultBranchId`).

When documenting a branched beat sheet:
- List the branch `sequence[]` topic order
- For each topic boundary with a `transitionOverrides` entry, include `fromTopic`, `toTopic`, `presetId`, and **rationale** verbatim
- Note topics **skipped** relative to the other branch (e.g., attack-path skips `pki-trust-chain`)

## Long-Form Linear Assembly

Assembly: `src/content/assemblies/content-depth-long-v1.json`

Stitch order follows manifest order (see [reference.md](reference.md)):
`tls` → `ssh` → `dns` → `auth-session` → `pki-trust-chain` → `mitm-defense` → `zero-trust-access` → `oauth-jwt-session` → `api-gateway-waf`

Target window: 10–14 minutes (`targetWindowMinutes`). Pacing preset: `documentary-standard`.

For linear long-form beat sheets, produce one beat table per topic in sequence; note cumulative frame offsets when stitching (Phase 14 storyboard handles spatial SceneSpec stitch via `build-long-form-scene-spec.ts`).

## Retention Pacing

KPI vocabulary from `src/verification/module-kpi.ts` and `src/content/batch/first-content-batch.ts`:

| Checkpoint | Planning role |
|------------|---------------|
| **p25** | Early hook — first 25% of module; establish threat or curiosity |
| **p50** | Mid-depth — mechanism explanation; viewer still engaged at halfway |
| **p75** | Late payoff — resolution, defense, or "so what" before CTA |
| **completion** | CTA and closure; pacing verdict applies to full module |

These are **planning targets**, not live analytics. Tag beats in the beat sheet with the checkpoint they must satisfy.

### Pacing verdict

Use `pacingVerdict` vocabulary from KPI capture: e.g. `balanced`, or document deviation with `feedbackTags` notes. Target `balanced` unless branch narrative demands faster attack-path tension.

### Retention checklist (per module)

- [ ] At least one beat tagged **p25** in first third of frame budget
- [ ] Mechanism beats tagged **p50** in middle third
- [ ] Payoff beat tagged **p75** before final CTA beat
- [ ] Final beat supports **completion** with clear CTA from contract `cta` field
- [ ] Branched transitions cite assembly `rationale`

## Beat Sheet Handoff

Fill [templates/beat-sheet.md](templates/beat-sheet.md) for every planning session. Required sections:

- Topic / Assembly
- Branch (`attack-path` | `defense-path` | `linear`)
- Beat table (contract beat ids only)
- Transition rationale (if branched)
- Pacing verdict target

## Coordination

- **Art Director** (`.cursor/skills/cinematic-art-director/`) — receives beat sheet; maps retention moments to lighting intensity
- **Storyboard Artist** (Phase 14) — consumes beat sheet → shot list → SceneSpec

## Canonical References

Full path catalog: [reference.md](reference.md)

Key files:
- `src/content/topics/tls/contract.json` — reference beat structure (`storyboardBeats`)
- `src/content/assemblies/content-depth-branched-v1.json` — branch sequences
- `src/content/assemblies/content-depth-long-v1.json` — linear long-form
- `src/verification/module-kpi.ts` — retention checkpoint types
