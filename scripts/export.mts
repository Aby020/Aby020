// ─────────────────────────────────────────────────────────────
// Export pipeline — renders every asset in the manifest to
// self-contained GitHub-compatible SVGs, then rasterizes a QA
// preview set through sharp for visual inspection.
//    usage: npm run export        (writes assets/generated/**)
//           npm run export -- --no-qa
// ─────────────────────────────────────────────────────────────
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { allBuilds } from "../src/export/manifest";

const ROOT = process.cwd();
const OUT = join(ROOT, "assets", "generated");
const PREVIEW = join(ROOT, "assets", "_preview");
const noQa = process.argv.includes("--no-qa");

rmSync(OUT, { recursive: true, force: true });
if (!noQa) rmSync(PREVIEW, { recursive: true, force: true });
for (const dir of [OUT, PREVIEW]) mkdirSync(dir, { recursive: true });

let written = 0;
for (const b of allBuilds) {
  const svg = renderToStaticMarkup(b.element);
  const abs = join(OUT, b.rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, svg, "utf8");
  written++;
}
console.log(`✔ exported ${written} SVG assets → ${OUT.replace(ROOT, ".")}`);

// ── QA rasterization ──────────────────────────────────────────
if (!noQa) {
  const darkHeroes = allBuilds.filter((b) => b.kind === "hero" && b.rel.endsWith("--dark.svg"));
  const darkSections = allBuilds.filter((b) => b.kind === "section" && b.rel.endsWith("--dark.svg"));
  const buttons = allBuilds.filter((b) => b.kind === "button" && b.rel.endsWith("--dark.svg"));
  const cards = allBuilds.filter((b) => b.kind === "card" && b.rel.endsWith("--dark.svg"));

  const targets = [...darkHeroes, ...darkSections, ...cards, ...buttons];
  for (const b of targets) {
    const svg = renderToStaticMarkup(b.element);
    const scale = b.kind === "hero" ? 0.5 : 1;
    try {
      const png = await sharp(Buffer.from(svg))
        .resize({ width: Math.round(b.w * scale) })
        .png()
        .toBuffer();
      const name = b.rel.replace(/[\\/]/g, "__").replace(/\.svg$/, ".png");
      writeFileSync(join(PREVIEW, name), png);
    } catch (err) {
      console.error(`  ✗ rasterize failed: ${b.rel} — ${(err as Error).message}`);
    }
  }
  console.log(`✔ wrote QA previews → ${PREVIEW.replace(ROOT, ".")}`);
}