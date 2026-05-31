import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { buildVizFrameState, type VizFrameState } from "./build-viz-frame-state.js";
import { resolveVizModuleStack, type VizModuleStack } from "./resolve-modules.js";
import { VIZ_REGISTRY } from "./registry.js";
import type { VizPacketRenderState } from "./build-viz-frame-state.js";

export type ComposePlan = {
  vizFrameState: VizFrameState;
  moduleStack: VizModuleStack;
  renderOrder: string[];
};

export function getComposePlan(sceneSpec: SceneSpec, frame: number): ComposePlan {
  const vizFrameState = buildVizFrameState(sceneSpec, frame);
  const moduleStack = resolveVizModuleStack(vizFrameState, sceneSpec);
  return {
    vizFrameState,
    moduleStack,
    renderOrder: moduleStack.zOrder
  };
}

export type VizSceneProps = {
  sceneSpec: SceneSpec;
  frame: number;
};

function findPacketForModule(
  packets: VizPacketRenderState[],
  moduleId: string
): VizPacketRenderState | undefined {
  return packets.find((packet) => packet.moduleId === moduleId);
}

export function VizScene({ sceneSpec, frame }: VizSceneProps) {
  const plan = getComposePlan(sceneSpec, frame);
  const { vizFrameState, renderOrder } = plan;

  return (
    <>
      {renderOrder.map((moduleId) => {
        const Component = VIZ_REGISTRY[moduleId as keyof typeof VIZ_REGISTRY];
        if (!Component) {
          return null;
        }

        if (moduleId.startsWith("viz-packet-")) {
          const packet = findPacketForModule(vizFrameState.packets, moduleId);
          if (!packet) {
            return null;
          }
          const PacketComponent = Component as typeof VIZ_REGISTRY["viz-packet-flow"];
          return <PacketComponent key={moduleId} packet={packet} />;
        }

        if (moduleId.startsWith("viz-tunnel-")) {
          const TunnelComponent = Component as typeof VIZ_REGISTRY["viz-tunnel-secure"];
          return <TunnelComponent key={moduleId} visible={true} />;
        }

        return null;
      })}
    </>
  );
}
