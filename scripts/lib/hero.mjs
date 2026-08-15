import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { clamp, escapeXml } from "./xml.mjs";

const GENERATOR_VERSION = "agent-console-v1";

const paletteDefinitions = {
  github: {
    dark: { backgroundStart: "#0d1117", backgroundEnd: "#010409", panel: "#161b22", primary: "#c9d1d9", muted: "#8b949e", cyan: "#58a6ff", blue: "#79c0ff", violet: "#bc8cff", green: "#7ee787", red: "#ff7b72", scanBlend: "screen" },
    light: { backgroundStart: "#ffffff", backgroundEnd: "#f6f8fa", panel: "#ffffff", primary: "#1f2328", muted: "#59636e", cyan: "#0969da", blue: "#0a3069", violet: "#8250df", green: "#1a7f37", red: "#cf222e", scanBlend: "multiply" }
  },
  signal: {
    dark: { backgroundStart: "#020617", backgroundEnd: "#11152F", panel: "#07111F", primary: "#E5E7EB", muted: "#64748B", cyan: "#22D3EE", blue: "#38BDF8", violet: "#7C3AED", green: "#10B981", red: "#F87171", scanBlend: "screen" },
    light: { backgroundStart: "#F8FBFF", backgroundEnd: "#F5F3FF", panel: "#FFFFFF", primary: "#172554", muted: "#64748B", cyan: "#0891B2", blue: "#2563EB", violet: "#6D28D9", green: "#047857", red: "#DC2626", scanBlend: "multiply" }
  },
  ocean: {
    dark: { backgroundStart: "#02131A", backgroundEnd: "#111827", panel: "#061A22", primary: "#E5F6F8", muted: "#6B8791", cyan: "#2DD4BF", blue: "#38BDF8", violet: "#6366F1", green: "#34D399", red: "#FB7185", scanBlend: "screen" },
    light: { backgroundStart: "#F4FCFC", backgroundEnd: "#F4F7FF", panel: "#FFFFFF", primary: "#123047", muted: "#64748B", cyan: "#0F766E", blue: "#0284C7", violet: "#4F46E5", green: "#047857", red: "#BE123C", scanBlend: "multiply" }
  },
  solar: {
    dark: { backgroundStart: "#090D14", backgroundEnd: "#1D1720", panel: "#10141C", primary: "#F3F4F6", muted: "#7C8495", cyan: "#22D3EE", blue: "#60A5FA", violet: "#F59E0B", green: "#34D399", red: "#FB7185", scanBlend: "screen" },
    light: { backgroundStart: "#FBFCFE", backgroundEnd: "#FFF8ED", panel: "#FFFFFF", primary: "#292524", muted: "#78716C", cyan: "#0891B2", blue: "#2563EB", violet: "#B45309", green: "#047857", red: "#BE123C", scanBlend: "multiply" }
  }
};

const layouts = {
  desktop: {
    width: 1180,
    height: 720,
    outerRadius: 18,
    titlebar: { x: 3, y: 3, width: 1174, height: 34, radius: 16 },
    visualPanel: { x: 14, y: 64, width: 488, height: 520, radius: 14 },
    infoPanel: { x: 508, y: 48, width: 655, height: 640, radius: 14 },
    visualTitle: { x: 30, y: 62 },
    infoTitle: { x: 524, y: 62 },
    portrait: {
      columns: 104,
      rows: 68,
      x: 56,
      y: 84,
      lineHeight: 6.2,
      fontSize: 6.2
    },
    portraitClip: { x: 24, y: 82, width: 470, height: 480, radius: 12 },
    system: { x: 528, y: 78, width: 600, lineHeight: 16.5, fontSize: 12.5 },
    footerY: 692
  },
  mobile: {
    width: 720,
    height: 1160,
    outerRadius: 22,
    titlebar: { x: 20, y: 20, width: 680, height: 42, radius: 14 },
    visualPanel: { x: 48, y: 94, width: 624, height: 370, radius: 14 },
    infoPanel: { x: 48, y: 490, width: 624, height: 620, radius: 14 },
    visualTitle: { x: 66, y: 116 },
    infoTitle: { x: 66, y: 512 },
    portrait: {
      columns: 80,
      rows: 54,
      x: 80,
      y: 132,
      lineHeight: 5.7,
      fontSize: 6.6
    },
    portraitClip: { x: 58, y: 122, width: 604, height: 330, radius: 12 },
    system: { x: 72, y: 540, width: 574, lineHeight: 16, fontSize: 12 },
    footerY: 1132
  }
};

// Wrap a string to a max character width so long bio lines stay inside the
// system panel instead of overflowing the canvas.
function wrap(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (current && current.length + 1 + word.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// The terminal transcript rendered in the hero. Every command is real profile
// data: the bio comes from config.about, projects from config.projects, and
// education from the resume (Resume/Resume_AbiThomas.pdf).
function buildProfileLines(config) {
  const bio = wrap(config.profile.about[0], 76);
  const projects = config.projects.slice(0, 4);

  return [
    { type: "prompt", value: "whoami" },
    { type: "output", value: config.profile.name },
    { type: "blank" },

    { type: "prompt", value: "cat profile.md" },
    ...bio.map((line) => ({ type: "output", value: line })),
    { type: "blank" },

    { type: "prompt", value: "cat education.md" },
    { type: "output", value: "Master of Computer Applications (Completed)" },
    { type: "output", value: "APJ Abdul Kalam Technological University" },
    { type: "output", value: "CGPA 7.65 | 2024–2026" },
    { type: "blank" },

    { type: "prompt", value: "cat current-projects.md" },
    ...projects.flatMap((project, index) => [
      { type: "output", value: `${project.name.padEnd(10)}— ${project.focus}` },
      { type: "output", value: `${" ".repeat(12)}${project.tech.join(" · ")}` },
      ...(index < projects.length - 1 ? [{ type: "blank" }] : [])
    ]),
    { type: "blank" },

    { type: "prompt", value: "cat availability.md" },
    { type: "output", value: config.profile.status }
  ];
}

async function validatePortrait(sourceBuffer, sourcePath) {
  const metadata = await sharp(sourceBuffer).metadata();
  if (!metadata.hasAlpha) {
    throw new Error(`Portrait must have a transparent background. ${sourcePath} does not contain an alpha channel.`);
  }

  const { channels } = await sharp(sourceBuffer).ensureAlpha().extractChannel("alpha").stats();
  if (channels[0].min === 255) {
    throw new Error(`Portrait must contain transparent pixels. Remove the background from ${sourcePath} before generating.`);
  }
}

async function samplePortrait(sourceBuffer, columns, rows) {
  const trimOptions = { background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 };
  const resizeOptions = { fit: "fill", kernel: sharp.kernel.lanczos3 };
  const luminancePipeline = sharp(sourceBuffer)
    .ensureAlpha()
    .trim(trimOptions)
    .flatten({ background: "#ffffff" })
.greyscale()
.normalise()
.gamma(1.15)
.modulate({
  brightness: 1.10,
  saturation: 0
})
.sharpen({
  sigma: 1.4,
  m1: 1.5,
  m2: 3
})
.resize(columns, rows, {
  fit: "fill",
  kernel: "lanczos3"
})
    .raw()
    .toBuffer({ resolveWithObject: true });
  const alphaPipeline = sharp(sourceBuffer)
    .ensureAlpha()
    .trim(trimOptions)
    .extractChannel("alpha")
    .resize(columns, rows, resizeOptions)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [{ data: luminance, info }, { data: alpha }] = await Promise.all([luminancePipeline, alphaPipeline]);
  const pixels = Buffer.alloc(luminance.length);

  for (let index = 0; index < luminance.length; index += 1) {
    const opacity = alpha[index] / 255;
    pixels[index] = Math.round(255 - opacity * (255 - luminance[index]));
  }

  return { pixels, width: info.width, height: info.height };
}

function createAsciiTspans({ pixels, width, height }, placement) {
 const characters =
" .,:-=+*#%@";
  const rows = [];

  for (let row = 0; row < height; row += 1) {
    let line = "";
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const pixel = pixels[index];
      const left = pixels[row * width + Math.max(column - 1, 0)];
      const right = pixels[row * width + Math.min(column + 1, width - 1)];
      const above = pixels[Math.max(row - 1, 0) * width + column];
      const below = pixels[Math.min(row + 1, height - 1) * width + column];
      const darkness = (255 - pixel) / 255;
      const edge = (Math.abs(right - left) + Math.abs(below - above)) / 510;
      if (darkness < 0.045 && edge < 0.04) {
        line += " ";
        continue;
      }
     const ink = clamp(
    darkness * 1.05 +
    edge * 0.35 -
    0.02,
    0,
    1
);
     const asciiIndex = Math.floor(
  ink * (characters.length - 1)
);

line += characters[asciiIndex];
    }

    rows.push(`<tspan x="${placement.x}" y="${(placement.y + row * placement.lineHeight).toFixed(2)}" xml:space="preserve">${escapeXml(line)}</tspan>`);
  }

  return rows.join("\n");
}

function createLineNumberTspans(rowCount, placement, colors) {
  const padWidth = String(rowCount).length;
  const rows = [];
  for (let row = 0; row < rowCount; row += 1) {
    const num = String(row + 1).padStart(padWidth, " ");
    rows.push(`<tspan x="${placement.x}" y="${(placement.y + row * placement.lineHeight).toFixed(2)}" fill="${colors.muted}" opacity="0.35" xml:space="preserve">${escapeXml(num)}</tspan>`);
  }
  return rows.join("\n");
}

function buildSystemLayer(profileLines, { x, y, width, lineHeight, fontSize }, colors) {
  const clips = [];
  const rows = [];

  profileLines.forEach((line, index) => {
    if (line.type === "blank") return;
    const id = `system-line-${index}`;
    const lineY = y + index * lineHeight;
    const begin = (0.45 + index * 0.12).toFixed(2);

    clips.push(`<clipPath id="${id}"><rect x="${x - 3}" y="${(lineY - fontSize - 2).toFixed(2)}" width="0" height="${fontSize + 8}"><animate attributeName="width" from="0" to="${width}" dur="0.34s" begin="${begin}s" fill="freeze"/></rect></clipPath>`);

    if (line.type === "prompt") {
      rows.push(`<g clip-path="url(#${id})"><text x="${x}" y="${lineY}" class="system-row"><tspan class="system-prompt" fill="${colors.green}">$</tspan><tspan fill="${colors.muted}"> </tspan><tspan class="system-command" fill="${colors.primary}">${escapeXml(line.value)}</tspan></text></g>`);
    } else {
      rows.push(`<g clip-path="url(#${id})"><text x="${x + 18}" y="${lineY}" class="system-row" fill="${colors.muted}">${escapeXml(line.value)}</text></g>`);
    }
  });

  return { clips: clips.join("\n"), rows: rows.join("\n") };
}

// Create animated </> code symbol with fade in/out and terminal glow
function createCodeSymbol(visual, colors) {
  const centerX = visual.x + visual.width / 2;
  const centerY = visual.y + visual.height / 2;

  // Symbol dimensions - size it to fit nicely in the visual panel
  const fontSize = visual.width > 500 ? 120 : 90;
  const charWidth = fontSize * 0.6;

  // Animation durations and timing
  const fadeDur = "4s";

  return `
  <!-- Animated </> code symbol -->
  <text
    x="${centerX}"
    y="${centerY + fontSize * 0.35}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Courier New', Consolas, monospace"
    font-size="${fontSize}"
    font-weight="700"
    fill="${colors.cyan}"
    filter="url(#code-symbol-glow)"
    style="letter-spacing: -0.02em;"
  >
    </>
    <!-- Fade in/out animation -->
    <animate
      attributeName="opacity"
      values="0;1;1;0;0"
      keyTimes="0;0.15;0.85;1;1"
      dur="5s"
      repeatCount="indefinite"
      begin="0.5s"
    />
    <!-- Color pulse animation (cyan to violet to blue and back) -->
    <animate
      attributeName="fill"
      values="${colors.cyan};${colors.violet};${colors.blue};${colors.cyan}"
      dur="8s"
      repeatCount="indefinite"
    />
  </text>

  <!-- Subtle scanning line effect behind the symbol -->
  <line
    x1="${visual.x + 30}"
    y1="${centerY}"
    x2="${visual.x + visual.width - 30}"
    y2="${centerY}"
    stroke="${colors.cyan}"
    stroke-width="0.5"
    stroke-dasharray="8,12"
    opacity="0.3"
  >
    <animate
      attributeName="stroke-dashoffset"
      from="0"
      to="20"
      dur="3s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="opacity"
      values="0.1;0.3;0.1"
      dur="4s"
      repeatCount="indefinite"
    />
  </line>

  <!-- Accent brackets at corners -->
  <g fill="none" stroke="${colors.blue}" stroke-width="1.5" opacity="0.4">
    <!-- Top-left -->
    <path d="M ${visual.x + 20} ${visual.y + 20} L ${visual.x + 20} ${visual.y + 50} L ${visual.x + 50} ${visual.y + 50}"/>
    <!-- Top-right -->
    <path d="M ${visual.x + visual.width - 20} ${visual.y + 20} L ${visual.x + visual.width - 20} ${visual.y + 50} L ${visual.x + visual.width - 50} ${visual.y + 50}"/>
    <!-- Bottom-left -->
    <path d="M ${visual.x + 20} ${visual.y + visual.height - 20} L ${visual.x + 20} ${visual.y + visual.height - 50} L ${visual.x + 50} ${visual.y + visual.height - 50}"/>
    <!-- Bottom-right -->
    <path d="M ${visual.x + visual.width - 20} ${visual.y + visual.height - 20} L ${visual.x + visual.width - 20} ${visual.y + visual.height - 50} ${visual.y + visual.height - 50}"/>
  </g>
`;
}

function createHeroSvg(config, colors, size) {
  const layout = layouts[size];
  const titlebar = layout.titlebar;
  const visual = layout.visualPanel;
  const info = layout.infoPanel;
  const profileLines = buildProfileLines(config);
  const system = buildSystemLayer(profileLines, layout.system, colors);
  const isDesktop = size === "desktop";
  const titleCenter = titlebar.x + titlebar.width / 2;
  const terminalUser = config.profile.username.slice(0, isDesktop ? 22 : 14);
  const lastPromptIndex = profileLines.map((line) => line.type).lastIndexOf("prompt");
  const lastPrompt = profileLines[lastPromptIndex];
  const cursorX = layout.system.x + layout.system.fontSize * 0.6 * (lastPrompt.value.length + 2) + 2;
  const cursorY = layout.system.y + lastPromptIndex * layout.system.lineHeight - layout.system.fontSize - 2;
  const footerComment = `# ${config.footer}`;
  const portfolioUrl = config.portfolio || "https://abi-thomas-portfolio.vercel.app/";

  // CTA button dimensions
  const ctaWidth = isDesktop ? 280 : 240;
  const ctaHeight = isDesktop ? 40 : 36;
  const ctaX = (layout.width - ctaWidth) / 2;
  const ctaY = layout.footerY - (isDesktop ? 50 : 70);
  const ctaRadius = 8;

  // Status indicator (green pulsing dot + text)
  const statusX = isDesktop ? visual.x + visual.width - 180 : visual.x + visual.width - 160;
  const statusY = visual.y - (isDesktop ? 30 : 28);
  const statusDotR = 5;

  // CTA gradient and glow
  const ctaGradientId = "cta-gradient";
  const ctaGlowId = "cta-glow";

  // Code symbol in visual panel
  const codeSymbol = createCodeSymbol(visual, colors);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="title description">
<title id="title">${escapeXml(config.profile.name)} - ${escapeXml(config.profile.headline)}</title>
<desc id="description">An animated terminal workspace with a code symbol, professional focus, featured projects, and public links.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.backgroundStart}"/><stop offset="1" stop-color="${colors.backgroundEnd}"/></linearGradient>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors.violet}"/><stop offset="0.48" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.green}"/></linearGradient>
  ${system.clips}
  <!-- CTA Button Gradient -->
  <linearGradient id="${ctaGradientId}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.violet}"/></linearGradient>
  <!-- CTA Glow Filter -->
  <filter id="${ctaGlowId}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <!-- Code Symbol Glow Filter -->
  <filter id="code-symbol-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.8 0" result="glow"/>
    <feMerge>
      <feMergeNode in="glow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <style>
    .mono { font-family: 'Courier New', Consolas, monospace; }
    .panel-title { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 11 : 12}px; letter-spacing: 2px; fill: ${colors.blue}; opacity: 0.8; }
    .terminal-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 12 : 11}px; letter-spacing: 0.5px; fill: ${colors.muted}; }
    .system-row { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize}px; }
    .system-prompt, .system-command { font-weight: 700; }
    text, tspan { white-space: pre; }
  </style>
</defs>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#background)"/>
<rect x="${titlebar.x}" y="${titlebar.y}" width="${titlebar.width}" height="${titlebar.height}" rx="${titlebar.radius}" fill="${colors.panel}" fill-opacity="0.84"/>
<circle cx="${titlebar.x + 21}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="#EF4444"/><circle cx="${titlebar.x + 39}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="#F59E0B"/><circle cx="${titlebar.x + 57}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.green}"/>
<text x="${titleCenter}" y="${titlebar.y + titlebar.height / 2 + 5}" text-anchor="middle" class="terminal-label">${escapeXml(terminalUser)}@github: ~/README.md</text>
<rect x="${visual.x}" y="${visual.y}" width="${visual.width}" height="${visual.height}" rx="${visual.radius}" fill="${colors.panel}" fill-opacity="0.5" stroke="url(#border)" stroke-opacity="0.4"/>
<rect x="${info.x}" y="${info.y}" width="${info.width}" height="${info.height}" rx="${info.radius}" fill="${colors.panel}" fill-opacity="0.5" stroke="url(#border)" stroke-opacity="0.4"/>
<text x="${layout.visualTitle.x}" y="${layout.visualTitle.y}" class="panel-title">~/visual.md</text>
<text x="${layout.infoTitle.x}" y="${layout.infoTitle.y}" class="panel-title">~/profile.sh</text>
${codeSymbol}
${system.rows}
<rect x="${cursorX.toFixed(1)}" y="${cursorY.toFixed(1)}" width="9" height="${layout.system.fontSize + 2}" fill="${colors.green}" opacity="0"><animate attributeName="opacity" values="0;0;1;0;1;0;1;0" keyTimes="0;0.02;0.05;0.35;0.5;0.7;0.85;1" dur="1.4s" begin="2.8s" repeatCount="indefinite"/></rect>

<!-- Status Indicator (top-right of visual panel) -->
<g transform="translate(${statusX}, ${statusY})">
  <circle cx="${statusDotR}" cy="${statusDotR}" r="${statusDotR}" fill="${colors.green}">
    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="${statusDotR * 2 + 8}" y="${statusDotR + 4}" class="mono" font-size="${isDesktop ? 10 : 9}" fill="${colors.green}" font-weight="600">● Open to Opportunities</text>
</g>

<!-- Portfolio CTA Button (bottom center) -->
<a href="${portfolioUrl}" target="_blank" rel="noopener noreferrer">
  <g filter="url(#${ctaGlowId})">
    <rect x="${ctaX}" y="${ctaY}" width="${ctaWidth}" height="${ctaHeight}" rx="${ctaRadius}" fill="url(#${ctaGradientId})">
      <animate attributeName="opacity" values="1;0.85;1" dur="3s" repeatCount="indefinite"/>
    </rect>
    <text x="${ctaX + ctaWidth / 2}" y="${ctaY + ctaHeight / 2 + 5}" text-anchor="middle" class="mono" font-size="${isDesktop ? 13 : 12}" fill="#ffffff" font-weight="600">View My Portfolio</text>
  </g>
</a>

<text x="${layout.width / 2}" y="${layout.footerY}" text-anchor="middle" class="mono" font-size="10" letter-spacing="1.5" fill="${colors.muted}">${escapeXml(footerComment)}</text>
<rect x="3" y="3" width="${layout.width - 6}" height="${layout.height - 6}" rx="${layout.outerRadius - 2}" fill="none" stroke="url(#border)" stroke-width="2" opacity="0.76"><animate attributeName="opacity" values="0.5;0.94;0.5" dur="3.4s" repeatCount="indefinite"/></rect>
</svg>`;
}

async function cleanOldAssets(outputDirectory, currentFiles) {
  const entries = await readdir(outputDirectory).catch(() => []);
  const generatedPattern = /^agent-console-[a-f0-9]{8}-(?:mobile-)?(?:dark|light)\.svg$/;
  await Promise.all(entries
    .filter((entry) => generatedPattern.test(entry) && !currentFiles.includes(entry))
    .map((entry) => unlink(resolve(outputDirectory, entry))));
}

export async function generateHeroAssets({ config, outputDirectory }) {
  const version = createHash("sha256")
    .update(GENERATOR_VERSION)
    .update(JSON.stringify(config))
    .digest("hex")
    .slice(0, 8);
  const palette = paletteDefinitions[config.appearance.palette];
  const assets = {
    desktopDark: `agent-console-${version}-dark.svg`,
    desktopLight: `agent-console-${version}-light.svg`,
    mobileDark: `agent-console-${version}-mobile-dark.svg`,
    mobileLight: `agent-console-${version}-mobile-light.svg`
  };

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, assets.desktopDark), createHeroSvg(config, palette.dark, "desktop")),
    writeFile(resolve(outputDirectory, assets.desktopLight), createHeroSvg(config, palette.light, "desktop")),
    writeFile(resolve(outputDirectory, assets.mobileDark), createHeroSvg(config, palette.dark, "mobile")),
    writeFile(resolve(outputDirectory, assets.mobileLight), createHeroSvg(config, palette.light, "mobile"))
  ]);
  await cleanOldAssets(outputDirectory, Object.values(assets));

  const manifest = { generator: GENERATOR_VERSION, version, assets };
  await writeFile(resolve(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
