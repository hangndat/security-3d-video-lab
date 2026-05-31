export type RoutePoint = {
  x: number;
  y: number;
  z: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function interpolateRoutePosition(route: RoutePoint[], progress: number): RoutePoint {
  if (route.length < 2) {
    throw new Error("Route interpolation requires at least 2 points.");
  }

  const normalized = clamp(progress, 0, 1);
  const segmentSpan = route.length - 1;
  const scaled = normalized * segmentSpan;
  const segmentIndex = Math.min(Math.floor(scaled), segmentSpan - 1);
  const localProgress = scaled - segmentIndex;

  const from = route[segmentIndex];
  const to = route[segmentIndex + 1];

  return {
    x: from.x + (to.x - from.x) * localProgress,
    y: from.y + (to.y - from.y) * localProgress,
    z: from.z + (to.z - from.z) * localProgress
  };
}
