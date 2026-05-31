import type { VizPacketRenderState } from "../build-viz-frame-state.js";
import { STYLE_TOKENS } from "../style-tokens.js";
import { PACKET_DIMMED_OPACITY, PACKET_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizPacketFlowProps = {
  packet: VizPacketRenderState;
};

const SPEC = PACKET_MESH_SPEC["viz-packet-flow"];

export function VizPacketFlow({ packet }: VizPacketFlowProps) {
  const color = STYLE_TOKENS[SPEC.colorToken];
  const opacity = packet.dimmed ? PACKET_DIMMED_OPACITY : 1;
  return (
    <mesh position={[packet.position.x, packet.position.y, packet.position.z]}>
      <sphereGeometry args={[SPEC.radius, SPEC.widthSegments, SPEC.heightSegments]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={STYLE_TOKENS[SPEC.emissiveToken]}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}
