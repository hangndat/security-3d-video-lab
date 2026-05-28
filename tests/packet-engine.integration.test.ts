import { describe, expect, it } from "vitest";

import goldenSceneSpec from "../src/fixtures/golden-scene-spec.json";
import { interpolateRoutePosition } from "../src/client/packet/packet-interpolator.js";
import {
  buildPacketFrameState,
  type PacketLifecycleEvents
} from "../src/engine/packet/packet-state.js";

describe("packet engine determinism", () => {
  it("interpolates packet positions deterministically over route segments", () => {
    const route = goldenSceneSpec.packets[0].route;
    const first = interpolateRoutePosition(route, 0.4);
    const second = interpolateRoutePosition(route, 0.4);

    expect(first).toEqual(second);
    expect(first).toEqual({ x: 0.8, y: 0.4, z: 0 });
  });

  it("applies spawn events with stable parent/child lineage across repeated runs", () => {
    const events: PacketLifecycleEvents = {
      spawns: [
        {
          frame: 15,
          parentId: "packet-client-hello",
          childId: "packet-server-hello",
          route: [
            { x: 2, y: 1, z: 0 },
            { x: 4, y: 2, z: 0 }
          ],
          group: "handshake"
        }
      ],
      terminals: []
    };

    const first = buildPacketFrameState(goldenSceneSpec, 20, events);
    const second = buildPacketFrameState(goldenSceneSpec, 20, events);

    expect(first).toEqual(second);
    expect(first.packets["packet-server-hello"].lineage).toEqual([
      "packet-client-hello",
      "packet-server-hello"
    ]);
  });

  it("applies deterministic terminal flags and stops packet transitions", () => {
    const events: PacketLifecycleEvents = {
      spawns: [],
      terminals: [
        {
          frame: 40,
          packetId: "packet-client-hello",
          reason: "delivered"
        }
      ]
    };

    const stateAfterTerminal = buildPacketFrameState(goldenSceneSpec, 60, events);
    const packet = stateAfterTerminal.packets["packet-client-hello"];

    expect(packet.terminal).toBe(true);
    expect(packet.visual).toEqual({
      trailActive: false,
      dimmed: true
    });
    expect(packet.progress).toBe(1);
  });
});
