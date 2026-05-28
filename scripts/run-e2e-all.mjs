import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const smokeMode = args.includes("--smoke");

const vitestArgs = ["run", "tests/e2e-canonical-flows.test.ts"];
if (smokeMode) {
  vitestArgs.push("--testNamePattern", "canonical flow");
}

const result = spawnSync("npx", ["vitest", ...vitestArgs], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
