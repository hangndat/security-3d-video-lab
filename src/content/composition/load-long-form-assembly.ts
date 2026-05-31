import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface BranchTransitionOverride {
  fromTopic: string;
  toTopic: string;
  presetId: string;
  rationale: string;
}

export interface AssemblyBranch {
  id: string;
  label: string;
  sequence: string[];
  transitionOverrides?: BranchTransitionOverride[];
}

export interface LongFormAssemblyProfile {
  schemaVersion: "1.0.0";
  slug: string;
  sequence?: string[];
  branches?: AssemblyBranch[];
  defaultBranchId?: string;
  targetWindowMinutes: {
    min: number;
    max: number;
  };
  defaultPacingPresetId?: string;
}

export interface ResolvedBranch {
  branchId: string | undefined;
  sequence: string[];
  transitionOverrides: BranchTransitionOverride[];
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

export function resolveBranch(
  profile: LongFormAssemblyProfile,
  branchId?: string
): ResolvedBranch {
  if (profile.branches && profile.branches.length > 0) {
    const resolvedId = branchId ?? profile.defaultBranchId;
    if (!resolvedId) {
      throw new Error(`Branch id required for branched assembly '${profile.slug}'.`);
    }

    const branch = profile.branches.find((entry) => entry.id === resolvedId);
    if (!branch) {
      throw new Error(`Unknown branch id '${resolvedId}' in assembly '${profile.slug}'.`);
    }

    return {
      branchId: resolvedId,
      sequence: branch.sequence,
      transitionOverrides: branch.transitionOverrides ?? []
    };
  }

  if (!profile.sequence) {
    throw new Error(`Assembly '${profile.slug}' has no sequence and no branches.`);
  }

  return {
    branchId: undefined,
    sequence: profile.sequence,
    transitionOverrides: []
  };
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
