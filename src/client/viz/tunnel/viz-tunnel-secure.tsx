import { STYLE_TOKENS } from "../style-tokens.js";

export type VizTunnelSecureProps = {
  visible: boolean;
};

export function VizTunnelSecure({ visible }: VizTunnelSecureProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS.colorAccentCyan;
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.2, 0.12, 16, 48]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={STYLE_TOKENS.lightAccentGlowOpacity} transparent opacity={0.85} />
    </mesh>
  );
}
