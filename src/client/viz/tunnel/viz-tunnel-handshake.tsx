import { STYLE_TOKENS } from "../style-tokens.js";

export type VizTunnelHandshakeProps = {
  visible: boolean;
};

export function VizTunnelHandshake({ visible }: VizTunnelHandshakeProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS.colorAccentData;
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.2, 0.08, 16, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={STYLE_TOKENS.lightRimIntensity * 0.5} wireframe />
    </mesh>
  );
}
