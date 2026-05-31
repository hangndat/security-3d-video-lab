# SceneSpec Handoff

> Convert [shot list](shot-list.md) to SceneSpec v1.0.0 JSON. Validate with `validateSceneSpec` before handoff.

## Top-Level Checklist

| Field | Required | Notes |
|-------|----------|-------|
| `schemaVersion` | `"1.0.0"` | Fixed |
| `seed` | string | e.g. `tls-production-seed-005` |
| `sceneId` | string | e.g. `tls-production-scene` (publish) or `tls-golden-scene` (CI short) |
| `actors` | array ≥1 | From shot list; TLS publish uses browser, origin, sniffer |
| `packets` | array ≥1 | Each route ≥2 points; Y-axis carries narrative on TLS publish |
| `timeline` | array ≥1 | Cues aligned to beat frames; include `packetVariant` + `messageType` |
| `totalFrames` | int ≥1 | ≥ max beat endFrame + 1 (TLS publish: 600) |
| `capabilities` | object | MVP defaults below |

## Capabilities Defaults

```json
{
  "postMvpCameraOverrides": false,
  "postMvpPacketPhysics": false
}
```

## Timeline Cue Shape (TLS publish)

```json
{
  "id": "tls-client-hello-beat-cue",
  "track": "packet",
  "startFrame": 90,
  "duration": 120,
  "easing": "linear",
  "payload": {
    "packetId": "packet-client-hello",
    "packetVariant": "flow",
    "messageType": "ClientHello"
  }
}
```

- `track` is `"packet"` for packet-flow beats (MVP).
- `duration` = beat `endFrame - startFrame + 1` aligned to contract (minimum 1).
- `payload.packetId` must match a `packets[].id`.
- `payload.packetVariant`: `threat` | `flow` | `encrypted` — drives packet color module.
- `payload.messageType`: protocol label on active packet (headless billboard).

## Publish Example (TLS — `tls-production-scene-spec.json`)

Reference: `src/fixtures/tls-production-scene-spec.json`  
Shot list + spatial rules: `src/content/topics/tls/KICH-BAN.md`

| Actor id | Label | Anchor (production) |
|----------|-------|---------------------|
| `actor-client` | browser | x = -4 |
| `actor-server` | origin | x = 4 |
| `actor-attacker` | sniffer | x = 0, elevated — visible in viz through hook only |

| Packet id | Route Y role |
|-----------|----------------|
| `packet-cleartext-sniff` | Above link (~2.8–3.3) |
| `packet-client-hello` / `packet-server-hello` | On link (~0.25) |
| `packet-finished` | Center exchange (~0.55–0.75) |
| `packet-app-encrypted` | Inside tunnel (~-0.25) |

## CI Short Example (`golden-scene-spec.json`)

Minimal single-packet demo for PR gates — **not** the publish spatial story:

```json
{
  "schemaVersion": "1.0.0",
  "seed": "golden-seed-001",
  "sceneId": "tls-golden-scene",
  "actors": [{ "id": "actor-client", "label": "client" }],
  "packets": [
    {
      "id": "packet-client-hello",
      "route": [{ "x": 0, "y": 0, "z": 0 }, { "x": 2, "y": 1, "z": 0 }]
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

## Validation Step

1. Assemble draft SceneSpec JSON from shot list mappings.
2. Call `validateSceneSpec(draft)` from `src/engine/contracts/validate-scene-spec.ts`.
3. If `result.ok === false`, fix each `result.errors[]` entry (path, code, hint).
4. Do **not** hand off until validation passes.
5. TLS publish: run `npm run test -- tests/tls-visual-story.test.ts`.

```bash
npm run test -- tests/content-contracts.test.ts
npm run test -- tests/tls-production-export.test.ts
```

## Beat Alignment (TLS production)

| Beat id | Contract frames | Timeline cue | messageType |
|---------|-----------------|--------------|-------------|
| tls-hook | 0–89 | tls-hook-cue | plaintext-exposure |
| tls-client-hello-beat | 90–209 | tls-client-hello-beat-cue | ClientHello |
| tls-server-hello-beat | 210–329 | tls-server-hello-beat-cue | ServerHello |
| tls-finished-beat | 330–449 | tls-finished-beat-cue | Finished |
| tls-app-data-beat | 450–599 | tls-app-data-beat-cue | ApplicationData |

## Handoff Sign-Off

- [ ] `validateSceneSpec` passed
- [ ] Routes match KICH-BAN / shot-list spatial column
- [ ] No unknown top-level fields
- [ ] Capabilities use registered keys only
- [ ] Ready for Motion Designer module review and production render
