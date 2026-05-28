import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TOPIC_SEQUENCE, type LoadedTopicContract, type TopicContract } from "./types.js";

const TOPICS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../topics"
);

export function loadTopicContracts(topicsRoot: string = TOPICS_ROOT): LoadedTopicContract[] {
  const topicRank = new Map(TOPIC_SEQUENCE.map((topic, index) => [topic, index]));
  const topicFolders = readdirSync(topicsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      const leftRank = topicRank.get(left);
      const rightRank = topicRank.get(right);
      if (leftRank === undefined && rightRank === undefined) {
        return left.localeCompare(right);
      }
      if (leftRank === undefined) {
        return 1;
      }
      if (rightRank === undefined) {
        return -1;
      }
      return leftRank - rightRank;
    });

  return topicFolders.map((topicFolder) => {
    const contractPath = resolve(topicsRoot, topicFolder, "contract.json");
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
}
