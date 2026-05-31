import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readRepoFile(relativePath: string): string {
  const absolutePath = resolve(REPO_ROOT, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, "utf-8");
}

function parseSkillFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  expect(match, "SKILL.md should have YAML frontmatter").not.toBeNull();
  const frontmatter: Record<string, string> = {};
  for (const line of match![1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      frontmatter[kv[1]] = kv[2].trim();
    }
  }
  return frontmatter;
}

describe("cinematic-director skill (CREW-01)", () => {
  const skillPath = ".cursor/skills/cinematic-director/SKILL.md";
  const beatSheetPath = ".cursor/skills/cinematic-director/templates/beat-sheet.md";

  it("SKILL.md exists with cinematic-director frontmatter name", () => {
    const content = readRepoFile(skillPath);
    const frontmatter = parseSkillFrontmatter(content);
    expect(frontmatter.name).toBe("cinematic-director");
    expect(frontmatter.description).toBeTruthy();
  });

  it("SKILL.md references storyboardBeats and content-depth-branched-v1", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("storyboardBeats");
    expect(content).toContain("content-depth-branched-v1");
  });

  it("SKILL.md references retention checkpoints p25, p50, p75", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("p25");
    expect(content).toContain("p50");
    expect(content).toContain("p75");
  });

  it("beat-sheet template exists under cinematic-director/templates/", () => {
    expect(existsSync(resolve(REPO_ROOT, beatSheetPath))).toBe(true);
  });
});

describe("cinematic-art-director skill (CREW-02)", () => {
  const skillPath = ".cursor/skills/cinematic-art-director/SKILL.md";
  const styleBiblePath = "docs/style-bible.md";

  const requiredStyleSections = [
    "## Color Palette",
    "## Typography",
    "## Lighting",
    "## Camera Mood",
    "## SceneSpec Mapping Notes"
  ];

  it("SKILL.md exists with cinematic-art-director frontmatter name", () => {
    const content = readRepoFile(skillPath);
    const frontmatter = parseSkillFrontmatter(content);
    expect(frontmatter.name).toBe("cinematic-art-director");
    expect(frontmatter.description).toBeTruthy();
  });

  it("docs/style-bible.md contains all five required H2 sections", () => {
    const content = readRepoFile(styleBiblePath);
    for (const section of requiredStyleSections) {
      expect(content).toContain(section);
    }
  });

  it("style bible includes at least three named color tokens", () => {
    const content = readRepoFile(styleBiblePath);
    const colorTokens = content.match(/--color-[a-z0-9-]+/g) ?? [];
    expect(new Set(colorTokens).size).toBeGreaterThanOrEqual(3);
  });

  it("art director SKILL.md links to docs/style-bible.md", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("style-bible.md");
  });
});

describe("cinematic-storyboard-artist skill (CREW-03)", () => {
  const skillPath = ".cursor/skills/cinematic-storyboard-artist/SKILL.md";
  const shotListPath = ".cursor/skills/cinematic-storyboard-artist/templates/shot-list.md";
  const handoffPath = ".cursor/skills/cinematic-storyboard-artist/templates/scenespec-handoff.md";

  it("SKILL.md exists with cinematic-storyboard-artist frontmatter name", () => {
    const content = readRepoFile(skillPath);
    const frontmatter = parseSkillFrontmatter(content);
    expect(frontmatter.name).toBe("cinematic-storyboard-artist");
    expect(frontmatter.description).toBeTruthy();
  });

  it("SKILL.md references validateSceneSpec and scene-spec.ts", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("validateSceneSpec");
    expect(content).toContain("scene-spec.ts");
  });

  it("shot-list.md and scenespec-handoff.md exist under templates/", () => {
    expect(existsSync(resolve(REPO_ROOT, shotListPath))).toBe(true);
    expect(existsSync(resolve(REPO_ROOT, handoffPath))).toBe(true);
  });

  it("SKILL.md references beat-sheet handoff from Director skill", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("beat-sheet");
  });
});

describe("cinematic-3d-motion-designer skill (CREW-04)", () => {
  const skillPath = ".cursor/skills/cinematic-3d-motion-designer/SKILL.md";
  const catalogPath = "docs/r3f-module-catalog.md";

  const requiredCatalogSections = [
    "## Module Naming Convention",
    "## Packet Modules",
    "## Tunnel Modules",
    "## Certificate Modules",
    "## HUD Modules",
    "## Composition Rules",
    "## Engine Binding Notes"
  ];

  it("SKILL.md exists with cinematic-3d-motion-designer frontmatter name", () => {
    const content = readRepoFile(skillPath);
    const frontmatter = parseSkillFrontmatter(content);
    expect(frontmatter.name).toBe("cinematic-3d-motion-designer");
    expect(frontmatter.description).toBeTruthy();
  });

  it("docs/r3f-module-catalog.md contains all seven required H2 sections", () => {
    const content = readRepoFile(catalogPath);
    for (const section of requiredCatalogSections) {
      expect(content).toContain(section);
    }
  });

  it("catalog includes all four module families via viz- module ids", () => {
    const content = readRepoFile(catalogPath);
    expect(content).toMatch(/viz-packet-/);
    expect(content).toMatch(/viz-tunnel-/);
    expect(content).toMatch(/viz-cert-/);
    expect(content).toMatch(/viz-hud-/);
  });

  it("motion designer SKILL.md links to docs/r3f-module-catalog.md", () => {
    const content = readRepoFile(skillPath);
    expect(content).toContain("r3f-module-catalog.md");
  });
});
