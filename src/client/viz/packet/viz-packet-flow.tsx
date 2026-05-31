import type { VizPacketRenderState } from "../build-viz-frame-state.js";
import { STYLE_TOKENS } from "../style-tokens.js";

export type VizPacketFlowProps = {
  packet: VizPacketRenderState;
};

export function VizPacketFlow({ packet }: VizPacketFlowProps) {
  const color = STYLE_TOKENS.colorAccentData;
  const opacity = packet.dimmed ? 0.35 : 1;
  return (
    <mesh position={[packet.position.x, packet.position.y, packet.position.z]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={STYLE_TOKENS.lightAccentGlowOpacity} transparent opacity={opacity} />
    </mesh>
  );
}
