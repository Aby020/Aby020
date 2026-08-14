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

  const tech = project.tech
    ? project.tech
        .map(
          (t) =>
            `<span style="display:inline-block;font-size:10px;font-weight:500;color:#c9d1d9;background:#21262d;border:1px solid #30363d;padding:2px 8px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;margin:0 6px 6px 0;">${escapeCell(
              t
            )}</span>`
        )
        .join("")
    : "";
  const accentColor = getProjectAccent(project.name);
  const repoLink = `<a href="${project.url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:${accentColor};text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;padding:6px 10px;border:1px solid ${accentColor};border-radius:6px;background:color-mix(in srgb, ${accentColor} 10%, transparent);">↗ Repository</a>`;

  // Status badge
  const statusMap = {
    Completed: { icon: "●", color: "3fb950", text: "Completed" },
    "In Progress": { icon: "○", color: "d29922", text: "In Progress" },
    Live: { icon: "●", color: "3fb950", text: "Live" },
  };
  const statusInfo =
    statusMap[project.status] || {
      icon: "●",
      color: "8b949e",
      text: project.status || "Project",
    };
  const statusColor = `#${statusInfo.color}`;
  const statusBadge = `<span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:${statusColor};font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;padding:2px 8px;border-radius:12px;background:color-mix(in srgb, ${statusColor} 15%, transparent);border:1px solid color-mix(in srgb, ${statusColor} 30%, transparent);"><span style="width:6px;height:6px;border-radius:50%;background:${statusColor};animation:pulse 2s infinite;"></span>${statusInfo.text}</span>`;

  // Generate project-specific terminal snippet
  const terminal = generateTerminalSnippet(project);

  return `
<td width="50%" valign="top" style="padding:0 8px 16px 8px;vertical-align:top;">

<div style="background:#0d1117;border:1px solid #30363d;border-radius:8px;overflow:hidden;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--accent:${accentColor};">
  <!-- Terminal Header -->
  <div style="background:#161b22;border-bottom:1px solid #30363d;padding:8px 12px;display:flex;align-items:center;gap:10px;">
    <div style="display:flex;gap:6px;">
      <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;flex-shrink:0;"></span>
      <span style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;flex-shrink:0;"></span>
      <span style="width:12px;height:12px;border-radius:50%;background:#28ca42;flex-shrink:0;"></span>
    </div>
    <div style="font-size:11px;color:#8b949e;font-weight:400;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${terminal.filename}</div>
    <div style="font-size:10px;color:#484f58;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${terminal.breadcrumb}</div>
  </div>

  <!-- Terminal Body -->
  <div style="background:#0d1117;padding:12px 14px;min-height:120px;max-height:200px;overflow:auto;font-size:12px;line-height:1.6;color:#e6edf3;">
    <div style="margin:2px 0;white-space:pre-wrap;word-break:break-word;"><span style="color:${accentColor};font-weight:600;margin-right:6px;">$</span> <span style="color:#d2a8ff;">${terminal.command}</span></div>
    ${terminal.output
      .map((line) => {
        let lineColor = "#e6edf3";
        if (line.class === "info") lineColor = "#79c0ff";
        else if (line.class === "success") lineColor = "#3fb950";
        else if (line.class === "error") lineColor = "#f85149";
        else if (line.class === "warning") lineColor = "#d29922";
        else if (line.class === "comment") lineColor = "#8b949e";
        return `<div style="margin:2px 0;white-space:pre-wrap;word-break:break-word;color:${lineColor};">${line.text}</div>`;
      })
      .join("")}
    <div style="margin:2px 0;white-space:pre-wrap;word-break:break-word;"><span style="color:${accentColor};font-weight:600;margin-right:6px;">$</span> <span style="color:#d2a8ff;">${terminal.nextCommand}</span></div>
  </div>

  <!-- Project Info Footer -->
  <div style="background:#161b22;border-top:1px solid #30363d;padding:12px 14px 14px 14px;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
      <h3 style="margin:0;font-size:14px;font-weight:600;color:#f0f6fc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">${project.name}</h3>
      ${statusBadge}
    </div>
    <p style="margin:0 0 6px 0;font-size:12px;color:#8b949e;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">${project.summary}</p>
    <div style="margin:0 0 10px 0;font-size:11px;color:#6e7681;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;">${project.focus}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${tech}</div>
    <div>${repoLink}</div>
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
  return `<table width="100%" style="border-collapse:collapse;width:100%;">${rows.join("\n")}</table>`;
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

// Generates a project-specific terminal-style code snippet
function generateTerminalSnippet(project) {
  const name = project.name.toLowerCase().replaceAll(" ", "-");
  const tech = project.tech || [];

  const terminals = {
    "resumeai": {
      filename: "resumeai / resume_analyzer.py",
      breadcrumb: "resumeai > models > analyzer",
      command: "python resume_analyzer.py --resume resume.pdf --jd job.txt",
      output: [
        { text: "📄 Parsing resume...", class: "info" },
        { text: "🔍 Extracting skills & experience...", class: "info" },
        { text: "🤖 Running ATS analysis...", class: "info" },
        { text: "✅ ATS Score: 92/100", class: "success" },
        { text: "📊 JD Match: 87% (12/14 keywords)", class: "success" },
        { text: "💡 Feedback generated: 3 suggestions", class: "success" }
      ],
      nextCommand: "cat analysis_report.json"
    },
    "trackwise": {
      filename: "trackwise / dashboard.js",
      breadcrumb: "trackwise > src > components > Dashboard",
      command: "npm run dev",
      output: [
        { text: "▶ VITE v5.2.0  ready in 347ms", class: "info" },
        { text: "➜ Local:   http://localhost:5173/", class: "success" },
        { text: "➜ Network: http://192.168.1.42:5173/", class: "success" },
        { text: "⚡ React 18 + Tailwind CSS loaded", class: "info" },
        { text: "📊 AttendanceChart mounted", class: "info" },
        { text: "🔐 JWT auth verified", class: "success" }
      ],
      nextCommand: "curl -X GET /api/attendance/stats"
    },
    "plannix": {
      filename: "plannix / events/views.py",
      breadcrumb: "plannix > events > views",
      command: "python manage.py runserver 8000",
      output: [
        { text: "🚀 Starting development server at http://127.0.0.1:8000/", class: "info" },
        { text: "📦 Django 5.1.3 loaded", class: "info" },
        { text: "🔌 Connected to MySQL database", class: "success" },
        { text: "📋 EventListView: 24 events loaded", class: "info" },
        { text: "✅ All migrations applied", class: "success" },
        { text: "🌐 Server ready — accepting requests", class: "success" }
      ],
      nextCommand: "curl -X GET /api/events/"
    },
    "servigo": {
      filename: "servigo / booking.js",
      breadcrumb: "servigo > src > services > booking",
      command: "node booking.js --provider spa --location kochi",
      output: [
        { text: "🗺️  Loading Google Maps...", class: "info" },
        { text: "📍 Location: Kochi, Kerala (9.9312, 76.2673)", class: "info" },
        { text: "🔍 Searching nearby providers...", class: "info" },
        { text: "✅ Found 8 providers within 5km", class: "success" },
        { text: "📱 Booking request sent to: UrbanClap", class: "success" },
        { text: "✨ Confirmation: #SG-2024-0892", class: "success" }
      ],
      nextCommand: "cat booking_confirmation.json"
    }
  };

  const term = terminals[name] || {
    filename: `${name} / main.py`,
    breadcrumb: `${name} > src`,
    command: `python main.py`,
    output: [
      { text: `🚀 Starting ${project.name}...`, class: "info" },
      { text: `📋 ${project.summary}`, class: "info" },
      { text: "✅ Initialization complete", class: "success" }
    ],
    nextCommand: "echo 'ready'"
  };

  return term;
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