import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface LongFormAssemblyProfile {
  schemaVersion: "1.0.0";
  slug: string;
  sequence: string[];
  targetWindowMinutes: {
    min: number;
    max: number;
  };
  defaultPacingPresetId?: string;
}

export const ASSEMBLIES_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../assemblies"
);

export function listAssemblySlugs(assembliesRoot: string = ASSEMBLIES_ROOT): string[] {
  return readdirSync(assembliesRoot)
    .filter((name) => name.endsWith(".json") && name !== "long-form-assembly.schema.json")
    .map((name) => name.replace(/\.json$/, ""));
}

export function loadLongFormAssemblyProfile(
  slug: string,
  assembliesRoot: string = ASSEMBLIES_ROOT
): LongFormAssemblyProfile {
  const assemblyPath = resolve(assembliesRoot, `${slug}.json`);
  let parsed: LongFormAssemblyProfile;

  try {
    parsed = JSON.parse(readFileSync(assemblyPath, "utf-8")) as LongFormAssemblyProfile;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown JSON parse error";
    throw new Error(`Invalid assembly JSON at ${assemblyPath}: ${detail}`);
  }

  if (parsed.schemaVersion !== "1.0.0") {
    throw new Error(`Unsupported assembly schemaVersion '${parsed.schemaVersion}'.`);
  }

  if (parsed.slug !== slug) {
    throw new Error(`Assembly slug mismatch: file '${slug}' contains '${parsed.slug}'.`);
  }

  return parsed;
}
