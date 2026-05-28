#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_TOPICS_ROOT = resolve(
  fileURLToPath(new URL("../src/content/topics", import.meta.url))
);

function parseArgs(argv) {
  const options = {
    topic: "",
    major: 1,
    topicsRoot: DEFAULT_TOPICS_ROOT,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--topic") {
      options.topic = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (token === "--major") {
      options.major = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (token === "--topics-root") {
      options.topicsRoot = resolve(argv[index + 1] ?? "");
      index += 1;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function sanitizeTopicSlug(rawTopic) {
  const topic = rawTopic.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(topic)) {
    throw new Error("Topic slug must match [a-z0-9-]+.");
  }
  if (topic.includes("..") || topic.includes("/") || topic.includes("\\")) {
    throw new Error("Topic slug must not contain path separators.");
  }
  return topic;
}

function assertTopicsRootConfinement(topicsRoot, topic) {
  const resolvedRoot = resolve(topicsRoot);
  const topicDir = resolve(resolvedRoot, topic);
  if (!topicDir.startsWith(`${resolvedRoot}/`) && topicDir !== resolvedRoot) {
    throw new Error("Topic output path escapes topics root.");
  }
  return topicDir;
}

function buildBeatStubs(topic) {
  const beatIds = [`${topic}-hook`, `${topic}-core-beat`, `${topic}-resolution-beat`];
  let frameCursor = 0;

  return beatIds.map((id, index) => {
    const startFrame = frameCursor;
    const endFrame = startFrame + (index === beatIds.length - 1 ? 90 : 70);
    frameCursor = endFrame - 10;
    return {
      id,
      startFrame,
      endFrame,
      objective: `Explain ${id.replaceAll("-", " ")}.`
    };
  });
}

function buildContractTemplate(topic, major) {
  const storyboardBeats = buildBeatStubs(topic);
  const beatEnd = Math.max(...storyboardBeats.map((beat) => beat.endFrame));
  const estimatedSeconds = Number((beatEnd / 30).toFixed(2));
  const targetSeconds = Math.min(8, Math.max(7, estimatedSeconds));
  const minSeconds = Math.max(7, targetSeconds - 1);
  const maxSeconds = Math.min(9, targetSeconds + 1);

  return {
    schemaVersion: "1.0.0",
    topic,
    slug: `${topic}-short-v${major}`,
    hook: `Introduce why ${topic.replaceAll("-", " ")} matters in modern security.`,
    cta: `Apply ${topic.replaceAll("-", " ")} controls in production systems.`,
    durationBudget: {
      minSeconds,
      targetSeconds,
      maxSeconds
    },
    storyboardBeats,
    narrationPlaceholders: storyboardBeats.map((beat) => ({
      beatId: beat.id,
      analyticKey: `${topic}:${beat.id}`,
      scriptIntent: beat.objective,
      timing: { minSeconds: 4, targetSeconds: 7, maxSeconds: 12 }
    }))
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const topic = sanitizeTopicSlug(options.topic);
  if (!Number.isInteger(options.major) || options.major < 1) {
    throw new Error("--major must be a positive integer.");
  }

  const topicDir = assertTopicsRootConfinement(options.topicsRoot, topic);
  const contractPath = resolve(topicDir, "contract.json");
  const contract = buildContractTemplate(topic, options.major);
  const payload = `${JSON.stringify(contract, null, 2)}\n`;

  if (options.dryRun) {
    process.stdout.write(payload);
    return;
  }

  mkdirSync(topicDir, { recursive: true });
  writeFileSync(contractPath, payload, "utf-8");
  process.stdout.write(`Created ${contractPath}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`scaffold-topic-contract failed: ${message}\n`);
  process.exit(1);
}
