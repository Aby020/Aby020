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
  const portfolioUrl = "https://abi-thomas-portfolio.vercel.app/";
  const portfolioBadge = `  <a href="${portfolioUrl}" target="_blank" rel="noopener noreferrer"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-%E2%86%97%20VIEW%20MY%20PORTFOLIO%20%E2%86%92-21262D?style=for-the-badge&labelColor=0D1117&color=21262D&logo=vercel&logoColor=white"></a>`;

  const linkBadges = links.map((link) => {
    const logo = link.logo ? `&logo=${encodeURIComponent(link.logo)}&logoColor=${logoColors[link.logo] || link.color || "c9d1d9"}` : "";
    const image = `https://img.shields.io/badge/${badgeSegment(link.label)}-${badgeSegment(link.value)}-21262D?style=for-the-badge&labelColor=0D1117${logo}`;
    return `  <a href="${link.url}"><img alt="${link.label}" src="${image}"></a>`;
  });

  return [...linkBadges, portfolioBadge].join("\n");
}

function renderProfileJson(config) {
  const profile = config.profile;
  const focus = config.focus.slice(0, 4); // Top 4 for the JSON preview
  const portfolio = config.portfolio || "https://abi-thomas-portfolio.vercel.app/";

  const json = `{
  "name":     "${profile.name}",
  "role":     "${profile.headline}",
  "status":   "\u25cf ${profile.status}",
  "location": "${profile.location}",
  "education": "${profile.affiliation}",
  "focus":    [
    "${focus[0] || "Backend"}",
    "${focus[1] || "REST APIs"}",
    "${focus[2] || "AI Systems"}",
    "${focus[3] || "PostgreSQL"}"
  ],
  "links": {
    "github":   "${profile.username}",
    "linkedin": "abithomas-dev",
    "email":    "abithomas520@..."
  },
  "portfolio": "${portfolio}"
}`;

  return `$ cat profile.json

\`\`\`json
${json}
\`\`\``;
}

function renderAboutNarrative(config) {
  const about = config.profile.about.join("\n\n");
  return `<blockquote>
${about}
</blockquote>`;
}

function renderTechStack(config) {
  const techStack = config.techStack;
  const core = Array.isArray(techStack?.core) ? techStack.core : [];
  const groups = Array.isArray(techStack?.groups) ? techStack.groups : [];

  // Core badges row
  const coreBadges = core.map((item) => {
    const color = "21262d";
    const logo = item.toLowerCase().replaceAll(" ", "-").replaceAll(".", "");
    return `<code><a href="https://github.com/topics/${encodeURIComponent(item.toLowerCase())}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/${badgeSegment(item)}-${color}?style=flat-square&labelColor=0D1117&color=${color}" alt="${item}"></a></code>`;
  }).join(" ");

  // Group cards - 2 column layout using HTML table
  const groupRows = groups.map((group) => {
    const badges = group.items.map((item) => {
      const color = "21262d";
      return `<code><a href="https://github.com/topics/${encodeURIComponent(item.toLowerCase())}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/${badgeSegment(item)}-${color}?style=flat-square&labelColor=0D1117&color=${color}" alt="${item}"></a></code>`;
    }).join(" ");
    return `<tr><td valign="top"><strong>${escapeCell(group.name)}</strong></td><td>${badges}</td></tr>`;
  }).join("\n");

  return `**Core Stack** → ${coreBadges}

<table width="100%">
${groupRows}
</table>`;
}

function renderProjectCard(project) {
  if (!project) return "<td></td>";

  const accentColor = getProjectAccent(project.name);
  const repoLink = `<a href="${project.url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;padding:14px 28px;background:${accentColor};border-radius:8px;box-shadow:0 4px 14px color-mix(in srgb, ${accentColor} 40%, transparent);border:2px solid ${accentColor};">View Repository →</a>`;

  return `
<td width="50%" valign="top" style="padding:0 12px 24px 12px;vertical-align:top;min-width:280px;">

<div style="background:#0d1117;border:1px solid #30363d;border-radius:12px;padding:24px;min-height:160px;">
  <div>
    <h3 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#f0f6fc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:-0.02em;"><code style="background:#161b22;border:1px solid ${accentColor};border-radius:4px;padding:0 8px;font-size:18px;font-weight:700;color:${accentColor};font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${project.name}</code></h3>
    <p style="margin:0;font-size:14px;color:#8b949e;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">${project.summary}</p>
  </div>
  <div style="margin-top:20px;padding-top:20px;border-top:1px solid #30363d;text-align:center;">
    ${repoLink}
  </div>
</div>

</td>
`;
}

function renderProjects(projects) {
  const rows = [];
  for (let i = 0; i < projects.length; i += 2) {
    const left = projects[i];
    const right = projects[i + 1];
    rows.push(`<tr>\n${renderProjectCard(left)}\n${renderProjectCard(right)}\n</tr>`);
  }
  return `<table width="100%" style="border-collapse:collapse;width:100%;table-layout:fixed;">${rows.join("\n")}</table>`;
}

// Returns a unique accent color from the developer palette for each project
function getProjectAccent(projectName) {
  const accents = {
    "ResumeAI": "#ff7b72",      // Red/pink - AI/ML theme
    "TrackWise": "#f0883e",     // Orange - React/frontend theme
    "Plannix": "#79c0ff",       // Blue - Django/backend theme
    "ServiGo": "#a371f7"        // Purple - Full-stack/location theme
  };
  return accents[projectName] || "#58a6ff";
}

function renderLearning(config) {
  const learning = Array.isArray(config.learning) ? config.learning : DEFAULT_LEARNING;
  // Match surrounding README code-style tags: neutral dark badge, no color
  const color = "21262d";

  const badges = learning.map((item) => {
    return `<code><a href="https://github.com/topics/${encodeURIComponent(item.toLowerCase().replaceAll(" ", "-"))}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/${badgeSegment(item)}-${color}?style=flat-square&labelColor=0D1117&color=${color}" alt="${item}"></a></code>`;
  }).join(" ");

  return `**Currently Exploring** → ${badges}`;
}

function renderStatsSection(config) {
  const user = config.profile.username;
  const snake = [
    "<picture>",
    `  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake-dark.svg">`,
    `  <source media="(prefers-color-scheme: light)" srcset="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake.svg">`,
    `  <img alt="GitHub contribution grid snake animation" src="https://github.com/${user}/${user}/blob/output/github-contribution-grid-snake.svg" width="100%">`,
    "</picture>"
  ].join("\n");

  return `
<table width="100%">
<tr>
<td width="70%" valign="top">

${snake}

</td>
<td width="30%" valign="top" align="center">

<strong>Activity Stats</strong>

<img src="https://img.shields.io/github/followers/${user}?style=flat-square&labelColor=0D1117&color=21262d&label=Followers" alt="Followers">
<img src="https://img.shields.io/github/stars/${user}?style=flat-square&labelColor=0D1117&color=21262d&label=Stars" alt="Stars">
<img src="https://img.shields.io/badge/Public%20Repos-4-58a6ff?style=flat-square&labelColor=0D1117&color=58a6ff" alt="Public Repos">

</td>
</tr>
</table>
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
    ? `\n\n## // activity\n\n${ACTIVITY_START}\n${activity}\n${ACTIVITY_END}\n`
    : "";

  // Section header helper
  const section = (label, content) => `\n## // ${label}\n\n${content}\n`;

  const readme = `<!-- Generated by GitHub Profile Agent Console -->

<p align="center">
  <picture>
    <source media="(max-width:760px) and (prefers-color-scheme:dark)" srcset="./assets/hero/${manifest.assets.mobileDark}">
    <source media="(max-width:760px)" srcset="./assets/hero/${manifest.assets.mobileLight}">
    <source media="(prefers-color-scheme:dark)" srcset="./assets/hero/${manifest.assets.desktopDark}">
    <source media="(prefers-color-scheme:light)" srcset="./assets/hero/${manifest.assets.desktopLight}">
    <img src="./assets/hero/${manifest.assets.desktopDark}" width="100%" alt="${config.profile.name} - ${config.profile.headline}">
  </picture>
</p>

<p align="center">

${renderLinks(config.links)}

</p>

<hr>

${section("profile.json", renderProfileJson(config))}

<hr>

${section("about", renderAboutNarrative(config))}

<hr>

${section("tech.stack", renderTechStack(config))}

<hr>

${section("repositories", renderProjects(config.projects))}

<hr>

${section("roadmap", renderLearning(config))}

<hr>

${section("activity", renderStatsSection(config))}

${activitySection}

<hr>

<p align="center">

<code>${config.footer}</code>

</p>
`;

  await writeFile(resolve(readmePath), readme);
  return readme;
}