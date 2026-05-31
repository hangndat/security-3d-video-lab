# Milestone v1.5 — Project Summary

**Generated:** 2026-05-31  
**Purpose:** Team onboarding and project review  
**Milestone:** Real 3D Render (Phases 21–24)

---

## 1. Project Overview

**Security Cinematic Lab** is a code-driven cinematic visualization platform that explains security and infrastructure concepts (TLS, SSH, DNS, and related topics) with high technical clarity and strong storytelling.

**v1.5 goal:** Close the render gap left by v1.4 — export TLS cinematic video from **real headless Three.js pixels**, not trace-hash placeholders, while keeping CI stable on GL-less runners.

**What shipped:**
- Headless PNG frame capture wired to SceneSpec + compose plan
- Unified geometry source of truth for all eleven `viz-*` R3F catalog modules
- TLS production MP4 as **video-only 3D export** (640×360, full frame count)
- CI render backend policy (`trace-hash` on PR/nightly; `r3f-headless` local default)
- Machine-validated milestone governance close (5/5 requirements, audit PASS)

**Built on:** v1.4's eleven R3F modules, TLS publish-ready production scene, crew skill pipeline, and ElevenLabs TTS integration (TTS intentionally **not** muxed into v1.5 3D exports).

---

## 2. Architecture & Technical Decisions

| Decision | Why | Phase |
|----------|-----|-------|
| **`r3f-headless` default backend** | Local publish produces real PNG frames via `@headless-three/renderer` | 21 |
| **`trace-hash` CI backend** | Deterministic color frames without GPU on ubuntu-latest PR runners | 21, 24 |
| **`SECURITY_LAB_RENDER_BACKEND` env gate** | Single switch between full 3D and CI-safe fallback | 21 |
| **Minimal scene builder in Phase 21, full parity in Phase 22** | Prove capture works before catalog-wide mesh unification | 21–22 |
| **`viz-mesh-spec.ts` as geometry SOT** | R3F components and headless builder share one mesh factory — no divergent geometry | 22 |
| **Style bible tokens for lighting/camera** | Headless builder uses `STYLE_TOKENS`; no magic hex in builder | 22 |
| **Video-only default for TLS export** | v1.5 scope excludes TTS/audio mux; narration deferred to PROD-04 | 23 |
| **Manifest v1.1.0** | Records `videoOnly`, `frameSource`, `renderBackend` | 23 |
| **`SECURITY_LAB_INCLUDE_NARRATION=true` legacy path** | Preserves v1.4 narration tests without blocking video-only default | 23 |
| **`verify:3d-render` umbrella gate** | One CI entry point orchestrating three sub-gates | 24 |
| **`isBetweenMilestones()` by active req ids** | Traceability skips when REQUIREMENTS has no active milestone rows | 24 |

**Tech stack (render path):**
- Three.js + `@headless-three/renderer` — headless PNG capture
- React Three Fiber — browser/R3F catalog components (v1.4)
- Remotion + FFmpeg — MP4 encoding from frame sequences
- Vitest — unit/integration tests with GL-gated skips where needed

---

## 3. Phases Delivered

| Phase | Name | Status | One-Liner |
|-------|------|--------|-----------|
| 21 | Headless Capture Foundation | ✅ Complete | Restored headless Three.js PNG capture and env-gated render backend |
| 22 | Scene Builder Parity | ✅ Complete | Unified all eleven `viz-*` modules via shared `viz-mesh-spec.ts` |
| 23 | TLS 3D Production Export | ✅ Complete | TLS video-only 3D MP4 with manifest v1.1.0 |
| 24 | Render CI & Milestone Close | ✅ Complete | `verify:3d-render` CI policy + v1.5 milestone audit close |

**Plans:** 8/8 complete across 4 phases.

---

## 4. Requirements Coverage

| ID | Requirement | Status |
|----|-------------|--------|
| RENDER-01 | Headless Three.js PNG capture from SceneSpec + compose plan | ✅ Complete |
| RENDER-02 | Scene builder maps all eleven `viz-*` modules from shared SOT | ✅ Complete |
| RENDER-03 | TLS video-only MP4 via `r3f-headless` default | ✅ Complete |
| RENDER-04 | Env-gated backend: CI trace-hash, local/nightly 3D documented | ✅ Complete |
| VER-08 | v1.5 machine-validated in CI; milestone-close zero pending | ✅ Complete |

**Audit verdict:** PASS — `.planning/milestones/v1.5-MILESTONE-AUDIT.md`  
**Coverage:** 5/5 mapped, 0 unmapped

---

## 5. Key Decisions Log

1. **CI never requires GL** — PR and nightly jobs set `SECURITY_LAB_RENDER_BACKEND=trace-hash`; full 3D is a documented local/macOS path.
2. **Phase 21 ships minimal meshes; Phase 22 completes catalog** — avoids blocking capture proof on full parity work.
3. **Video-only is the v1.5 default export** — `generateTlsProductionArtifacts` skips narration unless `SECURITY_LAB_INCLUDE_NARRATION=true`.
4. **Frame source is explicit in manifest** — `"png"` for r3f-headless, `"ppm-trace-hash"` for CI backend.
5. **Umbrella verification** — `verify:3d-render` aggregates headless-capture, scene-parity, and tls-3d-production rather than duplicating logic.
6. **Governance mirrors v1.4 close** — `V15_PHASE_EVIDENCE`, `audit-milestone-v1.5.mjs`, phase24 milestone-close JSON.

---

## 6. Tech Debt & Deferred Items

| Item | Origin | Notes |
|------|--------|-------|
| **PROD-04** — TTS/audio mux on 3D exports | v1.5 scope fence | Legacy path exists via env flag; not default |
| **PROD-03** — Second topic (SSH/DNS) 3D production | v6 backlog | TLS remains canonical template |
| **Pixel golden PNG regression** | Phase 23 deferred | No committed golden PNG hash files yet |
| **Dedicated GPU CI for full 236-frame nightly 3D** | Phase 24 RESEARCH | Docs-only local path chosen; optional macos job deferred |
| **`@remotion/three` React composition** | ADR evaluation | Post-v1.5 exploration |
| **PLAT-01/02** — Visual UI + publish portal | Platform milestone | Unchanged from prior milestones |

**Patterns to carry forward:**
- Shared verification modules (`milestone-audit.ts`, `requirement-traceability.ts`) centralize gate logic
- `--quick` verify scripts compose honestly; GL tests use `skipIf` rather than fake PASS
- Phase CONTEXT.md decisions document scope fences before planning

---

## 7. Getting Started

### Run tests

```bash
npm ci
npm test                                    # full suite (266 tests at close)
npm run verify:3d-render -- --quick       # CI-equivalent 3D render gate
node scripts/audit-milestone-v1.5.mjs       # milestone audit
```

### Local full 3D TLS publish (requires headless GL, e.g. macOS)

```bash
npm run test -- tests/tls-production-export.test.ts --testNamePattern="3D production export"
```

Output lands in `.artifacts/production/tls/` (`tls-production.mp4`, manifest v1.1.0).

### Key directories

| Path | Purpose |
|------|---------|
| `src/render/headless/` | Backend resolver, scene builder, PNG capture |
| `src/client/viz/` | R3F catalog components + `viz-mesh-spec.ts` |
| `src/render/export/` | `generateTlsProductionArtifacts` |
| `src/fixtures/tls-production-scene-spec.json` | Publish canonical SceneSpec (236 frames) |
| `scripts/verify-*.mjs` | Machine-readable verification gates |
| `docs/tls-crew-walkthrough.md` | End-to-end crew pipeline + render backend policy |
| `docs/style-bible.md` | Visual tokens (colors, lighting, camera) |
| `.planning/milestones/v1.5-*` | Archived roadmap, requirements, audit |

### Where to look first

1. **`docs/tls-crew-walkthrough.md`** — operational guide for the full TLS cinematic pipeline
2. **`src/render/headless/resolve-production-render-backend.ts`** — backend selection logic
3. **`src/client/viz/viz-mesh-spec.ts`** — shared geometry between R3F and headless
4. **`src/render/export/generate-tls-production-artifacts.ts`** — production bundle generator
5. **`.planning/milestones/v1.5-MILESTONE-AUDIT.md`** — verification evidence index

### CI render policy (operators)

| Profile | Env | Backend | Frame source |
|---------|-----|---------|--------------|
| Local default | *(unset)* | `r3f-headless` | PNG |
| PR / nightly Ubuntu | `trace-hash` | `trace-hash` | Deterministic hash |

---

## Stats

- **Timeline:** 2026-05-31 → 2026-05-31 (single-day milestone execution)
- **Phases:** 4 / 4 complete
- **Plans:** 8 / 8 complete
- **Commits (v1.5 scope):** 11 (`d8a69cc`..`9003771`)
- **Files changed:** 80 (+4,565 / −303 lines in milestone range)
- **Tests at close:** 266 passing
- **Contributors:** 1

---

## Evidence Index

- `.artifacts/verification/phase21/headless-capture.json`
- `.artifacts/verification/phase22/scene-parity.json`
- `.artifacts/verification/phase23/tls-3d-production.json`
- `.artifacts/verification/phase24/3d-render.json`
- `.artifacts/verification/phase24/milestone-close.json`
- `.artifacts/production/tls/production-manifest.json`
- `.planning/milestones/v1.5-MILESTONE-AUDIT.md`

---

*For the next release cycle, run `/gsd-new-milestone`.*
