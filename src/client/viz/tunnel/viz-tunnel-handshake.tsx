import { STYLE_TOKENS } from "../style-tokens.js";
import { TUNNEL_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizTunnelHandshakeProps = {
  visible: boolean;
};

const SPEC = TUNNEL_MESH_SPEC["viz-tunnel-handshake"];

export function VizTunnelHandshake({ visible }: VizTunnelHandshakeProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS[SPEC.colorToken];
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[SPEC.radius, SPEC.tube, SPEC.radialSegments, SPEC.tubularSegments]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={STYLE_TOKENS[SPEC.emissiveToken] * SPEC.emissiveScale}
        wireframe
      />
    </mesh>
  );
}
