import { describe, expect, it } from "vitest";

import {
  createKpiCaptureSkeleton,
  firstContentBatchPackets,
  longFormAssembly,
  narrationPlaceholders,
  populateKpiCapture,
  validateKpiCaptureCompleteness,
  validateBatchCompleteness
} from "../src/content/batch/first-content-batch.js";

describe("phase 03 first content batch contracts", () => {
  it("registers all three topic packets with normalized order", () => {
    expect(firstContentBatchPackets.map((packet) => packet.topic)).toEqual(["tls", "ssh", "dns"]);
    expect(firstContentBatchPackets.every((packet) => packet.storyboardBeats.length > 0)).toBe(true);
  });

  it("provides narration placeholders for every storyboard beat", () => {
    const allBeatIds = firstContentBatchPackets.flatMap((packet) =>
      packet.storyboardBeats.map((beat) => beat.id)
    );

    expect(narrationPlaceholders).toHaveLength(allBeatIds.length);
    for (const beatId of allBeatIds) {
      expect(narrationPlaceholders.some((item) => item.beatId === beatId)).toBe(true);
    }
    expect(narrationPlaceholders.every((item) => item.analyticKey.includes(":"))).toBe(true);
  });

  it("keeps short duration windows and long-form sequence policy", () => {
    for (const packet of firstContentBatchPackets) {
      expect(packet.durationBudget.minSeconds).toBeGreaterThanOrEqual(45);
      expect(packet.durationBudget.maxSeconds).toBeLessThanOrEqual(60);
    }

    expect(longFormAssembly.sequence).toEqual(["tls", "ssh", "dns"]);
    expect(longFormAssembly.targetWindowMinutes).toEqual({
      min: 4,
      max: 6
    });
    expect(longFormAssembly.transitions).toHaveLength(2);
  });

  it("defines KPI capture skeleton with required checkpoints and pacing enum", () => {
    const kpi = createKpiCaptureSkeleton("tls-short-v1");

    expect(kpi.retentionCheckpoints).toEqual({
      p25: null,
      p50: null,
      p75: null,
      completion: null
    });
    expect(kpi.feedbackTags).toEqual([]);
    expect(kpi.pacingVerdict).toBeNull();
  });

  it("[gap-truth-kpi] rejects null checkpoints and null pacing verdict", () => {
    const kpi = createKpiCaptureSkeleton("tls-short-v1");
    expect(() => validateKpiCaptureCompleteness(kpi)).toThrow(
      "KPI retention checkpoint p25 must be non-null."
    );
  });

  it("[gap-truth-kpi] passes with complete measurable checkpoints and verdict", () => {
    const kpi = populateKpiCapture(createKpiCaptureSkeleton("tls-short-v1"), {
      retentionCheckpoints: {
        p25: 0.82,
        p50: 0.68,
        p75: 0.51,
        completion: 0.44
      },
      pacingVerdict: "balanced",
      feedbackTags: ["clear-pacing"],
      notes: "Stable retention for baseline."
    });

    expect(() => validateKpiCaptureCompleteness(kpi)).not.toThrow();
  });

  it("[gap-truth-kpi] acceptance surface reports measurable KPI failures", () => {
    const incomplete = createKpiCaptureSkeleton("tls-short-v1");
    const errors = validateBatchCompleteness([incomplete]);
    expect(errors.some((error) => error.includes("failed KPI acceptance"))).toBe(true);
    expect(errors.some((error) => error.includes("p25 must be non-null"))).toBe(true);
  });

  it("passes batch completeness validation", () => {
    expect(validateBatchCompleteness()).toEqual([]);
  });
});
