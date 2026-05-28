import type { SceneSpec } from "../contracts/scene-spec.js";

type CameraCue = Extract<SceneSpec["timeline"][number], { track: string }>;

type FocusReference = {
  type: "packet-id" | "group";
  value: string;
};

type ShotPreset = {
  fov: number;
  distance: number;
  tilt: number;
  yaw: number;
  focus?: FocusReference;
};

type ShotPresetRegistryInput = {
  version: string;
  presets: Record<string, ShotPreset>;
};

type CuePayload = {
  preset?: string;
  transition?: string;
  overrides?: Partial<ShotPreset>;
  focus?: FocusReference;
};

type ResolutionContext = {
  packetIds?: string[];
  packetGroups?: string[];
};

export type ResolvedCameraCue = {
  transition: string;
  shot: ShotPreset;
  registryVersion: string;
};

const OVERRIDE_BOUNDS = {
  fov: { min: 20, max: 120 },
  distance: { min: 1, max: 50 },
  tilt: { min: -90, max: 90 },
  yaw: { min: -180, max: 180 }
} as const;

export function createPresetRegistry(input: ShotPresetRegistryInput): ShotPresetRegistryInput {
  return {
    version: input.version,
    presets: { ...input.presets }
  };
}

function validateOverrideBounds(overrides: Partial<ShotPreset>): void {
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || typeof value !== "number") {
      continue;
    }
    if (!(key in OVERRIDE_BOUNDS)) {
      continue;
    }
    const bounds = OVERRIDE_BOUNDS[key as keyof typeof OVERRIDE_BOUNDS];
    if (value < bounds.min || value > bounds.max) {
      throw new Error(
        `Override '${key}' out of bounds (${bounds.min}-${bounds.max}). Requested: ${value}.`
      );
    }
  }
}

function validateFocusReference(focus: FocusReference | undefined, context: ResolutionContext): void {
  if (!focus) {
    return;
  }
  if (focus.type === "packet-id") {
    if (!context.packetIds?.includes(focus.value)) {
      throw new Error(`Unknown packet-id focus reference '${focus.value}'.`);
    }
    return;
  }
  if (focus.type === "group" && !context.packetGroups?.includes(focus.value)) {
    throw new Error(`Unknown packet group focus reference '${focus.value}'.`);
  }
}

export function resolveCameraCue(
  cue: CameraCue,
  registry: ShotPresetRegistryInput,
  context: ResolutionContext = {}
): ResolvedCameraCue {
  const payload = cue.payload as CuePayload;
  if (!payload.preset) {
    throw new Error(`Camera cue '${cue.id}' must declare payload.preset.`);
  }
  if (!payload.transition) {
    throw new Error(`Camera cue '${cue.id}' must declare explicit payload.transition.`);
  }

  const basePreset = registry.presets[payload.preset];
  if (!basePreset) {
    throw new Error(
      `Camera cue '${cue.id}' references unknown preset '${payload.preset}' in registry ${registry.version}.`
    );
  }

  const overrides = payload.overrides ?? {};
  validateOverrideBounds(overrides);

  const resolvedFocus = payload.focus ?? basePreset.focus;
  validateFocusReference(resolvedFocus, context);

  return {
    transition: payload.transition,
    registryVersion: registry.version,
    shot: {
      ...basePreset,
      ...overrides,
      focus: resolvedFocus
    }
  };
}
