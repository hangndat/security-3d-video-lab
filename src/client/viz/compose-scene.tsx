import type { CaptionTimingMap } from "../../content/composition/generate-caption-timing-map.js";
import type { SceneSpec } from "../../engine/contracts/scene-spec.js";
import { resolveVisibleActors } from "./actor-anchors.js";
import { buildVizFrameState, type VizFrameState } from "./build-viz-frame-state.js";
import { resolveActiveCaption } from "./resolve-hud-caption.js";
import { resolveVizModuleStack, type VizModuleStack } from "./resolve-modules.js";
import { VIZ_REGISTRY } from "./registry.js";
import type { VizPacketRenderState } from "./build-viz-frame-state.js";

export type ComposeOptions = {
  captionMap?: CaptionTimingMap;
  showFrameCounter?: boolean;
};

export type ComposePlan = {
  vizFrameState: VizFrameState;
  moduleStack: VizModuleStack;
  renderOrder: string[];
  activeCaption: ReturnType<typeof resolveActiveCaption>;
  visibleActors: SceneSpec["actors"];
};

export function getComposePlan(
  sceneSpec: SceneSpec,
  frame: number,
  options: ComposeOptions = {}
): ComposePlan {
  const vizFrameState = buildVizFrameState(sceneSpec, frame);
  const moduleStack = resolveVizModuleStack(vizFrameState, sceneSpec, options);
  const activeCaption = resolveActiveCaption(options.captionMap, frame);
  return {
    vizFrameState,
    moduleStack,
    renderOrder: moduleStack.zOrder,
    activeCaption,
    visibleActors: resolveVisibleActors(sceneSpec, frame)
  };
}

export type VizSceneProps = {
  sceneSpec: SceneSpec;
  frame: number;
  captionMap?: CaptionTimingMap;
  showFrameCounter?: boolean;
};

function findPacketForModule(
  packets: VizPacketRenderState[],
  moduleId: string
): VizPacketRenderState | undefined {
  return packets.find((packet) => packet.moduleId === moduleId);
}

export function VizScene({ sceneSpec, frame, captionMap, showFrameCounter }: VizSceneProps) {
  const plan = getComposePlan(sceneSpec, frame, { captionMap, showFrameCounter });
  const { vizFrameState, renderOrder, activeCaption, visibleActors } = plan;

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

        if (moduleId.startsWith("viz-cert-")) {
          const CertComponent = Component as typeof VIZ_REGISTRY["viz-cert-single"];
          return <CertComponent key={moduleId} actors={sceneSpec.actors} visible={true} />;
        }

        if (moduleId === "viz-hud-actor-label") {
          const HudComponent = Component as typeof VIZ_REGISTRY["viz-hud-actor-label"];
          return <HudComponent key={moduleId} actors={visibleActors} visible={true} />;
        }

        if (moduleId === "viz-hud-beat-caption") {
          const HudComponent = Component as typeof VIZ_REGISTRY["viz-hud-beat-caption"];
          return <HudComponent key={moduleId} activeCaption={activeCaption} visible={true} />;
        }

        if (moduleId === "viz-hud-packet-id") {
          const HudComponent = Component as typeof VIZ_REGISTRY["viz-hud-packet-id"];
          return (
            <HudComponent
              key={moduleId}
              packetIds={vizFrameState.packets.map(
                (packet) => packet.messageLabel ?? packet.id
              )}
              visible={true}
            />
          );
        }

        if (moduleId === "viz-hud-frame-counter") {
          const HudComponent = Component as typeof VIZ_REGISTRY["viz-hud-frame-counter"];
          return <HudComponent key={moduleId} frame={frame} visible={true} />;
        }

        return null;
      })}
    </>
  );
}
