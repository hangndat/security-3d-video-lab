# SceneSpec Handoff

> Convert [shot list](shot-list.md) to SceneSpec v1.0.0 JSON. Validate with `validateSceneSpec` before handoff.

## Top-Level Checklist

| Field | Required | Notes |
|-------|----------|-------|
| `schemaVersion` | `"1.0.0"` | Fixed |
| `seed` | string | e.g. `golden-seed-001` or `{topic}-seed-001` |
| `sceneId` | string | e.g. `tls-golden-scene` |
| `actors` | array ≥1 | From shot list actor column |
| `packets` | array ≥1 | Each route ≥2 points |
| `timeline` | array ≥1 | Cues aligned to beat frames |
| `totalFrames` | int ≥1 | ≥ max beat endFrame |
| `capabilities` | object | MVP defaults below |

## Capabilities Defaults

```json
{
  "postMvpCameraOverrides": false,
  "postMvpPacketPhysics": false
}
```

## Timeline Cue Shape

```json
{
  "id": "tls-main-handshake",
  "track": "packet",
  "startFrame": 0,
  "duration": 120,
  "easing": "linear",
  "payload": {
    "packetId": "packet-client-hello"
  }
}
```

- `track` is `"packet"` for packet-flow beats (MVP).
- `duration` = beat `endFrame - startFrame` (minimum 1).
- `payload.packetId` must match a `packets[].id`.

## Example Fragment (TLS — matches golden-scene-spec)

Reference: `src/fixtures/golden-scene-spec.json`

```json
{
  "schemaVersion": "1.0.0",
  "seed": "golden-seed-001",
  "sceneId": "tls-golden-scene",
  "actors": [
    { "id": "actor-client", "label": "client" }
  ],
  "packets": [
    {
      "id": "packet-client-hello",
      "route": [
        { "x": 0, "y": 0, "z": 0 },
        { "x": 2, "y": 1, "z": 0 }
      ]
    }
  ],
  "timeline": [
    {
      "id": "tls-main-handshake",
      "track": "packet",
      "startFrame": 0,
      "duration": 120,
      "easing": "linear",
      "payload": { "packetId": "packet-client-hello" }
    }
  ],
  "totalFrames": 360,
  "capabilities": {
    "postMvpCameraOverrides": false,
    "postMvpPacketPhysics": false
  }
}
```

Expand actors/packets/timeline for all beats in shot list; keep schema shape.

## Validation Step

1. Assemble draft SceneSpec JSON from shot list mappings.
2. Call `validateSceneSpec(draft)` from `src/engine/contracts/validate-scene-spec.ts`.
3. If `result.ok === false`, fix each `result.errors[]` entry (path, code, hint).
4. Do **not** hand off until validation passes.
5. Optional: compare structure against `golden-scene-spec.json` for TLS modules.

```bash
npm run test -- tests/content-contracts.test.ts
```

## Long-Form Assemblies

For multi-topic sequences, storyboard each topic SceneSpec separately, then stitch via:

- `src/content/composition/build-long-form-scene-spec.ts`
- Assemblies: `content-depth-long-v1.json`, `content-depth-branched-v1.json`

Stitching is documented in Creative Technologist skill (Phase 15).

## Beat Alignment (tls-hook example)

| Beat id | Contract frames | Timeline cue |
|---------|-----------------|--------------|
| tls-hook | 0–30 | startFrame: 0, duration: 30 |

Frame math must match Director beat sheet and contract `storyboardBeats`.

## Handoff Sign-Off

- [ ] `validateSceneSpec` passed
- [ ] No unknown top-level fields
- [ ] Capabilities use registered keys only
- [ ] Ready for Motion Designer module review or render pipeline
