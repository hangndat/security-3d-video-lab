import { z } from "zod";

export const SUPPORTED_SCHEMA_VERSION = "1.0.0";

const boundedFrame = z.number().int().min(0).max(1_000_000);
const boundedDuration = z.number().int().min(1).max(1_000_000);

const timelineCueSchema = z.strictObject({
  id: z.string().min(1),
  track: z.string().min(1),
  startFrame: boundedFrame,
  duration: boundedDuration,
  easing: z.string().min(1),
  payload: z.record(z.string(), z.unknown())
});

const packetActorSchema = z.strictObject({
  id: z.string().min(1),
  route: z.array(z.strictObject({ x: z.number(), y: z.number(), z: z.number() })).min(2)
});

const sceneActorSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1)
});

export const sceneSpecSchema = z.strictObject({
  schemaVersion: z.literal(SUPPORTED_SCHEMA_VERSION),
  seed: z.string().min(1),
  sceneId: z.string().min(1),
  actors: z.array(sceneActorSchema).min(1),
  packets: z.array(packetActorSchema).min(1),
  timeline: z.array(timelineCueSchema).min(1),
  totalFrames: boundedDuration,
  capabilities: z.record(z.string(), z.boolean()).default({})
});

export type SceneSpec = z.infer<typeof sceneSpecSchema>;
