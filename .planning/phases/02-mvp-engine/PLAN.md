# Phase 02 - MVP Engine

## Goal
Deliver reusable scene/timeline/camera/packet foundations and a reproducible render-export pipeline.

## Inputs
- `docs/brd.md`
- `docs/roadmap.md`

## Entry Criteria
- Phase 01 is marked `done` with verification evidence.
- Implementation workspace/toolchain is available.

## Execution
1. Bootstrap core engine and scene contracts.
2. Implement deterministic timeline scheduler.
3. Integrate camera system with timeline.
4. Implement reusable packet primitive.
5. Build integrated demo scene.
6. Validate render/export through Remotion + FFmpeg.

## Quality Gates
- `npm run test`
- `npm run render:demo`
- `npm run export:demo`

## Exit Criteria
- Core subsystems are integrated and deterministic.
- Demo render/export is reproducible and valid.

## Blockers
- Phase 01 is not yet done.
- Current workspace is planning-only (implementation files intentionally cleaned).

## Detailed Plan
See phase-local `CONTEXT.md` and `VERIFICATION.md`.
