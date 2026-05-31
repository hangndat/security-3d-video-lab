export interface PacingPreset {
  id: string;
  label: string;
  holdFramesBetweenBeats: number;
  cameraTransition: string;
  maxBeatOverlapFrames: number;
}

export const PACING_PRESETS: Record<string, PacingPreset> = {
  "documentary-standard": {
    id: "documentary-standard",
    label: "Documentary standard pacing",
    holdFramesBetweenBeats: 10,
    cameraTransition: "ease-in-out",
    maxBeatOverlapFrames: 14
  },
  "security-dense": {
    id: "security-dense",
    label: "Dense security explainer pacing",
    holdFramesBetweenBeats: 6,
    cameraTransition: "cut",
    maxBeatOverlapFrames: 10
  }
};

export function isKnownPacingPreset(presetId: string): boolean {
  return Object.hasOwn(PACING_PRESETS, presetId);
}

export function validatePacingPresetId(presetId: string): string | null {
  if (!isKnownPacingPreset(presetId)) {
    return `Unknown pacing preset '${presetId}'.`;
  }
  return null;
}
