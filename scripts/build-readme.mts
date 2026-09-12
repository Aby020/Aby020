// ─────────────────────────────────────────────────────────────
// README builder — produces the final README.md from exported
// SVG assets. Assembles <picture> elements for dark/light, <a><img>
// pairs for clickable buttons, and the live contribution snake.
//
// Usage: npx tsx scripts/build-readme.mts
// ─────────────────────────────────────────────────────────────
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { profile } from "../src/data/profile";
import { projects } from "../src/data/projects";
import { activity } from "../src/data/activity";

const ROOT = resolve(import.meta.dirname, "..");
const ASSETS = "assets/generated";

// ── helpers ──────────────────────────────────────────────────

/** Dark/light <picture> element wrapping a local SVG. */
function picture(dark: string, light: string, alt: string, extra = "") {
  return [
    `<picture>`,
    `  <source media="(prefers-color-scheme:dark)" srcset="./${dark}">`,
    `  <source media="(prefers-color-scheme:light)" srcset="./${light}">`,
    `  <img src="./${dark}" alt="${esc(alt)}"${extra ? ` ${extra}` : ""} />`,
    `</picture>`,
  ].join("\n");
}

/** Dark/light <picture> element with an absolute URL (snake, remote assets). */
function pictureUrl(dark: string, light: string, fallback: string, alt: string, extra = "") {
  return [
    `<picture>`,
    `  <source media="(prefers-color-scheme:dark)" srcset="${dark}">`,
    `  <source media="(prefers-color-scheme:light)" srcset="${light}">`,
    `  <img src="${fallback}" alt="${esc(alt)}"${extra ? ` ${extra}` : ""} />`,
    `</picture>`,
  ].join("\n");
}

/** Escape HTML special chars in alt text. */
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Hero <picture> — 4 variants: mobile-dark, mobile-light, desktop-dark, desktop-light. */
function heroPicture() {
  const base = ASSETS;
  return [
    `<picture>`,
    `  <source media="(max-width:760px) and (prefers-color-scheme:dark)" srcset="./${base}/hero/hero--mobile--dark.svg">`,
    `  <source media="(max-width:760px)" srcset="./${base}/hero/hero--mobile--light.svg">`,
    `  <source media="(prefers-color-scheme:dark)" srcset="./${base}/hero/hero--desktop--dark.svg">`,
    `  <source media="(prefers-color-scheme:light)" srcset="./${base}/hero/hero--desktop--light.svg">`,
    `  <img src="./${base}/hero/hero--desktop--dark.svg" alt="Abi Thomas — Backend / Full-Stack Developer" width="100%">`,
    `</picture>`,
  ].join("\n");
}

/** Contact button: <a href><img></a> pair. */
function contactBtn(href: string, name: string, label: string) {
  const dark = `${ASSETS}/buttons/${name}--dark.svg`;
  const light = `${ASSETS}/buttons/${name}--light.svg`;
  return [
    `<a href="${href}">`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme:dark)" srcset="./${dark}">`,
    `    <source media="(prefers-color-scheme:light)" srcset="./${light}">`,
    `    <img src="./${dark}" alt="${esc(label)}" height="46">`,
    `  </picture>`,
    `</a>`,
  ].join("\n");
}

/** Repo card row: image (75%) + buttons (25%). */
function repoRow(p: (typeof projects)[number]) {
  const cardDark = `${ASSETS}/cards/${p.num.toLowerCase()}--${p.name.toLowerCase()}--dark.svg`;
  const cardLight = `${ASSETS}/cards/${p.num.toLowerCase()}--${p.name.toLowerCase()}--light.svg`;
  const repoDark = `${ASSETS}/buttons/repo--${p.name.toLowerCase()}--dark.svg`;
  const repoLight = `${ASSETS}/buttons/repo--${p.name.toLowerCase()}--light.svg`;

  const btns: string[] = [
    `<a href="${p.repo}">`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme:dark)" srcset="./${repoDark}">`,
    `    <source media="(prefers-color-scheme:light)" srcset="./${repoLight}">`,
    `    <img src="./${repoDark}" alt="View ${esc(p.name)} Repository" height="31">`,
    `  </picture>`,
    `</a>`,
  ];

  if (p.demo) {
    const demoDark = `${ASSETS}/buttons/demo--${p.name.toLowerCase()}--dark.svg`;
    const demoLight = `${ASSETS}/buttons/demo--${p.name.toLowerCase()}--light.svg`;
    btns.push(
      `<div style="height:8px;"></div>`,
      `<a href="${p.demo}">`,
      `  <picture>`,
      `    <source media="(prefers-color-scheme:dark)" srcset="./${demoDark}">`,
      `    <source media="(prefers-color-scheme:light)" srcset="./${demoLight}">`,
      `    <img src="./${demoDark}" alt="${esc(p.name)} Live Demo" height="31">`,
      `  </picture>`,
      `</a>`
    );
  }

  return [
    `<tr>`,
    `<td style="padding:16px 6px 10px 20px;vertical-align:middle;width:75%;">`,
    picture(cardDark, cardLight, p.name, `width="100%"`),
    `</td>`,
    `<td style="width:25%;text-align:center;vertical-align:middle;padding:16px 20px 10px 6px;">`,
    btns.join("\n"),
    `</td>`,
    `</tr>`,
  ].join("\n");
}

/** Section divider row for the repo table. */
function dividerRow() {
  return `<tr><td colspan="2" style="padding:0 20px;"><div style="height:1px;background:#21262d;"></div></td></tr>`;
}

// ── build the README ─────────────────────────────────────────

const LINKEDIN = profile.contact.linkedin;
const EMAIL = profile.contact.email;
const PORTFOLIO = profile.contact.portfolio;

const lines: string[] = [];

// Header
lines.push(`<!-- Generated by profile build system -->`);
lines.push(``);

// Hero
lines.push(`<p align="center">`);
lines.push(heroPicture());
lines.push(`</p>`);
lines.push(``);

// Contact buttons
lines.push(`<p align="center">`);
lines.push(``);
lines.push(`  ${contactBtn(LINKEDIN, "linkedin", "LinkedIn")}`);
lines.push(`  ${contactBtn(EMAIL, "email", "Email")}`);
lines.push(`  ${contactBtn(PORTFOLIO, "portfolio", "Portfolio")}`);
lines.push(``);
lines.push(`</p>`);
lines.push(``);
lines.push(`<hr>`);
lines.push(``);

// Sections
const sectionMeta: { name: string; label: string; alt: string }[] = [
  { name: "profileJson", label: "// profile.json", alt: "Profile JSON" },
  { name: "about", label: "// about", alt: "About" },
  { name: "techStack", label: "// tech.stack", alt: "Tech Stack" },
];

for (const s of sectionMeta) {
  const dark = `${ASSETS}/sections/${s.name}--dark.svg`;
  const light = `${ASSETS}/sections/${s.name}--light.svg`;
  lines.push(`## ${s.label}`);
  lines.push(``);
  lines.push(picture(dark, light, s.alt, 'width="100%"'));
  lines.push(``);
  lines.push(`<hr>`);
  lines.push(``);
}

// Repositories
lines.push(`## // repositories`);
lines.push(``);
lines.push(`<div style="background:#0d1117;border:1px solid #30363d;border-radius:12px;">`);
lines.push(`<table style="width:100%;border-collapse:collapse">`);
for (let i = 0; i < projects.length; i++) {
  lines.push(repoRow(projects[i]));
  if (i < projects.length - 1) lines.push(dividerRow());
}
lines.push(`</table>`);
lines.push(`</div>`);
lines.push(``);
lines.push(`<hr>`);
lines.push(``);

// Roadmap
lines.push(`## // roadmap`);
lines.push(``);
lines.push(picture(`${ASSETS}/sections/roadmap--dark.svg`, `${ASSETS}/sections/roadmap--light.svg`, "Roadmap", 'width="100%"'));
lines.push(``);
lines.push(`<hr>`);
lines.push(``);

// Activity — snake (live URLs) + stats (local SVG)
lines.push(`## // activity`);
lines.push(``);
lines.push(`<table width="100%">`);
lines.push(`<tr>`);
lines.push(`<td width="70%" valign="top">`);
lines.push(``);
lines.push(pictureUrl(activity.snake.dark, activity.snake.light, activity.snake.fallback, "GitHub contribution grid snake animation", 'width="100%"'));
lines.push(``);
lines.push(`</td>`);
lines.push(`<td width="30%" valign="top" align="center">`);
lines.push(``);
lines.push(picture(`${ASSETS}/sections/activity--dark.svg`, `${ASSETS}/sections/activity--light.svg`, "Activity Stats: Followers 25, Stars 9, Public Repos 7", 'width="100%"'));
lines.push(``);
lines.push(`</td>`);
lines.push(`</tr>`);
lines.push(`</table>`);
lines.push(``);
lines.push(`<hr>`);
lines.push(``);

// Signature
lines.push(`<p align="center">`);
lines.push(``);
lines.push(picture(`${ASSETS}/sections/signature--dark.svg`, `${ASSETS}/sections/signature--light.svg`, profile.motto, 'height="250"'));
lines.push(``);
lines.push(`</p>`);

// Write
const out = resolve(ROOT, "README.md");
writeFileSync(out, lines.join("\n"), "utf-8");
console.log(`✓ README.md written (${lines.length} lines)`);
