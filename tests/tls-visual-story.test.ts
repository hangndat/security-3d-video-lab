import { describe, expect, it } from "vitest";

import tlsProductionSceneSpec from "../src/fixtures/tls-production-scene-spec.json";
import { resolveVisibleActors } from "../src/client/viz/actor-anchors.js";
import { buildVizFrameState } from "../src/client/viz/build-viz-frame-state.js";
import { getComposePlan } from "../src/client/viz/compose-scene.js";
import { buildTlsOnlyCaptionMap } from "../src/verification/tls-production-rubric.js";

describe("TLS production visual story", () => {
  it("shows sniffer only during hook beat", () => {
    const hook = resolveVisibleActors(tlsProductionSceneSpec, 45);
    const hello = resolveVisibleActors(tlsProductionSceneSpec, 150);
    expect(hook.map((a) => a.id)).toContain("actor-attacker");
    expect(hello.map((a) => a.id)).not.toContain("actor-attacker");
  });

  it("exposes messageType label on active packet at client-hello frame", () => {
    const state = buildVizFrameState(tlsProductionSceneSpec, 150);
    const packet = state.packets.find((p) => p.id === "packet-client-hello");
    expect(packet?.messageLabel).toBe("ClientHello");
  });

  it("cleartext sniff route stays above link plane at hook midpoint", () => {
    const state = buildVizFrameState(tlsProductionSceneSpec, 45);
    const packet = state.packets.find((p) => p.id === "packet-cleartext-sniff");
    expect(packet?.position.y).toBeGreaterThan(2);
    expect(packet?.moduleId).toBe("viz-packet-threat");
  });

  it("app data rides below wire inside secure tunnel beat", () => {
    const state = buildVizFrameState(tlsProductionSceneSpec, 525);
    const packet = state.packets.find((p) => p.id === "packet-app-encrypted");
    expect(packet?.position.y).toBeLessThan(0);
    expect(packet?.moduleId).toBe("viz-packet-encrypted");
  });

  it("compose plan includes cert and tunnel modules on server-hello frame", () => {
    const captionMap = buildTlsOnlyCaptionMap(tlsProductionSceneSpec);
    const plan = getComposePlan(tlsProductionSceneSpec, 270, { captionMap });
    expect(plan.renderOrder).toContain("viz-cert-single");
    expect(plan.renderOrder).toContain("viz-tunnel-handshake");
  });
});
