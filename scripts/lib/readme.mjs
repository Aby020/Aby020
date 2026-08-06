import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export const ACTIVITY_START = "<!-- AUTO:ACTIVITY:START -->";
export const ACTIVITY_END = "<!-- AUTO:ACTIVITY:END -->";

// Fallback used when an existing config predates the `learning` field.
const DEFAULT_LEARNING = [
  "Spring Security",
  "Docker",
  "Microservices",
  "Model Context Protocol (MCP)",
  "Retrieval-Augmented Generation (RAG)",
  "AI Integration with LLM APIs"
];

// Brand logo colors chosen to stay visible on the dark badge body.
const logoColors = {
  github: "c9d1d9",
  linkedin: "0A66C2",
  gmail: "EA4335",
  x: "ffffff",
  twitter: "ffffff",
  dev: "ffffff",
  medium: "ffffff",
  hashnode: "2962FF"
};

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function badgeSegment(value) {
  return encodeURIComponent(String(value).replaceAll("-", "--").replaceAll("_", "__").replaceAll(" ", "_"));
}

function renderLinks(links) {
  return links.map((link) => {
    const logo = link.logo ? `&logo=${encodeURIComponent(link.logo)}&logoColor=${logoColors[link.logo] || link.color || "c9d1d9"}` : "";
    const image = `https://img.shields.io/badge/${badgeSegment(link.label)}-${badgeSegment(link.value)}-21262D?style=for-the-badge&labelColor=0D1117${logo}`;
    return `  <a href="${link.url}"><img alt="${link.label}" src="${image}"></a>`;
  }).join("\n");
}

function renderFacts(config) {
  const core = config.techStack?.core || [];
  const rows = [
    ["status", config.profile.status],
    ["education", config.profile.affiliation],
    ["location", config.profile.location],
    ["focus", core.length ? core.join(" · ") : config.research.primary]
  ];
  return `| | |\n|--|--|\n${rows.map(([key, value]) => `| \`${escapeCell(key)}\` | ${escapeCell(value)} |`).join("\n")}`;
}

function renderFocus(focus) {
  return focus.map((item) => `<code>${escapeCell(item)}</code>`).join(" ");
}

function renderRepoCard(project) {
  if (!project) return "<td></td>";
  const tech = project.tech ? `<p>${project.tech.map((t) => `<code>${escapeCell(t)}</code>`).join(" ")}</p>` : "";
  const links = [`<a href="${project.url}">Repository</a>`];
  if (project.homepage) links.push(`<a href="${project.homepage}">Live Demo</a>`);
  const statusIcon = project.status === "In Progress" ? "🚧" : "✅";
  const status = project.status ? `${statusIcon} <code>${escapeCell(project.status)}</code>` : "";
  return `
<td width="50%" valign="top">

**📁 [${project.name}](${project.url})** · *${project.focus}*

> ${project.summary}

${tech}

<p><small>${status}${status ? " · " : ""}${links.join(" · ")}</small></p>

</td>
`;
}

function renderProjects(projects) {
  const rows = [];
  for (let i = 0; i < projects.length; i += 2) {
    const left = projects[i];
    const right = projects[i + 1];
    rows.push(`<tr>\n${renderRepoCard(left)}\n${renderRepoCard(right)}\n</tr>`);
  }
  return `<table width="100%">${rows.join("\n")}</table>`;
}

function renderTechStack(techStack) {
  const core = Array.isArray(techStack?.core) ? techStack.core : [];
  const groups = Array.isArray(techStack?.groups) ? techStack.groups : [];
  const coreChips = core.map((item) => `<code>${escapeCell(item)}</code>`).join(" ");
  const rows = groups
    .map((group) => `| **${escapeCell(group.name)}** | ${group.items.map((item) => `<code>${escapeCell(item)}</code>`).join(" ")} |`)
    .join("\n");
  return `**Core stack** → ${coreChips}\n\n| Focus | Stack |\n|-------|-------|\n${rows}`;
}

const FENCE = "```";

function renderLearning(learning) {
  // Renders as a live `tail -f` session: a fenced text block whose lines read
  // like terminal output. The `+` prefix echoes the hero's `git log` / install
  // rhythm so the whole profile speaks one language.
  const lines = ["$ tail -f learning.log", ...learning.map((item) => `+ ${item}`)];
  return `${FENCE}text\n${lines.join("\n")}\n${FENCE}`;
}

function renderStatsSection(config) {
  const user = config.profile.username;
  const snake = [
    "<picture>",
    `  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake-dark.svg">`,
    `  <source media="(prefers-color-scheme: light)" srcset="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake.svg">`,
    `  <img alt="GitHub contribution grid snake animation" src="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake.svg">`,
    "</picture>"
  ].join("\n");

  return `
<div align="center">
  ${snake}
</div>
`;
}

function extractActivity(readme) {
  const startIndex = readme.indexOf(ACTIVITY_START);
  const endIndex = readme.indexOf(ACTIVITY_END);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null;
  return readme.slice(startIndex + ACTIVITY_START.length, endIndex).trim();
}

async function readExistingActivity(readmePath) {
  try {
    const existing = await readFile(readmePath, "utf8");
    return extractActivity(existing);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function generateProfileReadme({ config, manifest, readmePath }) {
  const existingActivity = await readExistingActivity(readmePath);
  const activity = existingActivity || "_Recent public activity will appear here after the workflow runs._";
  const activitySection = config.activity.enabled
    ? `\n## $ gh activity\n\n${ACTIVITY_START}\n${activity}\n${ACTIVITY_END}\n`
    : "";
  const about = config.profile.about.join("\n\n");
  const learning = Array.isArray(config.learning) ? config.learning : DEFAULT_LEARNING;

  const readme = `<!-- Generated by GitHub Profile Agent Console -->

<p align="center">
  <picture>
    <source media="(max-width:760px) and (prefers-color-scheme:dark)" srcset="./assets/hero/${manifest.assets.mobileDark}">
    <source media="(max-width:760px)" srcset="./assets/hero/${manifest.assets.mobileLight}">
    <source media="(prefers-color-scheme:dark)" srcset="./assets/hero/${manifest.assets.desktopDark}">
    <source media="(prefers-color-scheme:light)" srcset="./assets/hero/${manifest.assets.desktopLight}">
    <img src="./assets/hero/${manifest.assets.desktopDark}" width="100%">
  </picture>
</p>

<p align="center">

${renderLinks(config.links)}

</p>

<hr>

## $ whoami

${about}

${renderFacts(config)}

<hr>

## $ cat focus.md

Currently focusing on building scalable backend systems and production-ready web applications.

${renderFocus(config.focus)}

<hr>

## $ ls projects/

${renderProjects(config.projects)}

<hr>

## $ cat tech-stack.md

${renderTechStack(config.techStack)}

<hr>

## $ tail -f learning.log

${renderLearning(learning)}

<hr>

## $ gh stats

${renderStatsSection(config)}

${activitySection}

<hr>

<p align="center">

<code>⌘ ${config.footer}</code>

</p>
`;

  await writeFile(resolve(readmePath), readme);
  return readme;
}
