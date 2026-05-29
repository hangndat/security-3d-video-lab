import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { loadTopicManifest } from "../src/content/contracts/load-topic-manifest.js";

describe("loadTopicManifest", () => {
  it("rejects duplicate topic ids in manifest order", () => {
    const tempRoot = mkdtempSync(resolve(tmpdir(), "topic-manifest-"));
    try {
      writeFileSync(
        resolve(tempRoot, "manifest.json"),
        JSON.stringify({
          schemaVersion: "1.0.0",
          order: ["tls", "tls"]
        }),
        "utf-8"
      );

      expect(() => loadTopicManifest(tempRoot)).toThrow(/Duplicate manifest topic id/);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("rejects unsupported manifest schema versions", () => {
    const tempRoot = mkdtempSync(resolve(tmpdir(), "topic-manifest-"));
    try {
      writeFileSync(
        resolve(tempRoot, "manifest.json"),
        JSON.stringify({
          schemaVersion: "2.0.0",
          order: ["tls"]
        }),
        "utf-8"
      );

      expect(() => loadTopicManifest(tempRoot)).toThrow(/Unsupported manifest schemaVersion/);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("loads manifest from a custom topics root", () => {
    const tempRoot = mkdtempSync(resolve(tmpdir(), "topic-manifest-"));
    try {
      mkdirSync(resolve(tempRoot, "alpha"), { recursive: true });
      writeFileSync(
        resolve(tempRoot, "manifest.json"),
        JSON.stringify({
          schemaVersion: "1.0.0",
          order: ["alpha"]
        }),
        "utf-8"
      );

      const manifest = loadTopicManifest(tempRoot);
      expect(manifest.order).toEqual(["alpha"]);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
