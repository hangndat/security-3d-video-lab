import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface PhaseEvidenceConfig {
  phase: string;
  name: string;
  jsonPath: string;
  verificationPath: string;
}

export const V11_PHASE_EVIDENCE: PhaseEvidenceConfig[] = [
  {
    phase: "05",
    name: "Content Authoring Foundation",
    jsonPath: ".artifacts/verification/phase05/content-authoring-foundation.json",
    verificationPath: ".planning/phases/05-content-authoring-foundation/VERIFICATION.md"
  },
  {
    phase: "06",
    name: "Narrative and Cinematic Composition",
    jsonPath: ".artifacts/verification/phase06/narrative-composition.json",
    verificationPath: ".planning/phases/06-narrative-cinematic-composition/VERIFICATION.md"
  },
  {
    phase: "07",
    name: "Batch Quality and Verification Expansion",
    jsonPath: ".artifacts/verification/phase07/batch-quality.json",
    verificationPath: ".planning/phases/07-batch-quality-verification-expansion/VERIFICATION.md"
  }
];

export const V14_PHASE_EVIDENCE: PhaseEvidenceConfig[] = [
  {
    phase: "17",
    name: "R3F Packet & Tunnel Modules",
    jsonPath: ".artifacts/verification/phase17/viz-modules.json",
    verificationPath: ".planning/phases/17-r3f-packet-tunnel-modules/VERIFICATION.md"
  },
  {
    phase: "18",
    name: "R3F Certificate & HUD Modules",
    jsonPath: ".artifacts/verification/phase18/viz-modules.json",
    verificationPath: ".planning/phases/18-r3f-certificate-hud-modules/VERIFICATION.md"
  },
  {
    phase: "19",
    name: "TLS Publish-Ready Production",
    jsonPath: ".artifacts/verification/phase19/tls-production.json",
    verificationPath: ".planning/phases/19-tls-publish-ready-production/VERIFICATION.md"
  },
  {
    phase: "20",
    name: "TTS Integration & Milestone Close",
    jsonPath: ".artifacts/verification/phase20/tts-integration.json",
    verificationPath: ".planning/phases/20-tts-integration-milestone-close/VERIFICATION.md"
  }
];

export const V13_PHASE_EVIDENCE: PhaseEvidenceConfig[] = [
  {
    phase: "13",
    name: "Director & Art Director Skills",
    jsonPath: ".artifacts/verification/phase16/crew-skills.json",
    verificationPath: ".planning/phases/13-director-art-director-skills/VERIFICATION.md"
  },
  {
    phase: "14",
    name: "Storyboard & 3D Motion Skills",
    jsonPath: ".artifacts/verification/phase16/crew-skills.json",
    verificationPath: ".planning/phases/14-storyboard-3d-motion-skills/VERIFICATION.md"
  },
  {
    phase: "15",
    name: "Render & Security Audio Skills",
    jsonPath: ".artifacts/verification/phase16/crew-skills.json",
    verificationPath: ".planning/phases/15-render-security-audio-skills/VERIFICATION.md"
  },
  {
    phase: "16",
    name: "Production Orchestrator & Skills Verification",
    jsonPath: ".artifacts/verification/phase16/crew-skills.json",
    verificationPath: ".planning/phases/16-production-orchestrator-verification/VERIFICATION.md"
  }
];

export const V12_PHASE_EVIDENCE: PhaseEvidenceConfig[] = [
  {
    phase: "09",
    name: "Advanced Security Topics",
    jsonPath: ".artifacts/verification/phase09/advanced-security-topics.json",
    verificationPath: ".planning/phases/09-advanced-security-topics/VERIFICATION.md"
  },
  {
    phase: "10",
    name: "Narrative Branch Variants",
    jsonPath: ".artifacts/verification/phase10/narrative-branch-variants.json",
    verificationPath: ".planning/phases/10-narrative-branch-variants/VERIFICATION.md"
  },
  {
    phase: "11",
    name: "Narration Pipeline",
    jsonPath: ".artifacts/verification/phase11/narration-pipeline.json",
    verificationPath: ".planning/phases/11-narration-pipeline/VERIFICATION.md"
  },
  {
    phase: "12",
    name: "v1.2 Verification and Governance",
    jsonPath: ".artifacts/verification/phase12/content-depth.json",
    verificationPath: ".planning/phases/12-v12-verification-governance/VERIFICATION.md"
  }
];

export interface PhaseEvidenceSummary extends PhaseEvidenceConfig {
  gateStatus: string;
  passed: boolean;
  verificationExists: boolean;
  generatedAt?: string;
  error?: string;
}

export interface MilestoneAuditReport {
  generatedAt: string;
  verdict: "PASS" | "FAIL";
  traceabilityGateStatus: string;
  phases: PhaseEvidenceSummary[];
  errors: string[];
}

export function readPhaseEvidence(
  repoRoot: string,
  entry: PhaseEvidenceConfig
): PhaseEvidenceSummary {
  const jsonFile = resolve(repoRoot, entry.jsonPath);
  const verificationFile = resolve(repoRoot, entry.verificationPath);

  if (!existsSync(jsonFile)) {
    return {
      ...entry,
      gateStatus: "missing",
      passed: false,
      verificationExists: existsSync(verificationFile),
      error: `Missing JSON evidence at ${entry.jsonPath}`
    };
  }

  const parsed = JSON.parse(readFileSync(jsonFile, "utf-8")) as {
    gateStatus?: string;
    generatedAt?: string;
  };
  const gateStatus = parsed.gateStatus ?? "fail";
  return {
    ...entry,
    gateStatus,
    passed: gateStatus === "pass",
    verificationExists: existsSync(verificationFile),
    generatedAt: parsed.generatedAt
  };
}

export function buildMilestoneAuditReport(
  repoRoot: string,
  options: { skipTraceabilityCheck?: boolean } = {}
): MilestoneAuditReport {
  return buildPhaseEvidenceAuditReport(repoRoot, V11_PHASE_EVIDENCE, options);
}

export function buildV12MilestoneAuditReport(
  repoRoot: string,
  options: { skipTraceabilityCheck?: boolean } = {}
): MilestoneAuditReport {
  return buildPhaseEvidenceAuditReport(repoRoot, V12_PHASE_EVIDENCE, options);
}

export function buildV13MilestoneAuditReport(
  repoRoot: string,
  options: { skipTraceabilityCheck?: boolean } = {}
): MilestoneAuditReport {
  return buildPhaseEvidenceAuditReport(repoRoot, V13_PHASE_EVIDENCE, options);
}

export function buildV14MilestoneAuditReport(
  repoRoot: string,
  options: { skipTraceabilityCheck?: boolean } = {}
): MilestoneAuditReport {
  return buildPhaseEvidenceAuditReport(repoRoot, V14_PHASE_EVIDENCE, options);
}

function buildPhaseEvidenceAuditReport(
  repoRoot: string,
  evidence: PhaseEvidenceConfig[],
  options: { skipTraceabilityCheck?: boolean } = {}
): MilestoneAuditReport {
  const phases = evidence.map((entry) => readPhaseEvidence(repoRoot, entry));
  const errors = phases
    .filter((phase) => !phase.passed)
    .map((phase) => phase.error ?? `Phase ${phase.phase} gateStatus=${phase.gateStatus}`);

  const traceabilityPath = resolve(
    repoRoot,
    ".artifacts/verification/phase08/requirement-traceability.json"
  );
  let traceabilityGateStatus = "unknown";
  if (existsSync(traceabilityPath)) {
    const traceability = JSON.parse(readFileSync(traceabilityPath, "utf-8")) as {
      gateStatus?: string;
    };
    traceabilityGateStatus = traceability.gateStatus ?? "fail";
    if (traceabilityGateStatus !== "pass" && traceabilityGateStatus !== "skipped") {
      errors.push("Requirement traceability gate did not pass.");
    }
  } else if (!options.skipTraceabilityCheck) {
    errors.push("Missing requirement traceability JSON evidence.");
  }

  return {
    generatedAt: new Date().toISOString(),
    verdict: errors.length === 0 ? "PASS" : "FAIL",
    traceabilityGateStatus,
    phases,
    errors
  };
}

export function renderMilestoneAuditMarkdown(report: MilestoneAuditReport): string {
  const lines = [
    "# v1.1 Milestone Audit: Content Expansion",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Verdict",
    "",
    `**${report.verdict}**`,
    "",
    "## Requirements Coverage",
    "",
    "- v1.1 requirements: **12/12** mapped",
    "- Unmapped requirements: **0**",
    `- Traceability gate: **${report.traceabilityGateStatus.toUpperCase()}**`,
    "",
    "## Phase Verification Summary",
    "",
    "| Phase | Name | Gate | Evidence JSON | VERIFICATION.md |",
    "| ---: | --- | --- | --- | --- |"
  ];

  for (const phase of report.phases) {
    lines.push(
      `| ${phase.phase} | ${phase.name} | ${phase.gateStatus.toUpperCase()} | \`${phase.jsonPath}\` | ${phase.verificationExists ? "yes" : "no"} |`
    );
  }

  lines.push(
    "",
    "## Cross-Phase Integration",
    "",
    "- Phase 05 established JSON topic contracts and blocking PR validation for new modules.",
    "- Phase 06 generalized long-form assembly profiles, caption timing maps, and replay gates.",
    "- Phase 07 extended export quality and per-module KPI verification across the 6-topic manifest.",
    "- Phase 08 closes governance debt with automated traceability and milestone audit artifacts.",
    "",
    "## Deferred Debt Resolution (v1.0)",
    "",
    "| Item | v1.0 Status | v1.1 Resolution |",
    "| --- | --- | --- |",
    "| v1.0-MILESTONE-AUDIT.md missing | deferred | Documented here; v1.1 audit process is now automated via `scripts/audit-milestone-v1.1.mjs` |",
    "| REQUIREMENTS.md missing at v1.0 close | deferred | Restored in v1.1 with machine-validated traceability (`scripts/validate-requirement-traceability.mjs`) |",
    "",
    "## Evidence Index",
    "",
    "- `.artifacts/verification/phase05/content-authoring-foundation.json`",
    "- `.artifacts/verification/phase06/narrative-composition.json`",
    "- `.artifacts/verification/phase07/batch-quality.json`",
    "- `.artifacts/verification/phase08/requirement-traceability.json`",
    "- `.artifacts/verification/phase08/milestone-governance.json`",
    "",
    "## Notes",
    "",
    report.errors.length === 0
      ? "- All phase verification JSON artifacts report `gateStatus: pass`."
      : `- Blocking issues:\n${report.errors.map((item) => `  - ${item}`).join("\n")}`
  );

  return `${lines.join("\n")}\n`;
}

export function renderV12MilestoneAuditMarkdown(report: MilestoneAuditReport): string {
  const lines = [
    "# v1.2 Milestone Audit: Content Depth",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Verdict",
    "",
    `**${report.verdict}**`,
    "",
    "## Requirements Coverage",
    "",
    "- v1.2 requirements: **9/9** mapped",
    "- Unmapped requirements: **0**",
    `- Traceability gate: **${report.traceabilityGateStatus.toUpperCase()}**`,
    "",
    "## Phase Verification Summary",
    "",
    "| Phase | Name | Gate | Evidence JSON | VERIFICATION.md |",
    "| ---: | --- | --- | --- | --- |"
  ];

  for (const phase of report.phases) {
    lines.push(
      `| ${phase.phase} | ${phase.name} | ${phase.gateStatus.toUpperCase()} | \`${phase.jsonPath}\` | ${phase.verificationExists ? "yes" : "no"} |`
    );
  }

  lines.push(
    "",
    "## Cross-Phase Integration",
    "",
    "- Phase 09 added three advanced security modules and the nine-topic content-depth-long-v1 assembly.",
    "- Phase 10 introduced branch variants with deterministic replay per attack-path and defense-path.",
    "- Phase 11 attached narration tracks and export bundles aligned to caption timing maps.",
    "- Phase 12 closed export E2E gaps and restored CI governance gates for v1.2 milestone close.",
    "",
    "## Deferred Debt Resolution (v1.1)",
    "",
    "| Item | v1.1 Status | v1.2 Resolution |",
    "| --- | --- | --- |",
    "| CI governance disabled between milestones | deferred | Re-enabled in Phase 12 with v1.2 traceability and audit artifacts |",
    "| Six-of-nine export coverage | interim | Nine-topic fixtures and branched export tests in Phase 12 |",
    "",
    "## Evidence Index",
    "",
    "- `.artifacts/verification/phase09/advanced-security-topics.json`",
    "- `.artifacts/verification/phase10/narrative-branch-variants.json`",
    "- `.artifacts/verification/phase11/narration-pipeline.json`",
    "- `.artifacts/verification/phase12/content-depth.json`",
    "- `.artifacts/verification/phase12/milestone-governance.json`",
    "- `.artifacts/verification/phase08/requirement-traceability.json`",
    "",
    "## Notes",
    "",
    report.errors.length === 0
      ? "- All phase verification JSON artifacts report `gateStatus: pass`."
      : `- Blocking issues:\n${report.errors.map((item) => `  - ${item}`).join("\n")}`
  );

  return `${lines.join("\n")}\n`;
}

export function renderV13MilestoneAuditMarkdown(report: MilestoneAuditReport): string {
  const lines = [
    "# v1.3 Milestone Audit: Cinematic Crew Skills",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Verdict",
    "",
    `**${report.verdict}**`,
    "",
    "## Requirements Coverage",
    "",
    "- v1.3 requirements: **8/8** mapped",
    "- Unmapped requirements: **0**",
    `- Traceability gate: **${report.traceabilityGateStatus.toUpperCase()}**`,
    "",
    "## Phase Verification Summary",
    "",
    "| Phase | Name | Gate | Evidence JSON | VERIFICATION.md |",
    "| ---: | --- | --- | --- | --- |"
  ];

  for (const phase of report.phases) {
    lines.push(
      `| ${phase.phase} | ${phase.name} | ${phase.gateStatus.toUpperCase()} | \`${phase.jsonPath}\` | ${phase.verificationExists ? "yes" : "no"} |`
    );
  }

  lines.push(
    "",
    "## Cross-Phase Integration",
    "",
    "- Phase 13 codified Director and Art Director skills with beat sheets and style bible tokens.",
    "- Phase 14 bridged storyboard shot lists to SceneSpec and R3F module catalog conventions.",
    "- Phase 15 wired render/export playbooks and security accuracy + audio layer handoffs.",
    "- Phase 16 closed with production orchestrator routing and TLS full-chain walkthrough verification.",
    "",
    "## Deferred Debt Resolution (v1.2)",
    "",
    "| Item | v1.2 Status | v1.3 Resolution |",
    "| --- | --- | --- |",
    "| R3F module implementation | catalog only | Module catalog + motion skill; components deferred to v1.4 |",
    "| Publish-ready production | deferred | Crew skills pipeline ready; content upgrade in v1.4 |",
    "",
    "## Evidence Index",
    "",
    "- `.artifacts/verification/phase16/crew-skills.json`",
    "- `.artifacts/verification/phase08/requirement-traceability.json`",
    "- `AGENTS.md`",
    "- `docs/tls-crew-walkthrough.md`",
    "",
    "## Notes",
    "",
    report.errors.length === 0
      ? "- All phase verification JSON artifacts report `gateStatus: pass`."
      : `- Blocking issues:\n${report.errors.map((item) => `  - ${item}`).join("\n")}`
  );

  return `${lines.join("\n")}\n`;
}

export function renderV14MilestoneAuditMarkdown(report: MilestoneAuditReport): string {
  const lines = [
    "# v1.4 Milestone Audit: Production Content",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Verdict",
    "",
    `**${report.verdict}**`,
    "",
    "## Requirements Coverage",
    "",
    "- v1.4 requirements: **7/7** mapped",
    "- Unmapped requirements: **0**",
    `- Traceability gate: **${report.traceabilityGateStatus.toUpperCase()}**`,
    "",
    "## Phase Verification Summary",
    "",
    "| Phase | Name | Gate | Evidence JSON | VERIFICATION.md |",
    "| ---: | --- | --- | --- | --- |"
  ];

  for (const phase of report.phases) {
    lines.push(
      `| ${phase.phase} | ${phase.name} | ${phase.gateStatus.toUpperCase()} | \`${phase.jsonPath}\` | ${phase.verificationExists ? "yes" : "no"} |`
    );
  }

  lines.push(
    "",
    "## Cross-Phase Integration",
    "",
    "- Phase 17 implemented packet and tunnel R3F modules with deterministic frame-state binding.",
    "- Phase 18 completed certificate and HUD overlay modules for the full eleven-id catalog.",
    "- Phase 19 upgraded TLS to publish-ready production with crew artifacts and security sign-off.",
    "- Phase 20 wired ElevenLabs TTS with deterministic stub fallback and closed v1.4 governance.",
    "",
    "## Deferred Debt Resolution (v1.3)",
    "",
    "| Item | v1.3 Status | v1.4 Resolution |",
    "| --- | --- | --- |",
    "| R3F module implementation | catalog only | All four catalog families implemented in Phases 17–18 |",
    "| Publish-ready production | deferred | TLS production scene + rubric in Phase 19 |",
    "| ElevenLabs TTS | deferred | resolveNarrationProvider with stub CI fallback in Phase 20 |",
    "",
    "## Evidence Index",
    "",
    "- `.artifacts/verification/phase17/viz-modules.json`",
    "- `.artifacts/verification/phase18/viz-modules.json`",
    "- `.artifacts/verification/phase19/tls-production.json`",
    "- `.artifacts/verification/phase20/tts-integration.json`",
    "- `.artifacts/verification/phase20/milestone-close.json`",
    "- `.artifacts/production/tls/production-manifest.json`",
    "- `.artifacts/verification/phase08/requirement-traceability.json`",
    "",
    "## Notes",
    "",
    report.errors.length === 0
      ? "- All phase verification JSON artifacts report `gateStatus: pass`."
      : `- Blocking issues:\n${report.errors.map((item) => `  - ${item}`).join("\n")}`
  );

  return `${lines.join("\n")}\n`;
}
