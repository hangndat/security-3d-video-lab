import type { ValidationError } from "./validation-errors.js";

const CAPABILITY_REGISTRY = {
  postMvpCameraOverrides: {
    enabled: false,
    description: "Enable bounded post-MVP camera override controls."
  },
  postMvpPacketPhysics: {
    enabled: false,
    description: "Enable packet physics beyond deterministic MVP motion."
  }
} as const;

export type CapabilityKey = keyof typeof CAPABILITY_REGISTRY;

export function getCapabilityRegistry(): Readonly<typeof CAPABILITY_REGISTRY> {
  return CAPABILITY_REGISTRY;
}

export function validateCapabilities(flags: Record<string, boolean>): ValidationError[] {
  const errors: ValidationError[] = [];
  const registry = getCapabilityRegistry();

  for (const capability of Object.keys(flags)) {
    const definition = registry[capability as CapabilityKey];
    if (!definition) {
      errors.push({
        path: `capabilities.${capability}`,
        code: "UNKNOWN_CAPABILITY",
        message: `Capability '${capability}' is not registered.`,
        hint: "Declare capability keys in capability-registry.ts before using them."
      });
      continue;
    }

    if (flags[capability] && !definition.enabled) {
      errors.push({
        path: `capabilities.${capability}`,
        code: "DISABLED_CAPABILITY",
        message: `Capability '${capability}' is disabled for MVP.`,
        hint: "Set capability to false or explicitly enable it in the registry for a future phase."
      });
    }
  }

  return errors;
}
