import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { scheduleFrame } from "../src/engine/timeline/scheduler.js";

describe("timeline scheduler determinism", () => {
  it("returns strict-equal state for same SceneSpec, seed, and frame index", () => {
    const first = scheduleFrame(goldenSceneSpec, 60);
    const second = scheduleFrame(goldenSceneSpec, 60);

    expect(first).toEqual(second);
  });

  it("stably sorts by startFrame, track, id", () => {
    const spec = {
      ...goldenSceneSpec,
      timeline: [
        {
          id: "tls-packet-z",
          track: "packet",
          startFrame: 10,
          duration: 10,
          easing: "linear",
          payload: { packetId: "packet-client-hello" }
        },
        {
          id: "tls-camera-a",
          track: "camera",
          startFrame: 10,
          duration: 10,
          easing: "linear",
          payload: { preset: "wide" }
        },
        {
          id: "tls-packet-a",
          track: "packet",
          startFrame: 10,
          duration: 10,
          easing: "linear",
          payload: { packetId: "packet-client-hello" }
        },
        {
          id: "tls-main-handshake",
          track: "packet",
          startFrame: 0,
          duration: 10,
          easing: "linear",
          payload: { packetId: "packet-client-hello" }
        }
      ]
    };

    const frameState = scheduleFrame(spec, 10);
    expect(frameState.sortedTimelineIds).toEqual([
      "tls-main-handshake",
      "tls-camera-a",
      "tls-packet-a",
      "tls-packet-z"
    ]);
  });

  it("rejects duplicate event IDs with overlapping semantics", () => {
    const spec = {
      ...goldenSceneSpec,
      timeline: [
        {
          id: "tls-main-handshake",
          track: "packet",
          startFrame: 0,
          duration: 120,
          easing: "linear",
          payload: { packetId: "packet-client-hello" }
        },
        {
          id: "tls-main-handshake",
          track: "packet",
          startFrame: 20,
          duration: 30,
          easing: "linear",
          payload: { packetId: "packet-client-hello" }
        }
      ]
    };

    expect(() => scheduleFrame(spec, 25)).toThrowError(/duplicate|overlap/i);
  });
});
