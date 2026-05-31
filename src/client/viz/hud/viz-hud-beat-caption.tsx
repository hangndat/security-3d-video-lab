import { STYLE_TOKENS } from "../style-tokens.js";
import type { CaptionTimingEntry } from "../../content/composition/generate-caption-timing-map.js";
import { HUD_MESH_SPEC } from "../viz-mesh-spec.js";

export type VizHudBeatCaptionProps = {
  activeCaption: CaptionTimingEntry | null;
  visible: boolean;
};

const SPEC = HUD_MESH_SPEC["viz-hud-beat-caption"];

export function VizHudBeatCaption({ activeCaption, visible }: VizHudBeatCaptionProps) {
  if (!visible || !activeCaption) {
    return null;
  }

  return (
    <group
      position={[...SPEC.position!]}
      userData={{ caption: activeCaption.scriptIntent, beatId: activeCaption.beatId }}
    >
      <mesh>
        <planeGeometry args={[...SPEC.panelSize!]} />
        <meshBasicMaterial
          color={STYLE_TOKENS[SPEC.colorToken]}
          transparent
          opacity={SPEC.opacity}
        />
      </mesh>
    </group>
  );
}
