import { STYLE_TOKENS } from "../style-tokens.js";
import { HUD_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizHudFrameCounterProps = {
  frame: number;
  visible: boolean;
};

const SPEC = HUD_MESH_SPEC["viz-hud-frame-counter"];

export function VizHudFrameCounter({ frame, visible }: VizHudFrameCounterProps) {
  if (!visible) {
    return null;
  }

  return (
    <group position={[...SPEC.position!]} userData={{ frame }}>
      <mesh>
        <planeGeometry args={[...SPEC.planeSize]} />
        <meshBasicMaterial color={STYLE_TOKENS[SPEC.colorToken]} transparent opacity={0} />
      </mesh>
    </group>
  );
}
