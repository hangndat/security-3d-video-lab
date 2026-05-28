import { describe, expect, it } from "vitest";

import {
  createPresetRegistry,
  resolveCameraCue
} from "../src/engine/camera/preset-registry.js";

describe("camera preset registry", () => {
  const registry = createPresetRegistry({
    version: "1.0.0",
    presets: {
      wide: {
        fov: 70,
        distance: 10,
        tilt: 0,
        yaw: 0
      },
      focusPacket: {
        fov: 55,
        distance: 8,
        tilt: 5,
        yaw: 10,
        focus: {
          type: "packet-id",
          value: "packet-client-hello"
        }
      }
    }
  });

  it("resolves timeline-cued presets only when transition cue is explicit", () => {
    expect(() =>
      resolveCameraCue(
        {
          id: "tls-camera-cut",
          track: "camera",
          startFrame: 30,
          duration: 20,
          easing: "linear",
          payload: {
            preset: "wide"
          }
        },
        registry
      )
    ).toThrowError(/transition/i);

    const resolved = resolveCameraCue(
      {
        id: "tls-camera-cut",
        track: "camera",
        startFrame: 30,
        duration: 20,
        easing: "linear",
        payload: {
          preset: "wide",
          transition: "cut"
        }
      },
      registry
    );

    expect(resolved.transition).toBe("cut");
    expect(resolved.shot.fov).toBe(70);
  });

  it("hard-fails out-of-bounds overrides with structured hints", () => {
    expect(() =>
      resolveCameraCue(
        {
          id: "tls-camera-zoom",
          track: "camera",
          startFrame: 60,
          duration: 20,
          easing: "linear",
          payload: {
            preset: "wide",
            transition: "cut",
            overrides: {
              fov: 200
            }
          }
        },
        registry
      )
    ).toThrowError(/fov|bounds|20-120/i);
  });

  it("resolves packet focus references deterministically from known IDs and groups", () => {
    const resolved = resolveCameraCue(
      {
        id: "tls-camera-follow",
        track: "camera",
        startFrame: 90,
        duration: 20,
        easing: "linear",
        payload: {
          preset: "focusPacket",
          transition: "ease-in",
          focus: {
            type: "group",
            value: "handshake"
          }
        }
      },
      registry,
      {
        packetIds: ["packet-client-hello"],
        packetGroups: ["handshake"]
      }
    );

    expect(resolved.shot.focus).toEqual({
      type: "group",
      value: "handshake"
    });
  });
});
