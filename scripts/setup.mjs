#!/usr/bin/env node

import { access, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { loadConfig, repositoryRoot, validateConfig } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";
import { generateProfileReadme } from "./lib/readme.mjs";

function inferGitHubRemote() {
  try {
    const remote = execFileSync("git", ["config", "--get", "remote.origin.url"], { cwd: repositoryRoot, encoding: "utf8" }).trim();
    const match = remote.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    return match ? { owner: match[1], repository: match[2] } : undefined;
  } catch {
    return undefined;
  }
}

function asList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

const rl = createInterface({ input, output });

async function ask(label, fallback = "") {
  const suffix = fallback ? ` [${fallback}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || fallback;
}

async function confirm(label, fallback = true) {
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await rl.question(`${label} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return fallback;
  return ["y", "yes"].includes(answer);
}

try {
  const defaults = await loadConfig();
  const remote = inferGitHubRemote();
  console.log("\nGitHub Profile Agent Console\n");
  console.log("This wizard writes public profile content only. Your portrait remains at its original path.\n");

  const username = await ask("GitHub username", remote?.owner || defaults.profile.username);
  if (remote && remote.repository.toLowerCase() !== username.toLowerCase()) {
    console.warn(`\nWarning: this repository is named "${remote.repository}". GitHub only displays a Profile README from ${username}/${username}.\n`);
  }
  const name = await ask("Display name", defaults.profile.name);
  const headline = await ask("Professional headline", defaults.profile.headline);
  const affiliation = await ask("University or company", defaults.profile.affiliation);
  const location = await ask("Location", defaults.profile.location);
  const status = await ask("Current status", defaults.profile.status);
  const aboutOne = await ask("About paragraph (one concise sentence)", defaults.profile.about[0]);
  const aboutTwo = await ask("Optional second paragraph", defaults.profile.about[1] || "");

  console.log("\nResearch / professional direction\n");
  const primary = await ask("Primary focus", defaults.research.primary);
  const direction = await ask("Long-term direction", defaults.research.direction);
  const themes = await ask("Three short themes separated by /", defaults.research.themes);
  const narrative = await ask("Research or professional narrative", defaults.research.narrative);

  const focusNames = asList(await ask("Focus areas, comma separated (1-4)", defaults.focus.map((item) => item.name).join(", "))).slice(0, 4);
  const focus = [];
  for (const [index, focusName] of focusNames.entries()) {
    const fallback = defaults.focus[index]?.description || `What I am exploring in ${focusName}.`;
    focus.push({ name: focusName, description: await ask(`Description for ${focusName}`, fallback) });
  }

  console.log("\nFeatured projects (add up to four)\n");
  const projectCount = Math.min(4, Math.max(1, Number(await ask("Number of projects", String(Math.min(defaults.projects.length, 4)))) || 1));
  const projects = [];
  for (let index = 0; index < projectCount; index += 1) {
    const fallback = defaults.projects[index] || defaults.projects[0];
    const projectName = await ask(`Project ${index + 1} name`, fallback.name);
    const projectUrl = await ask(`Project ${index + 1} GitHub URL`, fallback.url.replaceAll("yourusername", username));
    const projectFocus = await ask(`Project ${index + 1} focus`, fallback.focus);
    const projectSummary = await ask(`Project ${index + 1} summary`, fallback.summary);
    const heroLabel = await ask(`Project ${index + 1} short hero label`, fallback.heroLabel);
    const homepage = await ask(`Project ${index + 1} live URL (optional)`, fallback.homepage || "");
    projects.push({ name: projectName, url: projectUrl, homepage, focus: projectFocus, summary: projectSummary, heroLabel });
  }

  const techStack = asList(await ask("Tech stack, comma separated", defaults.techStack.join(", "))).slice(0, 18);
  const links = [{ label: "GitHub", value: username, url: `https://github.com/${username}`, logo: "github", color: "0B1220" }];
  if (await confirm("Add one additional public link", false)) {
    links.push({
      label: await ask("Link label", "Website"),
      value: await ask("Badge value", "Visit"),
      url: await ask("Public URL", "https://example.com"),
      logo: await ask("Simple Icons logo name (optional)", ""),
      color: await ask("Badge color, six hex characters", "0891B2")
    });
  }

  const palette = await ask("Palette: signal, ocean, or solar", defaults.appearance.palette);
  const activityEnabled = await confirm("Show automatically updated public GitHub activity", defaults.activity.enabled);
  const footer = await ask("Footer sentence", defaults.footer);
  const sourcePath = resolve(await ask("Absolute path to transparent PNG portrait"));
  await access(sourcePath);

  const config = validateConfig({
    $schema: "./profile.schema.json",
    profile: { name, username, headline, affiliation, location, status, about: [aboutOne, aboutTwo].filter(Boolean) },
    research: { primary, direction, themes, narrative },
    focus,
    projects,
    techStack,
    links,
    activity: { enabled: activityEnabled, limit: defaults.activity.limit },
    appearance: { palette },
    footer
  });

  await writeFile(resolve(repositoryRoot, "profile.config.json"), `${JSON.stringify(config, null, 2)}\n`);
  const manifest = await generateHeroAssets({ config, sourcePath, outputDirectory: resolve(repositoryRoot, "assets/hero") });
  await generateProfileReadme({ config, manifest, readmePath: resolve(repositoryRoot, "README.md") });

  console.log("\nProfile generated successfully.\n");
  console.log("Next steps:");
  console.log("  npm run check");
  console.log("  git add README.md profile.config.json assets/hero");
  console.log('  git commit -m "feat: create my GitHub profile"');
  console.log("  git push");
} catch (error) {
  console.error(`\nSetup stopped: ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
}
