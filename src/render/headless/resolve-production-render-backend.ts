export type ProductionRenderBackend = "r3f-headless" | "trace-hash";

export function resolveProductionRenderBackend(
  env: NodeJS.ProcessEnv = process.env
): ProductionRenderBackend {
  const raw = env.SECURITY_LAB_RENDER_BACKEND?.trim().toLowerCase();
  if (raw === "trace-hash" || raw === "hash") {
    return "trace-hash";
  }
  return "r3f-headless";
}
