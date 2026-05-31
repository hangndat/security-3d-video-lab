import { STYLE_TOKENS } from "../style-tokens.js";
import {
  CERT_LABEL_PANEL_OPACITY,
  CERT_MESH_SPEC,
  CERT_SINGLE_EMISSIVE
} from "../viz-mesh-spec.js";

export type VizCertProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

const SPEC = CERT_MESH_SPEC["viz-cert-single"];

export function VizCertSingle({ actors, visible }: VizCertProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS[SPEC.colorToken];
  const serverActor = actors.find(
    (actor) =>
      actor.label.toLowerCase().includes("server") || actor.id.toLowerCase().includes("server")
  );
  const label = serverActor?.label ?? actors[0]?.label ?? "cert";

  return (
    <group position={[...SPEC.groupPosition]}>
      <mesh>
        <boxGeometry args={[...SPEC.boxSize!]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={CERT_SINGLE_EMISSIVE}
        />
      </mesh>
      <mesh position={[...SPEC.labelPanelOffset!]}>
        <planeGeometry args={[...SPEC.labelPanelSize!]} />
        <meshBasicMaterial
          color={STYLE_TOKENS[SPEC.panelColorToken!]}
          transparent
          opacity={CERT_LABEL_PANEL_OPACITY}
        />
      </mesh>
      <group userData={{ certLabel: label }} />
    </group>
  );
}
