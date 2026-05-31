import { STYLE_TOKENS } from "../style-tokens.js";

export type VizHudActorLabelProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

export function VizHudActorLabel({ actors, visible }: VizHudActorLabelProps) {
  if (!visible || actors.length === 0) {
    return null;
  }

  return (
    <group userData={{ hudFont: STYLE_TOKENS.fontHud, hudColor: STYLE_TOKENS.colorTextPrimary }}>
      {actors.map((actor, index) => (
        <group key={actor.id} position={[-1.5, 1.2 - index * 0.25, 0]} userData={{ label: actor.label }}>
          <mesh>
            <planeGeometry args={[0.01, 0.01]} />
            <meshBasicMaterial color={STYLE_TOKENS.colorTextPrimary} transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
