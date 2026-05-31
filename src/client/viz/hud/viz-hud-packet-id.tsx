import { STYLE_TOKENS } from "../style-tokens.js";
import { HUD_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizHudPacketIdProps = {
  packetIds: string[];
  visible: boolean;
};

const SPEC = HUD_MESH_SPEC["viz-hud-packet-id"];

export function VizHudPacketId({ packetIds, visible }: VizHudPacketIdProps) {
  if (!visible || packetIds.length === 0) {
    return null;
  }

  return (
    <group userData={{ hudFont: STYLE_TOKENS.fontHudSm, hudColor: STYLE_TOKENS.colorTextMuted }}>
      {packetIds.map((packetId, index) => (
        <group
          key={packetId}
          position={[
            SPEC.origin![0],
            SPEC.origin![1] - index * SPEC.rowStep!,
            SPEC.origin![2]
          ]}
          userData={{ packetId }}
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
