import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_REQUIREMENTS_PATH = resolve(REPO_ROOT, ".planning/REQUIREMENTS.md");
const DEFAULT_ROADMAP_PATH = resolve(REPO_ROOT, ".planning/ROADMAP.md");

export const ACTIVE_REQUIREMENT_ID_PATTERN =
  /^(CONT|AUTHR|CINE|NARR|VOIC|CREW|VER|PROD|VIZ)-\d+$/;

/** @deprecated Use ACTIVE_REQUIREMENT_ID_PATTERN for active milestone validation. */
export const V11_REQUIREMENT_ID_PATTERN = ACTIVE_REQUIREMENT_ID_PATTERN;

export const EXPECTED_V14_REQUIREMENT_IDS = [
  "VIZ-01",
  "VIZ-02",
  "VIZ-03",
  "VIZ-04",
  "PROD-01",
  "PROD-02",
  "VER-07"
] as const;

/** @deprecated Use EXPECTED_V14_REQUIREMENT_IDS for active milestone validation. */
export const EXPECTED_V13_REQUIREMENT_IDS = [
  "CREW-01",
  "CREW-02",
  "CREW-03",
  "CREW-04",
  "CREW-05",
  "CREW-06",
  "CREW-07",
  "VER-06"
] as const;

/** @deprecated Use EXPECTED_V13_REQUIREMENT_IDS for active milestone validation. */
export const EXPECTED_V12_REQUIREMENT_IDS = [
  "CONT-04",
  "CONT-05",
  "CONT-06",
  "NARR-01",
  "NARR-02",
  "VOIC-01",
  "VOIC-02",
  "VER-04",
  "VER-05"
] as const;

/** @deprecated Use EXPECTED_V13_REQUIREMENT_IDS for active milestone validation. */
export const EXPECTED_V11_REQUIREMENT_IDS = [
  "CONT-01",
  "CONT-02",
  "CONT-03",
  "AUTHR-01",
  "AUTHR-02",
  "AUTHR-03",
  "CINE-01",
  "CINE-02",
  "CINE-03",
  "VER-01",
  "VER-02",
  "VER-03"
] as const;

export const EXPECTED_PHASE_REQUIREMENTS: Record<string, readonly string[]> = {
  "17": ["VIZ-01", "VIZ-02"],
  "18": ["VIZ-03", "VIZ-04"],
  "19": ["PROD-01"],
  "20": ["PROD-02", "VER-07"]
};

export interface TraceabilityRow {
  requirementId: string;
  phase: string;
  status: string;
}

export interface RequirementCheckbox {
  requirementId: string;
  checked: boolean;
  line: number;
}

export interface TraceabilityIssue {
  path: string;
  reason: string;
}

export interface TraceabilityValidationResult {
  errors: TraceabilityIssue[];
  warnings: TraceabilityIssue[];
  unmappedCount: number;
  pendingCount: number;
  rows: TraceabilityRow[];
  skipped?: boolean;
  skipReason?: string;
}

export function isBetweenMilestones(repoRoot: string = REPO_ROOT): boolean {
  return !existsSync(resolve(repoRoot, ".planning/REQUIREMENTS.md"));
}

export interface ValidateTraceabilityOptions {
  requirementsContent?: string;
  roadmapContent?: string;
  milestoneClose?: boolean;
}

export function parseActiveRequirementIds(content: string): string[] {
  const ids = new Set<string>();
  const boldMatches = content.matchAll(/\*\*([A-Z]+-\d+)\*\*/g);
  for (const match of boldMatches) {
    const id = match[1]!;
    if (ACTIVE_REQUIREMENT_ID_PATTERN.test(id) && !id.startsWith("PLAT-")) {
      ids.add(id);
    }
  }
  return [...ids].filter((id) =>
    EXPECTED_V14_REQUIREMENT_IDS.includes(id as (typeof EXPECTED_V14_REQUIREMENT_IDS)[number])
  );
}

/** @deprecated Use parseActiveRequirementIds for active milestone validation. */
export function parseV12RequirementIds(content: string): string[] {
  return parseActiveRequirementIds(content);
}

/** @deprecated Use parseV12RequirementIds for active milestone validation. */
export function parseV11RequirementIds(content: string): string[] {
  const ids = new Set<string>();
  const boldMatches = content.matchAll(/\*\*([A-Z]+-\d+)\*\*/g);
  for (const match of boldMatches) {
    const id = match[1]!;
    if (V11_REQUIREMENT_ID_PATTERN.test(id) && !id.startsWith("PLAT-")) {
      ids.add(id);
    }
  }
  return [...ids];
}

export function parseTraceabilityTable(content: string): TraceabilityRow[] {
  const lines = content.split("\n");
  const tableStart = lines.findIndex((line) => line.trim() === "## Traceability");
  if (tableStart === -1) {
    return [];
  }

  const rows: TraceabilityRow[] = [];
  for (let index = tableStart + 1; index < lines.length; index += 1) {
    const line = lines[index]!.trim();
    if (!line.startsWith("|")) {
      if (rows.length > 0 && !line.startsWith("*")) {
        break;
      }
      continue;
    }
    if (line.includes("---") || line.includes("Requirement")) {
      continue;
    }

    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    if (cells.length < 3) {
      continue;
    }

    rows.push({
      requirementId: cells[0]!,
      phase: cells[1]!,
      status: cells[2]!
    });
  }

  return rows;
}

export function parseRequirementCheckboxes(content: string): RequirementCheckbox[] {
  const checkboxes: RequirementCheckbox[] = [];
  const lines = content.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const match = line.match(/^- \[([ xX])\] \*\*([A-Z]+-\d+)\*\*:/);
    if (!match) {
      continue;
    }
    checkboxes.push({
      requirementId: match[2]!,
      checked: match[1]!.toLowerCase() === "x",
      line: index + 1
    });
  }
  return checkboxes;
}

export function parseRoadmapPhaseRequirements(content: string): Record<string, string[]> {
  const phaseRequirements: Record<string, string[]> = {};

  for (const phaseNumber of Object.keys(EXPECTED_PHASE_REQUIREMENTS)) {
    const pattern = new RegExp(
      `Phase ${phaseNumber}:[\\s\\S]*?\\*\\*Requirements:\\*\\* ([^\\n]+)`,
      "m"
    );
    const match = content.match(pattern);
    if (!match) {
      phaseRequirements[phaseNumber] = [];
      continue;
    }
    phaseRequirements[phaseNumber] = [...match[1].matchAll(/`([A-Z]+-\d+)`/g)]
      .map((item) => item[1]!)
      .sort();
  }

  return phaseRequirements;
}

function parseCoverageUnmappedCount(content: string): number | null {
  const match = content.match(/Unmapped:\s*(\d+)/);
  if (!match) {
    return null;
  }
  return Number(match[1]);
}

export function validateRequirementTraceability(
  options: ValidateTraceabilityOptions = {}
): TraceabilityValidationResult {
  if (options.requirementsContent === undefined && isBetweenMilestones()) {
    return {
      errors: [],
      warnings: [
        {
          path: ".planning/REQUIREMENTS.md",
          reason:
            "Between milestones: no active requirements file; traceability validation skipped until v1.2 REQUIREMENTS.md is created."
        }
      ],
      unmappedCount: 0,
      pendingCount: 0,
      rows: [],
      skipped: true,
      skipReason: "between_milestones"
    };
  }

  const requirementsContent =
    options.requirementsContent ?? readFileSync(DEFAULT_REQUIREMENTS_PATH, "utf-8");
  const roadmapContent = options.roadmapContent ?? readFileSync(DEFAULT_ROADMAP_PATH, "utf-8");

  const errors: TraceabilityIssue[] = [];
  const warnings: TraceabilityIssue[] = [];
  const rows = parseTraceabilityTable(requirementsContent);
  const checkboxes = parseRequirementCheckboxes(requirementsContent);
  const roadmapPhases = parseRoadmapPhaseRequirements(roadmapContent);

  const rowById = new Map(rows.map((row) => [row.requirementId, row]));
  const checkboxById = new Map(checkboxes.map((item) => [item.requirementId, item]));

  let unmappedCount = parseCoverageUnmappedCount(requirementsContent);
  if (unmappedCount === null) {
    errors.push({
      path: ".planning/REQUIREMENTS.md",
      reason: "Coverage block must declare 'Unmapped: 0'."
    });
    unmappedCount = -1;
  } else if (unmappedCount !== 0) {
    errors.push({
      path: ".planning/REQUIREMENTS.md",
      reason: `Unmapped requirement count must be 0 (found ${unmappedCount}).`
    });
  }

  for (const requirementId of EXPECTED_V14_REQUIREMENT_IDS) {
    if (!rowById.has(requirementId)) {
      errors.push({
        path: ".planning/REQUIREMENTS.md#traceability",
        reason: `Missing traceability row for '${requirementId}'.`
      });
    }
  }

  const seen = new Set<string>();
  for (const row of rows) {
    if (!ACTIVE_REQUIREMENT_ID_PATTERN.test(row.requirementId)) {
      continue;
    }
    if (seen.has(row.requirementId)) {
      errors.push({
        path: ".planning/REQUIREMENTS.md#traceability",
        reason: `Duplicate traceability row for '${row.requirementId}'.`
      });
    }
    seen.add(row.requirementId);

    const phaseNumber = row.phase.replace(/^Phase\s+/, "");
    const expected = EXPECTED_PHASE_REQUIREMENTS[phaseNumber];
    if (!expected?.includes(row.requirementId)) {
      errors.push({
        path: `.planning/REQUIREMENTS.md#traceability/${row.requirementId}`,
        reason: `Requirement '${row.requirementId}' is not listed under Phase ${phaseNumber} in ROADMAP.md.`
      });
    }
  }

  for (const [phaseNumber, expectedIds] of Object.entries(EXPECTED_PHASE_REQUIREMENTS)) {
    const roadmapIds = [...(roadmapPhases[phaseNumber] ?? [])].sort();
    const expectedSorted = [...expectedIds].sort();
    if (roadmapIds.join(",") !== expectedSorted.join(",")) {
      errors.push({
        path: `.planning/ROADMAP.md#phase-${phaseNumber}`,
        reason: `ROADMAP requirements [${roadmapIds.join(", ")}] do not match expected [${expectedSorted.join(", ")}].`
      });
    }
  }

  let pendingCount = 0;
  for (const requirementId of EXPECTED_V14_REQUIREMENT_IDS) {
    const row = rowById.get(requirementId);
    if (!row) {
      continue;
    }
    if (row.status.toLowerCase() === "pending") {
      pendingCount += 1;
      if (options.milestoneClose) {
        errors.push({
          path: `.planning/REQUIREMENTS.md#traceability/${requirementId}`,
          reason: `Requirement '${requirementId}' is still Pending at milestone close.`
        });
      }
    }

    const checkbox = checkboxById.get(requirementId);
    if (!checkbox) {
      warnings.push({
        path: `.planning/REQUIREMENTS.md`,
        reason: `Missing checkbox entry for '${requirementId}'.`
      });
      continue;
    }

    const tableComplete = row.status.toLowerCase() === "complete";
    if (tableComplete && !checkbox.checked) {
      errors.push({
        path: `.planning/REQUIREMENTS.md:${checkbox.line}`,
        reason: `Checkbox is unchecked but traceability status is Complete for '${requirementId}'.`
      });
    }
    if (!tableComplete && checkbox.checked) {
      errors.push({
        path: `.planning/REQUIREMENTS.md:${checkbox.line}`,
        reason: `Checkbox is checked but traceability status is '${row.status}' for '${requirementId}'.`
      });
    }
  }

  const activeIdsInTable = rows
    .map((row) => row.requirementId)
    .filter((id) =>
      EXPECTED_V14_REQUIREMENT_IDS.includes(id as (typeof EXPECTED_V14_REQUIREMENT_IDS)[number])
    );
  if (unmappedCount === 0 && activeIdsInTable.length !== EXPECTED_V14_REQUIREMENT_IDS.length) {
    errors.push({
      path: ".planning/REQUIREMENTS.md#traceability",
      reason: `Expected ${EXPECTED_V14_REQUIREMENT_IDS.length} v1.4 rows, found ${activeIdsInTable.length}.`
    });
  }

  return {
    errors,
    warnings,
    unmappedCount: unmappedCount === -1 ? EXPECTED_V14_REQUIREMENT_IDS.length : unmappedCount,
    pendingCount,
    rows
  };
}
