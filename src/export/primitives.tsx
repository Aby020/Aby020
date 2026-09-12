// ─────────────────────────────────────────────────────────────
// SVG primitives — the shared building blocks every exported
// section composes. Every component here is GitHub-safe:
// self-contained, no <style>, no <script>, no <foreignObject>,
// no external fonts, no links.
// ─────────────────────────────────────────────────────────────
import React from "react";
import { monoFont, sansFont, monoChar, ThemeTokens } from "../system/tokens";
import { logoPaths } from "./logos-data";
import type { AccentKey } from "../data/projects";

// ── root wrapper ─────────────────────────────────────────────

export function Svg({
  width,
  height,
  title,
  desc,
  children,
}: {
  width: number;
  height: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby="title description"
    >
      <title id="title">{title}</title>
      <desc id="description">{desc ?? title}</desc>
      {children}
    </svg>
  );
}

// ── text helpers ─────────────────────────────────────────────

interface TextProps {
  x: number;
  y: number;
  size: number;
  fill?: string;
  weight?: number | string;
  anchor?: "start" | "middle" | "end";
  mono?: boolean;
  opacity?: number;
  spacing?: number;
  children: React.ReactNode;
}

export function Text({
  x,
  y,
  size,
  fill = "#9aa9bb",
  weight = 400,
  anchor = "start",
  mono = true,
  opacity,
  spacing,
  children,
}: TextProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily={mono ? monoFont : sansFont}
      opacity={opacity}
      letterSpacing={spacing}
    >
      {children}
    </text>
  );
}

/** Measured width of monospace text (for layout math). */
export function monoW(text: string, size: number): number {
  return Array.from(text).length * size * monoChar;
}

/** Truncate a mono string to fit a pixel budget. */
export function fitMono(text: string, size: number, max: number): string {
  if (monoW(text, size) <= max) return text;
  let out = text;
  while (out.length > 0 && monoW(out + "…", size) > max) out = out.slice(0, -1);
  return out + "…";
}

/** Word-wrap a string into lines, each fitting a pixel budget. */
export function wrapMono(text: string, size: number, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (monoW(t, size) <= max) {
      cur = t;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ── panels & chrome ──────────────────────────────────────────

export function Panel({
  t,
  x,
  y,
  w,
  h,
  rx = 12,
  fill,
  stroke,
  strokeWidth = 1,
  children,
}: {
  t: ThemeTokens;
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={fill ?? t.surface}
        stroke={stroke ?? t.border}
        strokeWidth={strokeWidth}
      />
      {children}
    </g>
  );
}

/** macOS traffic-light dots + centered label (terminal title bar). */
export function TermDots({
  x,
  y,
  r = 5.5,
  gap = 7.5,
}: {
  x: number;
  y: number;
  r?: number;
  gap?: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#f47067" />
      <circle cx={x + r * 2 + gap} cy={y} r={r} fill="#e3b341" />
      <circle cx={x + r * 4 + gap * 2} cy={y} r={r} fill="#3fb950" />
    </g>
  );
}

/** Terminal title bar chrome: dots + optional filename + right meta. */
export function TermBar({
  t,
  x,
  y,
  w,
  h = 40,
  title,
  meta,
}: {
  t: ThemeTokens;
  x: number;
  y: number;
  w: number;
  h?: number;
  title?: string;
  meta?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={t.surfaceAlt}
      />
      <rect x={x} y={y} width={w} height={h - 6} fill={t.surfaceAlt} />
      <TermDots x={x + 18} y={y + h / 2} />
      {title && (
        <Text x={x + 66} y={y + h / 2 + 4} size={12.5} fill={t.textLow}>
          {title}
        </Text>
      )}
      {meta && (
        <Text x={x + w - 18} y={y + h / 2 + 4} size={12} fill={t.textLow} anchor="end">
          {meta}
        </Text>
      )}
    </g>
  );
}

export function Divider({
  x,
  y,
  w,
  color,
}: {
  x: number;
  y: number;
  w: number;
  color: string;
}) {
  return <line x1={x} y1={y} x2={x + w} y2={y} stroke={color} strokeWidth={1} />;
}

// ── motion primitives (SMIL — GitHub-safe) ───────────────────

/** Blinking terminal cursor. */
export function Cursor({
  x,
  y,
  size = 14,
  color = "#8ec3ff",
  dur = 1.3,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  dur?: number;
}) {
  return (
    <rect x={x} y={y - size + 2} width={size * 0.62} height={size - 2} rx={1} fill={color}>
      <animate
        attributeName="opacity"
        values="1;1;0;0"
        keyTimes="0;0.25;0.6;1"
        dur={`${dur}s`}
        repeatCount="indefinite"
      />
    </rect>
  );
}

/** Pulsing status indicator dot. */
export function StatusDot({
  x,
  y,
  r = 4.5,
  color = "#3fb950",
  dur = 2.6,
}: {
  x: number;
  y: number;
  r?: number;
  color?: string;
  dur?: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color}>
        <animate attributeName="opacity" values="1;0.35;1" dur={`${dur}s`} repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={r * 2} fill={color} opacity={0.14}>
        <animate attributeName="opacity" values="0.22;0.05;0.22" dur={`${dur}s`} repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// ── logos ────────────────────────────────────────────────────

/**
 * Brand mark from Simple Icons path data. `size` is the drawn
 * box side; the mark is inset by `pad`. Renders a monochrome path.
 */
export function Logo({
  id,
  x,
  y,
  size,
  fill,
  opacity = 1,
}: {
  id: string;
  x: number;
  y: number;
  size: number;
  fill: string;
  opacity?: number;
}) {
  const d = logoPaths[id];
  if (!d) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${size / 24})`} opacity={opacity}>
      <path d={d} fill={fill} />
    </g>
  );
}

/** Custom roadmap glyph from src/export/glyphs.ts */
export function Glyph({
  d,
  x,
  y,
  size,
  fill,
  opacity = 1,
}: {
  d: string;
  x: number;
  y: number;
  size: number;
  fill: string;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${size / 24})`} opacity={opacity}>
      <path d={d} fill={fill} />
    </g>
  );
}

// ── chips & pills ────────────────────────────────────────────

/** Small tech chip: optional logo + label, rounded pill. */
export function Chip({
  t,
  x,
  y,
  w,
  h = 26,
  label,
  logo,
  logoSize = 14,
  fill,
  stroke,
  textFill,
}: {
  t: ThemeTokens;
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  logo?: string;
  logoSize?: number;
  fill?: string;
  stroke?: string;
  textFill?: string;
}) {
  const textSize = 12.5;
  const pad = 10;
  const hasLogo = !!logo;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={13}
        fill={fill ?? t.surfaceAlt}
        stroke={stroke ?? t.border}
        strokeWidth={1}
      />
      {hasLogo && (
        <Logo id={logo!} x={x + pad} y={y + (h - logoSize) / 2} size={logoSize} fill={textFill ?? t.textMid} />
      )}
      <Text
        x={x + (hasLogo ? pad + logoSize + 7 : w / 2)}
        y={y + h / 2 + (textSize / 2) - 1}
        size={textSize}
        fill={textFill ?? t.textHi}
        anchor={hasLogo ? "start" : "middle"}
        mono={hasLogo}
      >
        {label}
      </Text>
    </g>
  );
}

// ── section chrome ───────────────────────────────────────────

/**
 * Standard section header: mono index, label, divider rule.
 * Used across every informational section for a consistent rhythm.
 */
export function SectionHeader({
  t,
  x,
  y,
  label,
  index,
  width,
  right,
}: {
  t: ThemeTokens;
  x: number;
  y: number;
  label: string;
  index?: string;
  width: number;
  right?: string;
}) {
  const lx = x + (index ? 0 : 0);
  return (
    <g>
      {index && (
        <Text x={lx} y={y} size={12} fill={t.accent} weight={600} spacing={1}>
          {index}
        </Text>
      )}
      <Text
        x={lx + (index ? monoW(index, 12) + 10 : 0)}
        y={y}
        size={14.5}
        fill={t.textHi}
        weight={600}
        spacing={0.5}
      >
        {label}
      </Text>
      <Divider x={x + (index ? monoW(index, 12) + 10 : 0) + monoW(label, 14.5) + 16} y={y - 3.5} w={width - (index ? monoW(index, 12) + 10 : 0) - monoW(label, 14.5) - 16} color={t.border} />
      {right && (
        <Text x={x + width} y={y} size={11.5} fill={t.textLow} anchor="end">
          {right}
        </Text>
      )}
    </g>
  );
}

// ── accent mapping ───────────────────────────────────────────

export const accentFor = (t: ThemeTokens, key: AccentKey): string => {
  switch (key) {
    case "cyan":
      return t.cyan;
    case "violet":
      return t.violet;
    case "green":
      return t.green;
    case "amber":
      return t.amber;
    case "blue":
    default:
      return t.accent;
  }
};