import { STYLE_TOKENS } from "../style-tokens.js";

export type VizCertProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

const CHAIN_OFFSETS = [-0.9, 0, 0.9] as const;

export function VizCertChain({ actors, visible }: VizCertProps) {
  if (!visible) {
    return null;
  }
  const color = STYLE_TOKENS.colorAccentTrust;
  const chainActors = actors.slice(0, 3);

  return (
    <group position={[0, 0.5, 0]}>
      {CHAIN_OFFSETS.map((xOffset, index) => (
        <group key={chainActors[index]?.id ?? `link-${index}`} position={[xOffset, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.65, 0.95, 0.05]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
          {index < CHAIN_OFFSETS.length - 1 ? (
            <mesh position={[0.45, 0, 0]}>
              <boxGeometry args={[0.2, 0.06, 0.04]} />
              <meshStandardMaterial color={STYLE_TOKENS.colorAccentNeutral} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  );
}
