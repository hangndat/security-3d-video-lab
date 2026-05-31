/** Style bible tokens for R3F modules — see docs/style-bible.md */
export const STYLE_TOKENS = {
  colorBgDeep: "#0a0e17",
  colorBgPanel: "#121a2b",
  colorAccentData: "#f5a623",
  colorAccentCyan: "#4ecdc4",
  colorAccentTrust: "#3dffa8",
  colorAccentThreat: "#ff4757",
  colorAccentNeutral: "#8892a8",
  colorTextPrimary: "#e8ecf4",
  colorTextMuted: "#6b7894",
  fontHud: '"JetBrains Mono", "SF Mono", monospace',
  fontHudMd: 14,
  fontHudSm: 12,
  cameraFovIntimate: 35,
  lightRimIntensity: 0.85,
  lightAccentGlowOpacity: 0.4,
  lightThreatPulseOpacity: 0.6,
  lightKeyIntensity: 0.35,
  lightAmbientColor: "#0a0e17",
  lightAmbientIntensity: 0.15,
  cameraPositionDefault: [0, 2, 8] as const,
  keyLightPosition: [5, 8, 5] as const
} as const;

export type StyleTokenKey = keyof typeof STYLE_TOKENS;
