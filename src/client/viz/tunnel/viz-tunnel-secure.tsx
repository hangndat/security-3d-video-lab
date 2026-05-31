import { STYLE_TOKENS } from "../style-tokens.js";
import { TUNNEL_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizTunnelSecureProps = {
  visible: boolean;
};

const SPEC = TUNNEL_MESH_SPEC["viz-tunnel-secure"];

export function VizTunnelSecure({ visible }: VizTunnelSecureProps) {
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
        emissiveIntensity={STYLE_TOKENS[SPEC.emissiveToken]}
        transparent
        opacity={SPEC.opacity}
      />
    </mesh>
  );
}
