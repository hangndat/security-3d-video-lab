import { STYLE_TOKENS } from "../style-tokens.js";
import type { CaptionTimingEntry } from "../../content/composition/generate-caption-timing-map.js";

export type VizHudBeatCaptionProps = {
  activeCaption: CaptionTimingEntry | null;
  visible: boolean;
};

export function VizHudBeatCaption({ activeCaption, visible }: VizHudBeatCaptionProps) {
  if (!visible || !activeCaption) {
    return null;
  }

  return (
    <group position={[0, -1.2, 0]} userData={{ caption: activeCaption.scriptIntent, beatId: activeCaption.beatId }}>
      <mesh>
        <planeGeometry args={[2.4, 0.35]} />
        <meshBasicMaterial color={STYLE_TOKENS.colorBgPanel} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}
