export type ProductionRenderBackend = "r3f-headless" | "trace-hash";
export type ProductionFrameSource = "png" | "ppm-trace-hash";

export function resolveProductionRenderBackend(
  env: NodeJS.ProcessEnv = process.env
): ProductionRenderBackend {
  const raw = env.SECURITY_LAB_RENDER_BACKEND?.trim().toLowerCase();
  if (raw === "trace-hash" || raw === "hash") {
    return "trace-hash";
  }
  return "r3f-headless";
}

export function resolveFrameSource(backend: ProductionRenderBackend): ProductionFrameSource {
  return backend === "r3f-headless" ? "png" : "ppm-trace-hash";
}

export function shouldIncludeNarration(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.SECURITY_LAB_INCLUDE_NARRATION?.trim().toLowerCase() === "true";
}
