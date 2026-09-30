// ─────────────────────────────────────────────────────────────
// Hero section — the showpiece.
//
// A terminal workspace composition:
//   · left   — the ASCII portrait as a "scan canvas" (the real
//              portrait, gatewayed through terminal rendering)
//   · right  — a `profile.sh` transcript: whoami, role, stack,
//              status, focus chips and featured projects
//
// All motion is SMIL (GitHub-safe). Nothing here is ever a link —
// this is a visual only; any button lives in the HTML layer.
//
// Four variants: desktop/mobile × dark/light (tokens switch colors).
// ─────────────────────────────────────────────────────────────
import React from "react";
import { ThemeTokens, Theme, monoFont } from "../system/tokens";
import {
  Svg,
  Text,
  TermDots,
  Divider,
  StatusDot,
  monoW,
  fitMono,
  accentFor,
} from "./primitives";
import { portraitRows } from "./portrait";
import { profile } from "../data/profile";
import { projects } from "../data/projects";

export type HeroSize = "desktop" | "mobile";

// ── detail-pane ink ───────────────────────────────────────────
// The hero transcript is the one place the palette leaves the token
// set: the name gets a white→ice-blue ramp with a glow, the role
// gets a cyan accent, and the shell prompts get a hard emerald.
// Each ramp has a light-theme counterpart so the pane stays legible
// on a white surface — the dark values are unreadable there.
const HERO_INK: Record<Theme, { nameFrom: string; nameTo: string; glow: string; role: string; prompt: string }> = {
  dark: {
    nameFrom: "#ffffff",
    nameTo: "#58a6ff",
    glow: "rgba(88, 166, 255, 0.25)",
    role: "#79c0ff",
    prompt: "#39d353",
  },
  light: {
    nameFrom: "#101720",
    nameTo: "#0969da",
    glow: "rgba(9, 105, 218, 0.18)",
    role: "#0557b0",
    prompt: "#1a7f37",
  },
};

// ── scan motion ───────────────────────────────────────────────
// One vertical oscillation, shared by the trail and the bar. SMIL
// has no `alternate`, so the round trip is spelled out as a
// three-key spline: down to the foot of the canvas, back up.
const SWEEP_DUR = "3.6s";
const SWEEP_EASE = "0.42 0 0.58 1";
const LOCK_LABEL = "LOCK 00:00:01";
const TRAIL_H = 74;

// ── ASCII portrait metrics (identical to the verified source) ──
const LS = -0.15;

// ── chrome constants ─────────────────────────────────────────
const PAD = 20;
const TITLE_H = 46;
const FOOT_H = 40;

interface Layout {
  W: number;
  H: number;
  as: number; // ascii font size
  gridLeft: number;
  gridTop: number;
  scanTop: number; // top of the vertical scan sweep
  scanBottom: number; // bottom of the vertical scan sweep
  px: number;
  py: number;
  pw: number;
  ph: number;
  cap1Y: number;
  cap2Y: number;
  tx: number;
  ty: number;
  tw: number;
  th: number;
  cx: number; // content left edge
  startY: number;
  rightEdge: number; // content right edge (for truncation)
}

function layoutFor(size: HeroSize): Layout {
  if (size === "desktop") {
    const W = 1140;
    const H = 700;
    return {
      W,
      H,
      as: 6.2,
      gridLeft: 69,
      gridTop: 132,
      scanTop: 132,
      scanBottom: 580,
      px: PAD,
      py: TITLE_H,
      pw: 470,
      ph: H - TITLE_H - FOOT_H,
      cap1Y: 580,
      cap2Y: 598,
      tx: PAD + 470 + PAD,
      ty: TITLE_H,
      tw: W - PAD * 2 - 470 - PAD,
      th: H - TITLE_H - FOOT_H,
      cx: PAD + 470 + PAD + 42,
      startY: 96,
      rightEdge: W - PAD - 34,
    };
  }
  const W = 720;
  const H = 1180;
  return {
    W,
    H,
    as: 5.6,
    gridLeft: 193,
    gridTop: 102,
    scanTop: 96,
    scanBottom: 502,
    px: PAD,
    py: TITLE_H,
    pw: W - PAD * 2,
    ph: 486,
    cap1Y: 502,
    cap2Y: 520,
    tx: PAD,
    ty: PAD + 486 + PAD,
    tw: W - PAD * 2,
    th: H - TITLE_H - 486 - PAD * 2 - FOOT_H,
    cx: PAD + 42,
    startY: PAD + 486 + PAD + 42,
    rightEdge: W - PAD - 34,
  };
}

// ── assembled SVG pieces ─────────────────────────────────────

/** Camera target corners around a panel, softly breathing. */
function TargetCorners({
  x,
  y,
  w,
  h,
  color,
  inset = 10,
  len = 14,
  opacity = 0.5,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  inset?: number;
  len?: number;
  opacity?: number;
}) {
  const s = inset;
  const L = len;
  const lo = Math.max(0.05, opacity * 0.8).toFixed(2);
  const hi = Math.min(1, opacity * 1.9).toFixed(2);
  const d = [
    `M ${x + s} ${y + s + L} V ${y + s} H ${x + s + L}`,
    `M ${x + w - s - L} ${y + s} H ${x + w - s} V ${y + s + L}`,
    `M ${x + w - s} ${y + h - s - L} V ${y + h - s} H ${x + w - s - L}`,
    `M ${x + s + L} ${y + h - s} H ${x + s} V ${y + h - s - L}`,
  ].join(" ");
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={1.5} opacity={lo}>
      <animate
        attributeName="opacity"
        values={`${lo};${hi};${lo}`}
        keyTimes="0;0.5;1"
        keySplines={`${SWEEP_EASE};${SWEEP_EASE}`}
        calcMode="spline"
        dur="4.6s"
        repeatCount="indefinite"
      />
    </path>
  );
}

/** Status pill with a pulsing dot, shown on the hero title bar. */
function OpenPill({ t, x, y, w, h = 22 }: { t: ThemeTokens; x: number; y: number; w: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={t.green} opacity={0.12} stroke={t.green} strokeOpacity={0.5} strokeWidth={1} />
      <StatusDot x={x + 14} y={y + h / 2} r={3} color={t.green} dur={2.2} />
      <Text x={x + 24} y={y + h / 2 + 4} size={11} fill={t.green} spacing={1}>
        OPEN TO OPPORTUNITIES
      </Text>
    </g>
  );
}

/** Emerald `$ ` prompt followed by a bold command. */
function Cmd({ t, theme, x, y, cmd }: { t: ThemeTokens; theme: Theme; x: number; y: number; cmd: string }) {
  return (
    <g>
      <Text x={x} y={y} size={13} fill={HERO_INK[theme].prompt} weight={700}>
        $
      </Text>
      <Text x={x + monoW("$ ", 13)} y={y} size={13} fill={t.textHi} weight={600}>
        {cmd}
      </Text>
    </g>
  );
}

/**
 * HUD reticle over the scan canvas: four bracket pairs that breathe
 * between 0.4 and 0.95 opacity, offset by a quarter-period from the
 * scan bar so the overlay never pulses in lockstep with the sweep.
 */
function ReticleBrackets({
  x,
  y,
  w,
  h,
  color,
  inset = 26,
  dur = "3.6s",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  inset?: number;
  dur?: string;
}) {
  const s = inset;
  const d = [
    `M ${x + s + 5} ${y + s} H ${x + s} V ${y + s + 5}`,
    `M ${x + w - s - 5} ${y + s} H ${x + w - s} V ${y + s + 5}`,
    `M ${x + w - s} ${y + h - s - 5} V ${y + h - s} H ${x + w - s - 5}`,
    `M ${x + s + 5} ${y + h - s} H ${x + s} V ${y + h - s - 5}`,
  ].join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}>
        <animate
          attributeName="opacity"
          values="0.4;0.95;0.4"
          keyTimes="0;0.5;1"
          keySplines={`${SWEEP_EASE};${SWEEP_EASE}`}
          calcMode="spline"
          dur={dur}
          begin="-0.9s"
          repeatCount="indefinite"
        />
      </path>
      <path d={d} fill="none" stroke={color} strokeWidth={3} opacity={0.1} strokeLinecap="round">
        <animate
          attributeName="opacity"
          values="0.1;0.3;0.1"
          keyTimes="0;0.5;1"
          keySplines={`${SWEEP_EASE};${SWEEP_EASE}`}
          calcMode="spline"
          dur={dur}
          begin="-0.9s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  );
}

/** Dim `#` comment header with an optional right-aligned counter. */
function Cmt({ t, x, y, text, right, rightX }: { t: ThemeTokens; x: number; y: number; text: string; right?: string; rightX?: number }) {
  return (
    <g>
      <Text x={x} y={y} size={12} fill={t.violet} weight={600}>
        {text}
      </Text>
      {right && rightX !== undefined && (
        <Text x={rightX} y={y} size={11} fill={t.textLow} anchor="end">
          {right}
        </Text>
      )}
    </g>
  );
}

/** One featured project row: accent bar · num · name · tagline. */
function ProjectRow({
  t,
  x,
  rightEdge,
  y,
  num,
  name,
  tagline,
  accent,
}: {
  t: ThemeTokens;
  x: number;
  rightEdge: number;
  y: number;
  num: string;
  name: string;
  tagline: string;
  accent: string;
}) {
  const tagX = x + 30 + monoW(name, 13) + 16;
  const tag = fitMono(tagline, 12.5, rightEdge - tagX);
  return (
    <g>
      <rect x={x - 14} y={y - 12} width={3} height={14} rx={1.5} fill={accent} />
      <Text x={x} y={y} size={13} fill={t.textLow}>
        {num}
      </Text>
      <Text x={x + 30} y={y} size={13} fill={t.textHi} weight={600}>
        {name}
      </Text>
      <Text x={tagX} y={y} size={12.5} fill={t.textLow}>
        {tag}
      </Text>
    </g>
  );
}

// ── the hero ──────────────────────────────────────────────────

export function HeroSection({ t, theme, size }: { t: ThemeTokens; theme: Theme; size: HeroSize }) {
  const L = layoutFor(size);
  const { W, H, as: fs } = L;
  const ink = HERO_INK[theme];
  const isDark = theme === "dark";

  // focus chips wrapped into rows
  const perRow = 3;
  const chipRows: string[][] = [];
  for (let i = 0; i < profile.focus.length; i += perRow) {
    chipRows.push(profile.focus.slice(i, i + perRow));
  }
  // transcript — built sequentially with a running baseline cursor.
  // Sections are appended in order; `yn` advances by each block's height.
  const nodes: React.ReactNode[] = [];
  let yn = L.startY;

  const next = (height: number) => {
    yn += height;
  };
  const at = () => yn;

  // whoami
  nodes.push(<Cmd key="whoami" t={t} theme={theme} x={L.cx} y={at()} cmd="whoami" />);
  next(30);
  nodes.push(
    <text
      key="name"
      x={L.cx}
      y={at()}
      fontSize={30}
      fontWeight={700}
      letterSpacing={0.5}
      fontFamily={monoFont}
      fill="url(#name-ramp)"
      style={{ filter: `drop-shadow(0 0 12px ${ink.glow})` }}
    >
      {profile.name}
    </text>
  );
  next(32);
  nodes.push(
    <Text key="role" x={L.cx} y={at()} size={17} fill={ink.role} weight={500}>
      {profile.role}
    </Text>
  );
  next(36);

  // stack
  nodes.push(<Cmd key="stack" t={t} theme={theme} x={L.cx} y={at()} cmd="stack" />);
  next(24);
  nodes.push(
    <Text key="stackout" x={L.cx} y={at()} size={13} fill={t.textMid}>
      {profile.tagline}
    </Text>
  );
  next(30);

  // status — $ command on one line, output indented on the next
  nodes.push(<Cmd key="status" t={t} theme={theme} x={L.cx} y={at()} cmd="status" />);
  const statusOutY = at() + 22;
  nodes.push(<StatusDot key="status-dot" x={L.cx + 14} y={statusOutY - 4.5} r={4} color={t.green} dur={2.6} />);
  nodes.push(
    <Text key="status-out" x={L.cx + 26} y={statusOutY} size={13} fill={t.green} weight={600}>
      {profile.status}
    </Text>
  );
  next(42);

  // focus
  nodes.push(<Cmt key="focus-h" t={t} x={L.cx} y={at()} text="# focus" />);
  next(26);
  chipRows.forEach((row, ri) => {
    let chipX = L.cx;
    const rowY = at() + ri * 38;
    row.forEach((label) => {
      const w = monoW(label, 12) + 26;
      nodes.push(
        <g key={`chip-${label}`}>
          <rect x={chipX} y={rowY} width={w} height={28} rx={14} fill={t.surfaceAlt} stroke={t.border} strokeWidth={1} />
          <Text x={chipX} y={rowY + 18} size={12} fill={t.textMid}>
            {label}
          </Text>
        </g>
      );
      chipX += w + 10;
    });
  });
  yn += 26 + (chipRows.length - 1) * 38 + 28;

  // featured
  nodes.push(<Cmt key="featured-h" t={t} x={L.cx} y={at()} text="# featured" right={`0${projects.length}`.padStart(2, "0")} rightX={L.rightEdge} />);
  projects.forEach((p, i) => {
    nodes.push(
      <ProjectRow
        key={`feat-${p.num}`}
        t={t}
        x={L.cx}
        rightEdge={L.rightEdge}
        y={at() + 24 + i * 24}
        num={p.num}
        name={p.name}
        tagline={p.tagline}
        accent={accentFor(t, p.accent)}
      />
    );
  });

  // terminal status — the closing line carries its own block cursor,
  // so the prompt reads as one continuous run of text
  const quote = "> building scalable systems";
  const quoteY = at() + 24 + projects.length * 24 + 14;
  nodes.push(
    <text
      key="motto"
      x={L.cx}
      y={quoteY}
      fontSize={12.5}
      fontFamily={monoFont}
      letterSpacing={0.5}
      fill={t.violet}
      opacity={0.78}
    >
      {quote}
      <tspan fill={ink.prompt}>
        {" "}
        <animate
          attributeName="fill-opacity"
          values="1;1;0;0"
          keyTimes="0;0.5;0.6;1"
          dur="1s"
          repeatCount="indefinite"
        />
        ▋
      </tspan>
    </text>
  );

  return (
    <Svg
      width={W}
      height={H}
      title="Abi Thomas — Backend / Full-Stack Developer"
      desc="Terminal profile of Abi Thomas: ASCII portrait, role, skills, status and featured projects"
    >
      <defs>
        <linearGradient id="ascii-signal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.textMid} />
          <stop offset="0.48" stopColor={t.accent} />
          <stop offset="1" stopColor={t.accentHi} />
        </linearGradient>
        <linearGradient id="scan-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.accent} stopOpacity="0" />
          <stop offset="0.5" stopColor={t.accentHi} stopOpacity="0.75" />
          <stop offset="1" stopColor={t.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="name-ramp" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor={ink.nameFrom} />
          <stop offset="1" stopColor={ink.nameTo} />
        </linearGradient>
        <linearGradient id="scan-trail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.accent} stopOpacity="0" />
          <stop offset="0.6" stopColor={t.accent} stopOpacity="0.05" />
          <stop offset="1" stopColor={t.accentHi} stopOpacity="0.16" />
        </linearGradient>
        <pattern id="hero-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <line x1="34" y1="0" x2="34" y2="34" stroke={t.gridLine} strokeWidth="1" />
          <line x1="0" y1="34" x2="34" y2="34" stroke={t.gridLine} strokeWidth="1" />
        </pattern>
        <pattern id="hero-raster" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="1" fill={isDark ? "#7aa2f7" : "#0a2a4d"} />
        </pattern>
      </defs>

      {/* app window */}
      <rect x="1" y="1" width={W - 2} height={H - 2} rx={16} fill={t.bgDeep} />
      <rect x="0" y="0" width={W} height={H} rx={16} fill="none" stroke={t.borderStrong} strokeWidth={1} />

      {/* title bar */}
      <TermDots x={26} y={TITLE_H / 2} />
      <Text x={58} y={TITLE_H / 2 + 4} size={12.5} fill={t.textLow}>
        abi-thomas — zsh
      </Text>
      <OpenPill t={t} x={W - PAD - 196} y={TITLE_H / 2 - 11} w={196} />
      <Divider x={0} y={TITLE_H} w={W} color={t.border} />

      {/* ── portrait canvas ── */}
      <rect x={L.px} y={L.py} width={L.pw} height={L.ph} rx={12} fill={t.surface} stroke={t.border} strokeWidth={1} />
      <rect x={L.px} y={L.py} width={L.pw} height={L.ph} rx={12} fill="url(#hero-grid)" />
      <rect x={L.px} y={L.py} width={L.pw} height={L.ph} rx={12} fill="url(#hero-raster)" opacity={0.05} />
      <TargetCorners x={L.px} y={L.py} w={L.pw} h={L.ph} color={t.accent} />
      <ReticleBrackets x={L.px} y={L.py} w={L.pw} h={L.ph} color={t.accentHi} />
      <Text x={L.px + 14} y={L.py + 20} size={11} fill={t.accent} spacing={2}>
        PORTRAIT://ABI-THOMAS
      </Text>
      <Text x={L.px + L.pw - 14} y={L.py + 20} size={11} fill={t.textLow} spacing={1} anchor="end">
        scan://canvas
      </Text>
      <g>
        <StatusDot
          x={L.px + L.pw - 14 - monoW("scan://canvas", 11) - 16 - monoW(LOCK_LABEL, 10.5) - 12}
          y={L.py + 16}
          r={2.5}
          color={ink.prompt}
          dur={1.8}
        />
        <Text
          x={L.px + L.pw - 14 - monoW("scan://canvas", 11) - 16}
          y={L.py + 20}
          size={10.5}
          fill={ink.prompt}
          spacing={1}
          anchor="end"
          opacity={0.9}
        >
          <animate
            attributeName="opacity"
            values="0.9;0.18;0.9"
            keyTimes="0;0.5;1"
            dur="2.6s"
            repeatCount="indefinite"
          />
          {LOCK_LABEL}
        </Text>
      </g>

      {/* the ASCII portrait */}
      <text
        x={L.gridLeft}
        y={L.gridTop + fs * 0.8}
        fontFamily={monoFont}
        fontSize={fs}
        letterSpacing={LS}
        fill="url(#ascii-signal)"
      >
        {portraitRows.map((row, i) => (
          <tspan key={i} x={L.gridLeft} y={L.gridTop + (i + 1) * fs} xmlSpace="preserve">
            {row}
          </tspan>
        ))}
      </text>

      {/* scan sweep: a fade trail hanging above the bar, and the bar
          itself — one vertical oscillation, phase-matched so the
          trail always sits on the leading edge */}
      <rect
        x={L.px + 6}
        y={L.scanTop - TRAIL_H}
        width={L.pw - 12}
        height={TRAIL_H + 3}
        fill="url(#scan-trail)"
      >
        <animate
          attributeName="y"
          values={`${L.scanTop - TRAIL_H};${L.scanBottom - TRAIL_H};${L.scanTop - TRAIL_H}`}
          keyTimes="0;0.5;1"
          keySplines={`${SWEEP_EASE};${SWEEP_EASE}`}
          calcMode="spline"
          dur={SWEEP_DUR}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.1;0.9;1"
          dur={SWEEP_DUR}
          repeatCount="indefinite"
        />
      </rect>
      <rect x={L.px + 6} y={L.scanTop} width={L.pw - 12} height={3} rx={1.5} fill="url(#scan-line)">
        <animate
          attributeName="y"
          values={`${L.scanTop};${L.scanBottom};${L.scanTop}`}
          keyTimes="0;0.5;1"
          keySplines={`${SWEEP_EASE};${SWEEP_EASE}`}
          calcMode="spline"
          dur={SWEEP_DUR}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          keyTimes="0;0.1;0.9;1"
          dur={SWEEP_DUR}
          repeatCount="indefinite"
        />
      </rect>

      {/* ── transcript panel ── */}
      <rect x={L.tx} y={L.ty} width={L.tw} height={L.th} rx={12} fill={t.surface} stroke={t.border} strokeWidth={1} />
      <Text x={L.tx + 14} y={L.ty + 20} size={11} fill={t.textLow} spacing={2}>
        ~/profile.sh
      </Text>
      <Divider x={L.tx} y={L.ty + 30} w={L.tw} color={t.border} />

      {nodes}

      {/* footer status bar */}
      <rect x={0} y={H - FOOT_H} width={W} height={FOOT_H} fill={t.surfaceAlt} />
      <Divider x={0} y={H - FOOT_H} w={W} color={t.border} />
      <Text x={PAD} y={H - FOOT_H / 2 + 4} size={11.5} fill={t.textLow}>
        {profile.tagline}
      </Text>
      <Text x={W - PAD} y={H - FOOT_H / 2 + 4} size={11.5} fill={t.accent} anchor="end" spacing={1}>
        {profile.motto}
      </Text>
    </Svg>
  );
}