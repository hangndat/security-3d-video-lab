import { loadTopicContracts } from "../content/contracts/load-topic-contracts.js";
import { validateTopicContracts } from "../content/contracts/validate-topic-contracts.js";
import { loadTopicManifest } from "../content/contracts/load-topic-manifest.js";
import type { TopicContract, TopicId } from "../content/contracts/types.js";
import { loadLongFormAssembly } from "../content/composition/build-long-form-scene-spec.js";

export interface ModulePacketStatus {
  topic: TopicId;
  slug: string;
  packetComplete: boolean;
  errors: string[];
  beatCount: number;
  placeholderCount: number;
  longFormLinked: boolean;
}

function validatePacketShape(contract: TopicContract): string[] {
  const errors: string[] = [];

  if (contract.storyboardBeats.length === 0) {
    errors.push("Topic has no storyboard beats.");
  }

  for (const beat of contract.storyboardBeats) {
    const placeholder = contract.narrationPlaceholders.find((item) => item.beatId === beat.id);
    if (!placeholder) {
      errors.push(`Missing narration placeholder for beat '${beat.id}'.`);
    }
  }

  if (!contract.slug.match(/^[a-z0-9-]+-short-v\d+$/)) {
    errors.push(`Slug '${contract.slug}' does not follow <topic>-short-v<major> naming.`);
  }

  return errors;
}

export function evaluateModulePacket(topic: TopicId): ModulePacketStatus {
  const manifest = loadTopicManifest();
  const contracts = loadTopicContracts();
  const validation = validateTopicContracts(contracts, manifest.order);
  const loaded = contracts.find((entry) => entry.contract.topic === topic);

  if (!loaded) {
    return {
      topic,
      slug: `${topic}-short-v1`,
      packetComplete: false,
      errors: [`Missing contract for topic '${topic}'.`],
      beatCount: 0,
      placeholderCount: 0,
      longFormLinked: false
    };
  }

  const contractErrors = validation.errors
    .filter((issue) => issue.path.includes(`/${topic}/`) || issue.path.includes(`/${topic}.`))
    .map((issue) => issue.reason);
  const shapeErrors = validatePacketShape(loaded.contract);

  let longFormLinked = false;
  const assemblySlugs = [
    "content-depth-long-v1",
    "security-expansion-long-v1",
    "content-depth-branched-v1"
  ] as const;

  for (const slug of assemblySlugs) {
    if (longFormLinked) {
      break;
    }
    try {
      const assembly = loadLongFormAssembly(slug);
      if (assembly.sequence.includes(topic)) {
        longFormLinked = true;
      }
    } catch {
      // try next assembly profile
    }
    if (!longFormLinked && slug === "content-depth-branched-v1") {
      for (const branchId of ["attack-path", "defense-path"] as const) {
        try {
          const branched = loadLongFormAssembly(slug, branchId);
          if (branched.sequence.includes(topic)) {
            longFormLinked = true;
            break;
          }
        } catch {
          // try next branch
        }
      }
    }
  }

  const errors = [...contractErrors, ...shapeErrors];
  return {
    topic,
    slug: loaded.contract.slug,
    packetComplete: errors.length === 0,
    errors,
    beatCount: loaded.contract.storyboardBeats.length,
    placeholderCount: loaded.contract.narrationPlaceholders.length,
    longFormLinked
  };
}
