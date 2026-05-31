import { describe, expect, it } from "vitest";

import { validateSceneSpec } from "../src/engine/contracts/validate-scene-spec.js";

function validInput() {
  return {
    schemaVersion: "1.0.0",
    seed: "seed-01",
    sceneId: "scene-main",
    actors: [{ id: "actor-1", label: "client" }],
    packets: [{ id: "packet-1", route: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }] }],
    timeline: [
      {
        id: "tls-main-handshake",
        track: "packet",
        startFrame: 0,
        duration: 30,
        easing: "linear",
        payload: {}
      }
    ],
    totalFrames: 300,
    capabilities: {}
  };
}

describe("capability registry gating", () => {
  it("fails unknown capabilities with structured errors", () => {
    const result = validateSceneSpec({
      ...validInput(),
      capabilities: { unknownFeature: true }
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatchObject({
      path: "capabilities.unknownFeature",
      code: "UNKNOWN_CAPABILITY"
    });
  });

  it("fails disabled capabilities with structured errors", () => {
    const result = validateSceneSpec({
      ...validInput(),
      capabilities: { postMvpCameraOverrides: true }
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatchObject({
      path: "capabilities.postMvpCameraOverrides",
      code: "DISABLED_CAPABILITY"
    });
  });
});
