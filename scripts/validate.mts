// ─────────────────────────────────────────────────────────────
// Validate — gates every publish. Checks in order:
//   1. manifest ↔ disk: every build in the manifest is exported
//   2. SVG well-formedness (parsed as real XML)
//   3. GitHub-safety: no <script>, <style>, <foreignObject>,
//      no <a>/<link> (SVGs are never clickable), no external
//      URLs, no external fonts
//   4. README integrity: every local path referenced exists;
//      no <script>/<style> leaks through
//   5. Content rules (Phase 27): no Claude/AI/Co-Authored-By
//      anywhere in public output
//   6. Print path hygiene: no spaces, no non-ASCII where banned
//   7. Clean exit unless fixes are required
//    usage: npm run validate
// ─────────────────────────────────────────────────────────────
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DOMParser } from "@xmldom/xmldom";
import { allBuilds } from "../src/export/manifest";

const ROOT = process.cwd();
const GEN = join(ROOT, "assets", "generated");
const README_PATH = join(ROOT, "README.md");

let failures = 0;
function fail(msg: string) {
  console.error(`  ✗ ${msg}`);
  failures++;
}
function pass(msg: string) {
  if (process.argv.includes("--verbose")) console.log(`  ✓ ${msg}`);
}

// ── 1. manifest ↔ disk ────────────────────────────────────────
console.log("1 · manifest ↔ assets/generated");
for (const b of allBuilds) {
  const abs = join(GEN, b.rel);
  if (!existsSync(abs)) fail(`missing export: ${b.rel}`);
}
// every file on disk is in the manifest (no orphans)
for (const dir of ["hero", "sections", "cards", "buttons"]) {
  const absDir = join(GEN, dir);
  if (!existsSync(absDir)) continue;
  for (const f of readdirSync(absDir)) {
    const expected = allBuilds.some((b) => b.rel === `${dir}/${f}`);
    if (!expected) fail(`orphan asset not in manifest: ${dir}/${f}`);
  }
}
pass(`manifest ↔ disk in sync (${allBuilds.length} builds)`);

// ── 2 & 3. SVG well-formedness + GitHub safety ────────────────
console.log("2 · SVG well-formedness + GitHub-safety");
const parser = new DOMParser();
const DISALLOWED = ["script", "style", "foreignobject", "a", "link", "iframe", "object", "embed"];
const svgFiles: string[] = [];
function collectSvg(dir: string) {
  for (const f of readdirSync(dir)) {
    const abs = join(dir, f);
    if (statSync(abs).isDirectory()) collectSvg(abs);
    else if (f.endsWith(".svg")) svgFiles.push(abs);
  }
}
collectSvg(GEN);

for (const abs of svgFiles) {
  const rel = abs.replace(/\\/g, "/").replace(`${ROOT.replace(/\\/g, "/")}/`, "");
  const raw = readFileSync(abs, "utf8");

  // well-formedness
  const doc = parser.parseFromString(raw, "image/svg+xml");
  const parseErr = Array.from(doc.getElementsByTagName("parsererror"));
  if (parseErr.length) fail(`${rel}: not well-formed XML`);
  else pass(`${rel}: well-formed`);

  // disallowed elements — case-insensitive attrs/elements
  const upper = raw.toLowerCase();
  for (const tag of DISALLOWED) {
    if (new RegExp(`<${tag}[\\s>/]`).test(upper)) fail(`${rel}: contains <${tag}>`);
  }

  // clickable behaviour is forbidden inside SVGs
  if (raw.includes("cursor:pointer") || raw.toLowerCase().includes("onclick")) {
    fail(`${rel}: contains interactive markup`);
  }

  // no external resources & no external fonts.
  // `url(#id)` and `href="#id"` are internal fragment refs (gradients/use) — fine.
  // `xmlns="http://..."` is a namespace declaration, not a resource fetch.
  const extFetch = /(?:href|src)\s*=\s*["'][hH][tT][tT][pPsS]:\//.test(raw);
  const extUrlFn = /url\([\"']?https?:/i.test(raw);
  if (extFetch || extUrlFn) fail(`${rel}: references an external resource`);
  if (/@import/.test(raw)) fail(`${rel}: contains @import`);
  if (/<image[\s>/]/.test(raw)) fail(`${rel}: uses <image>`);
}

// ── 4. README integrity ───────────────────────────────────────
console.log("3 · README integrity");
if (!existsSync(README_PATH)) {
  fail("README.md missing");
} else {
  const readme = readFileSync(README_PATH, "utf8");
  const refs = [...readme.matchAll(/srcset="\.\/([^"]+)"/g)].map((m) => m[1]);
  const imgs = [...readme.matchAll(/src="\.\/([^"]+)"/g)].map((m) => m[1]);
  for (const r of [...new Set([...refs, ...imgs])]) {
    if (!existsSync(join(ROOT, r))) fail(`README references missing asset: ${r}`);
  }
  if (/<script[\s>]/i.test(readme)) fail("README contains <script>");
  if (/<style[\s>]/i.test(readme)) fail("README contains <style>");
  if (/<foreignObject/i.test(readme)) fail("README contains <foreignObject>");
}

// ── 5. Content rules (Phase 27) ───────────────────────────────
console.log("4 · content rules (no Claude / no AI attribution)");
// Phase 27: no AUTHORSHIP attribution to Claude/AI in public content.
// Legitimate uses of "AI" as a technology domain are fine — only
// generation/attribution phrases are banned.
const banned = [
  /\bClaude\b/i,
  /\bAnthropic\b/i,
  /Co-Authored-By\s*:?\s*Claude/i,
  /generated\s+(by|with|using)\s+(Claude|AI)\b/i,
  /\bAI[- ]generated\b/i,
  /made\s+with\s+(Claude|AI)\b/i,
  /built\s+(by|with)\s+Claude\b/i,
  /\bClaude\s+(Code\s+)?(made this|wrote this|created this)\b/i,
];
// README + every generated SVG are public output
const contentFiles: string[] = [README_PATH, ...svgFiles];
for (const f of contentFiles) {
  const body = readFileSync(f, "utf8");
  for (const re of banned) {
    if (re.test(body)) fail(`${f.replace(/\\/g, "/")}: matches banned pattern ${re}`);
  }
}
pass("public output clean of AI/Claude attribution");

// ── 6. Path hygiene ───────────────────────────────────────────
console.log("5 · path hygiene");
for (const abs of svgFiles) {
  const rel = abs.replace(/\\/g, "/");
  if (/[^A-Za-z0-9_./-]/.test(rel.split("/").pop()!)) {
    fail(`filename has non-ASCII/space: ${rel}`);
  }
}

console.log("");
if (failures > 0) {
  console.error(`✗ validate FAILED — ${failures} issue(s)`);
  process.exit(1);
}
console.log("✔ validate passed — assets are GitHub-safe and in sync");