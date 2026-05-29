import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadTopicManifest } from "./load-topic-manifest.js";
import type { LoadedTopicContract, TopicContract } from "./types.js";

export const TOPICS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../topics"
);

export function loadTopicContracts(topicsRoot: string = TOPICS_ROOT): LoadedTopicContract[] {
  const manifest = loadTopicManifest(topicsRoot);
  const topicRank = new Map(manifest.order.map((topic, index) => [topic, index]));
  const topicFolders = readdirSync(topicsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((folder) => topicRank.has(folder))
    .sort((left, right) => topicRank.get(left)! - topicRank.get(right)!);

  const loaded = topicFolders.map((topicFolder) => {
    const contractPath = resolve(topicsRoot, topicFolder, "contract.json");
    if (!existsSync(contractPath)) {
      throw new Error(`Missing contract.json for manifest topic '${topicFolder}'.`);
    }

    const raw = readFileSync(contractPath, "utf-8");
    let contract: TopicContract;

    try {
      contract = JSON.parse(raw) as TopicContract;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown JSON parse error";
      throw new Error(`Invalid JSON in ${contractPath}: ${detail}`);
    }

    return { contractPath, contract };
  });

  for (const expectedTopic of manifest.order) {
    if (!loaded.some((entry) => entry.contract.topic === expectedTopic)) {
      throw new Error(`Manifest topic '${expectedTopic}' is missing from loaded contracts.`);
    }
  }

  return loaded;
}
