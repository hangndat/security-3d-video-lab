import { STYLE_TOKENS } from "../style-tokens.js";
import {
  CERT_CHAIN_EMISSIVE,
  CERT_CHAIN_OFFSETS,
  CERT_MESH_SPEC
} from "../viz-mesh-spec.js";

export type VizCertProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

const SPEC = CERT_MESH_SPEC["viz-cert-chain"];

export function VizCertChain({ actors, visible }: VizCertProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS[SPEC.colorToken];
  const chainActors = actors.slice(0, 3);

  return (
    <group position={[...SPEC.groupPosition]}>
      {CERT_CHAIN_OFFSETS.map((xOffset, index) => (
        <group key={chainActors[index]?.id ?? `link-${index}`} position={[xOffset, 0, 0]}>
          <mesh>
            <boxGeometry args={[...SPEC.linkBoxSize!]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={CERT_CHAIN_EMISSIVE}
            />
          </mesh>
          {index < CERT_CHAIN_OFFSETS.length - 1 ? (
            <mesh position={[...SPEC.connectorOffset!]}>
              <boxGeometry args={[...SPEC.connectorSize!]} />
              <meshStandardMaterial color={STYLE_TOKENS[SPEC.connectorColorToken!]} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}
