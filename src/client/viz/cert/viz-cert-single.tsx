import { STYLE_TOKENS } from "../style-tokens.js";

export type VizCertProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

export function VizCertSingle({ actors, visible }: VizCertProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS.colorAccentTrust;
  const serverActor = actors.find(
    (actor) =>
      actor.label.toLowerCase().includes("server") || actor.id.toLowerCase().includes("server")
  );
  const label = serverActor?.label ?? actors[0]?.label ?? "cert";

  return (
    <group position={[0, 0.5, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1.1, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.7, 0.15]} />
        <meshBasicMaterial color={STYLE_TOKENS.colorBgPanel} transparent opacity={0.85} />
      </mesh>
      {/* label prop consumed by HUD in Phase 19; mesh uses trust token only */}
      <group userData={{ certLabel: label }} />
    </group>
  );
}
