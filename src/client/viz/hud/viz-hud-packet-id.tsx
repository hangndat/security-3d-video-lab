import { STYLE_TOKENS } from "../style-tokens.js";

export type VizHudPacketIdProps = {
  packetIds: string[];
  visible: boolean;
};

export function VizHudPacketId({ packetIds, visible }: VizHudPacketIdProps) {
  if (!visible || packetIds.length === 0) {
    return null;
  }

  return (
    <group userData={{ hudFont: STYLE_TOKENS.fontHudSm, hudColor: STYLE_TOKENS.colorTextMuted }}>
      {packetIds.map((packetId, index) => (
        <group key={packetId} position={[1.4, 0.8 - index * 0.2, 0]} userData={{ packetId }}>
          <mesh>
            <planeGeometry args={[0.01, 0.01]} />
            <meshBasicMaterial color={STYLE_TOKENS.colorTextMuted} transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
