import { STYLE_TOKENS } from "../style-tokens.js";
import { HUD_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizHudActorLabelProps = {
  actors: Array<{ id: string; label: string }>;
  visible: boolean;
};

const SPEC = HUD_MESH_SPEC["viz-hud-actor-label"];

export function VizHudActorLabel({ actors, visible }: VizHudActorLabelProps) {
  if (!visible || actors.length === 0) {
    return null;
  }

  return (
    <group userData={{ hudFont: STYLE_TOKENS.fontHud, hudColor: STYLE_TOKENS.colorTextPrimary }}>
      {actors.map((actor, index) => (
        <group
          key={actor.id}
          position={[SPEC.origin[0], SPEC.origin[1] - index * SPEC.rowStep!, SPEC.origin[2]]}
          userData={{ label: actor.label }}
        >
          <mesh>
            <planeGeometry args={[...SPEC.planeSize]} />
            <meshBasicMaterial color={STYLE_TOKENS[SPEC.colorToken]} transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
