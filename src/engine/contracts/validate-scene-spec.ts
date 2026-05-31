import { ZodError } from "zod";

import { validateCapabilities } from "./capability-registry.js";
import { SUPPORTED_SCHEMA_VERSION, type SceneSpec, sceneSpecSchema } from "./scene-spec.js";
import type { ValidationError, ValidationResult } from "./validation-errors.js";

function toPath(path: Array<string | number>): string {
  return path.length === 0 ? "root" : path.join(".");
}

function zodIssueCodeToValidationCode(code: string): ValidationError["code"] {
  if (code === "unrecognized_keys") {
    return "UNKNOWN_FIELD";
  }
  if (code === "invalid_type") {
    return "MISSING_REQUIRED_FIELD";
  }
  return "INVALID_CONSTRAINT";
}

function mapZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: toPath(issue.path),
    code: zodIssueCodeToValidationCode(issue.code),
    message: issue.message,
    hint:
      issue.code === "unrecognized_keys"
        ? "Remove unknown fields from SceneSpec."
        : "Check required fields and numeric bounds in SceneSpec."
  }));
}

export function validateSceneSpec(input: unknown): ValidationResult<SceneSpec> {
  const raw = input as Record<string, unknown>;
  if (raw && typeof raw === "object" && raw.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return {
      ok: false,
      errors: [
        {
          path: "schemaVersion",
          code: "UNSUPPORTED_SCHEMA_VERSION",
          message: `Unsupported schemaVersion '${String(raw.schemaVersion)}'.`,
          hint: `Pin schemaVersion to '${SUPPORTED_SCHEMA_VERSION}' for MVP compatibility.`
        }
      ]
    };
  }

  const parsed = sceneSpecSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: mapZodErrors(parsed.error)
    };
  }

  const capabilityErrors = validateCapabilities(parsed.data.capabilities);
  if (capabilityErrors.length > 0) {
    return {
      ok: false,
      errors: capabilityErrors
    };
  }

  return {
    ok: true,
    value: parsed.data,
    errors: []
  };
}
