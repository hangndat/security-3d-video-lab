import { describe, expect, it } from "vitest";

import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";
import { loadTopicContracts } from "../src/content/contracts/load-topic-contracts.js";
import {
  buildModuleKpiAccepted,
  buildModuleKpiSkeleton,
  evaluateModuleKpi
} from "../src/verification/module-kpi.js";
import {
  createKpiCaptureSkeleton,
  populateKpiCapture
} from "../src/content/batch/first-content-batch.js";

describe("batch KPI acceptance signals (VER-03)", () => {
  it("reports non-acceptance for skeleton KPI captures per module", () => {
    const contracts = loadTopicContracts();
    for (const topic of loadTopicManifest().order) {
      const slug = contracts.find((entry) => entry.contract.topic === topic)!.contract.slug;
      const status = buildModuleKpiSkeleton(slug);
      expect(status.acceptanceReady).toBe(false);
      expect(status.retentionCheckpoints.p25).toBeNull();
      expect(status.pacingVerdict).toBeNull();
    }
  });

  it("marks module KPI accepted when retention and pacing verdict are complete", () => {
    const contracts = loadTopicContracts();
    for (const topic of loadTopicManifest().order) {
      const slug = contracts.find((entry) => entry.contract.topic === topic)!.contract.slug;
      const status = buildModuleKpiAccepted(slug);
      expect(status.acceptanceReady).toBe(true);
      expect(status.retentionCheckpoints.completion).not.toBeNull();
      expect(status.pacingVerdict).toBe("balanced");
      expect(status.feedbackTags.length).toBeGreaterThan(0);
    }
  });

  it("evaluateModuleKpi surfaces validation failures for incomplete captures", () => {
    const incomplete = createKpiCaptureSkeleton("auth-session-short-v1");
    const status = evaluateModuleKpi(incomplete);
    expect(status.acceptanceReady).toBe(false);
    expect(status.acceptanceErrors.length).toBeGreaterThan(0);
  });

  it("evaluateModuleKpi passes for populated measurable checkpoints", () => {
    const complete = populateKpiCapture(createKpiCaptureSkeleton("pki-trust-chain-short-v1"), {
      retentionCheckpoints: {
        p25: 0.77,
        p50: 0.61,
        p75: 0.48,
        completion: 0.39
      },
      pacingVerdict: "balanced",
      feedbackTags: ["trust-chain-clarity"]
    });
    const status = evaluateModuleKpi(complete);
    expect(status.acceptanceReady).toBe(true);
    expect(status.acceptanceErrors).toEqual([]);
  });
});
