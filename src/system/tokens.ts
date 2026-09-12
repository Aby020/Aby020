// ─────────────────────────────────────────────────────────────
// AbiLabs profile — design tokens
// Single source of truth for the visual language. Both the Motion
// preview (src/preview) and the SVG export (src/export) read from
// these tokens so the two always stay in sync.
// ─────────────────────────────────────────────────────────────

export type Theme = "dark" | "light";

export interface ThemeTokens {
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceAlt: string;
  surfaceInset: string;
  border: string;
  borderStrong: string;
  gridLine: string;
  textHi: string;
  textMid: string;
  textLow: string;
  accent: string;
  accentHi: string;
  accentDim: string;
  green: string;
  cyan: string;
  violet: string;
  amber: string;
  red: string;
  onAccent: string;
}

export const themes: Record<Theme, ThemeTokens> = {
  dark: {
    bg: "#0a0e13",
    bgDeep: "#070a0f",
    surface: "#0e141b",
    surfaceAlt: "#141c26",
    surfaceInset: "#0a1017",
    border: "#1e2935",
    borderStrong: "#2b3a4d",
    gridLine: "rgba(122,162,247,0.06)",
    textHi: "#e7edf6",
    textMid: "#9aa9bb",
    textLow: "#5e6d80",
    accent: "#4e9fff",
    accentHi: "#8ec3ff",
    accentDim: "#24497a",
    green: "#3fb950",
    cyan: "#4fc3f7",
    violet: "#9f8cf7",
    amber: "#e0b34d",
    red: "#f47067",
    onAccent: "#0a0e13",
  },
  light: {
    bg: "#f6f8fa",
    bgDeep: "#ffffff",
    surface: "#ffffff",
    surfaceAlt: "#f2f5f9",
    surfaceInset: "#f6f8fa",
    border: "#d5dce5",
    borderStrong: "#b9c4d1",
    gridLine: "rgba(30,60,100,0.05)",
    textHi: "#101720",
    textMid: "#46586c",
    textLow: "#7b8a9c",
    accent: "#0969da",
    accentHi: "#1f7bf2",
    accentDim: "#cbe2f7",
    green: "#1a7f37",
    cyan: "#0883be",
    violet: "#6f42c1",
    amber: "#9a6700",
    red: "#cf222e",
    onAccent: "#ffffff",
  },
};

/** Monospace stack — GitHub-safe, no external fonts. */
export const monoFont =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

/** UI stack — system-only, no external fonts. */
export const sansFont =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Approximate em width of a monospace glyph (used for text measuring). */
export const monoChar = 0.6;

export const radius = {
  hero: 16,
  panel: 12,
  card: 10,
  chip: 6,
  button: 8,
};

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 24,
  s6: 32,
  s7: 40,
};

export const type = {
  display: 40,
  h2: 20,
  h2Mono: 16,
  cardTitle: 17,
  body: 14,
  code: 13,
  codeSm: 12,
  meta: 11,
};