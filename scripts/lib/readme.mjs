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

  const tech = project.tech ? project.tech.map((t) => `<code>${escapeCell(t)}</code>`).join(" ") : "";
  const links = [`<a href="${project.url}" target="_blank" rel="noopener noreferrer">Repository</a>`];
  if (project.homepage) links.push(`<a href="${project.homepage}" target="_blank" rel="noopener noreferrer">Live Demo</a>`);

  // Status badge
  const statusMap = {
    "Completed": { icon: "���", color: "3fb950", text: "Completed" },
    "In Progress": { icon: "����", color: "d29922", text: "In Progress" },
    "Live": { icon: "����", color: "3fb950", text: "Live" }
  };
  const statusInfo = statusMap[project.status] || { icon: "����", color: "8b949e", text: project.status || "Project" };
  const statusBadge = `<img src="https://img.shields.io/badge/${statusInfo.icon}%20${badgeSegment(statusInfo.text)}-${statusInfo.color}?style=flat-square&labelColor=0D1117&color=${statusInfo.color}" alt="${project.status}">`;

  // Preview image
  const previewName = project.name.toLowerCase().replaceAll(" ", "-");
  const previewSrc = `./assets/previews/${previewName}-preview.svg`;

  return `
<td width="50%" valign="top" align="center">

<img src="${previewSrc}" alt="${project.name} preview" width="100%" style="max-width: 380px; border-radius: 6px; border: 1px solid #30363d; margin-bottom: 12px;">

**���� [${project.name}](${project.url})** ${statusBadge}

*${project.focus}*

> ${project.summary}

<div>
${tech}
</div>

<p><small>${links.join(" · ")}</small></p>

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
  return `<table width="100%">${rows.join("\n")}</table>`;
}

function renderTimeline(config) {
  // Build timeline from resume data + projects
  const timeline = [
    {
      year: "2026",
      items: [
        { type: "education", title: "MCA — APJ Abdul Kalam Technological University", detail: "CGPA 7.65 · Backend Development Focus", color: "a855f7" },
        { type: "project", title: "ResumeAI — AI Resume Analysis Platform", detail: "Django · PostgreSQL · OCR · RAG", color: "58a6ff" },
        { type: "project", title: "TrackWise — Employee Attendance System", detail: "React · Node.js · PostgreSQL · JWT", color: "22d3ee" },
        { type: "project", title: "Plannix — Event Management Platform", detail: "Django · MySQL · Bootstrap", color: "a855f7" }
      ]
    },
    {
      year: "2023",
      items: [
        { type: "education", title: "BCA — University of Kerala", detail: "CGPA 6.035", color: "a855f7" }
      ]
    },
    {
      year: "2025",
      items: [
        { type: "project", title: "ServiGo — Home Service Booking", detail: "Python · JavaScript · Google Maps API · MySQL", color: "3fb950" }
      ]
    }
  ];

  // Sort by year descending
  timeline.sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const rows = timeline.map((yearBlock, yearIndex) => {
    const itemsHtml = yearBlock.items.map((item, itemIndex) => {
      const icon = item.type === "education" ? "����" : "����";
      const isLast = itemIndex === yearBlock.items.length - 1;
      const connector = isLast ? "��─" : "├─";
      return `<tr>
  <td valign="top" width="60"><code>${yearBlock.year}</code></td>
  <td valign="top" width="30"><code style="color: ${item.color};">${connector}</code></td>
  <td valign="top">
    <strong>${icon} ${escapeCell(item.title)}</strong><br>
    <code>${escapeCell(item.detail)}</code>
  </td>
</tr>`;
    }).join("\n");

    return itemsHtml;
  }).join("\n");

  return `<table width="100%">
${rows}
</table>`;
}

function renderLearning(config) {
  const learning = Array.isArray(config.learning) ? config.learning : DEFAULT_LEARNING;

  const badges = learning.map((item) => {
    return `<code><a href="https://github.com/topics/${encodeURIComponent(item.toLowerCase().replaceAll(" ", "-"))}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/${badgeSegment(item)}-d29922?style=flat-square&labelColor=0D1117&color=d29922" alt="${item}"></a></code>`;
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

${section("timeline", renderTimeline(config))}

<hr>

${section("roadmap", renderLearning(config))}

<hr>

${section("activity", renderStatsSection(config))}

${activitySection}

<hr>

<p align="center">

**���� [${config.portfolio || "https://abi-thomas-portfolio.vercel.app/"}](${config.portfolio || "https://abi-thomas-portfolio.vercel.app/"})**

</p>

<p align="center">

<code>${config.footer}</code>

</p>
`;

  await writeFile(resolve(readmePath), readme);
  return readme;
}