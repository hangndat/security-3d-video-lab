import { STYLE_TOKENS } from "../style-tokens.js";

export type VizHudFrameCounterProps = {
  frame: number;
  visible: boolean;
};

export function VizHudFrameCounter({ frame, visible }: VizHudFrameCounterProps) {
  if (!visible) {
    return null;
  }

  return (
    <group position={[1.6, 1.3, 0]} userData={{ frame }}>
      <mesh>
        <planeGeometry args={[0.01, 0.01]} />
        <meshBasicMaterial color={STYLE_TOKENS.colorTextMuted} transparent opacity={0} />
      </mesh>
    </group>
  );
}
