import {
  createKpiCaptureSkeleton,
  populateKpiCapture,
  validateKpiCaptureCompleteness,
  type KpiCapture
} from "../content/batch/first-content-batch.js";

export interface ModuleKpiStatus {
  assetId: string;
  retentionCheckpoints: KpiCapture["retentionCheckpoints"];
  pacingVerdict: KpiCapture["pacingVerdict"];
  feedbackTags: string[];
  acceptanceReady: boolean;
  acceptanceErrors: string[];
}

export function buildModuleKpiSkeleton(assetId: string): ModuleKpiStatus {
  const skeleton = createKpiCaptureSkeleton(assetId);
  return {
    assetId: skeleton.assetId,
    retentionCheckpoints: skeleton.retentionCheckpoints,
    pacingVerdict: skeleton.pacingVerdict,
    feedbackTags: skeleton.feedbackTags,
    acceptanceReady: false,
    acceptanceErrors: ["KPI retention and pacing verdict are not populated."]
  };
}

export function buildModuleKpiAccepted(assetId: string): ModuleKpiStatus {
  const accepted = populateKpiCapture(createKpiCaptureSkeleton(assetId), {
    retentionCheckpoints: {
      p25: 0.8,
      p50: 0.65,
      p75: 0.5,
      completion: 0.42
    },
    pacingVerdict: "balanced",
    feedbackTags: ["clear-pacing"],
    notes: "Baseline acceptance sample for verification reporting."
  });

  const acceptanceErrors: string[] = [];
  try {
    validateKpiCaptureCompleteness(accepted);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown KPI validation failure.";
    acceptanceErrors.push(detail);
  }

  return {
    assetId: accepted.assetId,
    retentionCheckpoints: accepted.retentionCheckpoints,
    pacingVerdict: accepted.pacingVerdict,
    feedbackTags: accepted.feedbackTags,
    acceptanceReady: acceptanceErrors.length === 0,
    acceptanceErrors
  };
}

export function evaluateModuleKpi(kpi: KpiCapture): ModuleKpiStatus {
  const acceptanceErrors: string[] = [];
  try {
    validateKpiCaptureCompleteness(kpi);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown KPI validation failure.";
    acceptanceErrors.push(detail);
  }

  return {
    assetId: kpi.assetId,
    retentionCheckpoints: kpi.retentionCheckpoints,
    pacingVerdict: kpi.pacingVerdict,
    feedbackTags: kpi.feedbackTags,
    acceptanceReady: acceptanceErrors.length === 0,
    acceptanceErrors
  };
}
