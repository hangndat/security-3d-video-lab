import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface TopicManifest {
  schemaVersion: "1.0.0";
  order: string[];
}

const DEFAULT_MANIFEST_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../topics/manifest.json"
);

export function loadTopicManifest(topicsRoot?: string): TopicManifest {
  const manifestPath = topicsRoot
    ? resolve(topicsRoot, "manifest.json")
    : DEFAULT_MANIFEST_PATH;

  let parsed: TopicManifest;
  try {
    parsed = JSON.parse(readFileSync(manifestPath, "utf-8")) as TopicManifest;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown JSON parse error";
    throw new Error(`Invalid manifest JSON at ${manifestPath}: ${detail}`);
  }

  if (parsed.schemaVersion !== "1.0.0") {
    throw new Error(`Unsupported manifest schemaVersion '${parsed.schemaVersion}'.`);
  }

  if (!Array.isArray(parsed.order) || parsed.order.length === 0) {
    throw new Error("Manifest order must be a non-empty topic array.");
  }

  const seen = new Set<string>();
  for (const topic of parsed.order) {
    if (typeof topic !== "string" || !/^[a-z0-9-]+$/.test(topic)) {
      throw new Error(`Invalid manifest topic id '${String(topic)}'.`);
    }
    if (seen.has(topic)) {
      throw new Error(`Duplicate manifest topic id '${topic}'.`);
    }
    seen.add(topic);
  }

  return parsed;
}
