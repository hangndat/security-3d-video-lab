# Phase 20 Patterns

Extends Phase 11 narration patterns and v1.3 milestone-close patterns.

| Pattern | Closest analog | Use for Phase 20 |
|---------|----------------|------------------|
| Stub provider | `deterministic-stub-provider.ts` | Default dummy audio when no API key |
| Provider interface | `providers/types.ts` | ElevenLabs provider implements same contract |
| Narration generator | `generate-narration-track.ts` | Wire via `resolveNarrationProvider()` |
| TLS production bundle | `generate-tls-production-artifacts.ts` | Add narration track + WAV writes |
| TLS verify script | `verify-tls-production.mjs` | Pattern for `verify-tts-integration.mjs` |
| Milestone audit | `audit-milestone-v1.3.mjs` | `audit-milestone-v1.4.mjs` |
| Phase evidence | `V13_PHASE_EVIDENCE` in milestone-audit.ts | `V14_PHASE_EVIDENCE` phases 17–20 |
| Milestone close plan | `16-02-PLAN.md` | Archive ROADMAP, REQUIREMENTS, MILESTONES |

## New files (expected)

```
src/content/narration/providers/elevenlabs-provider.ts
src/content/narration/providers/resolve-narration-provider.ts
scripts/verify-tts-integration.mjs
scripts/verify-v14-viz-modules.mjs
scripts/audit-milestone-v1.4.mjs
tests/tts-provider.test.ts
.artifacts/verification/phase20/milestone-close.json
.planning/milestones/v1.4-MILESTONE-AUDIT.md
.planning/milestones/v1.4-REQUIREMENTS.md
```

## Files to extend

```
src/render/export/generate-tls-production-artifacts.ts
src/verification/milestone-audit.ts
tests/milestone-governance.test.ts
tests/tls-production-export.test.ts
docs/tls-crew-walkthrough.md
.cursor/skills/cinematic-security-sme-audio/SKILL.md (optional provider note)
package.json (verify:tts-integration)
```

---
*Phase: 20-tts-integration-milestone-close*
