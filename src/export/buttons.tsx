// ─────────────────────────────────────────────────────────────
// Buttons — the ONLY interactive surface in the whole profile.
// Each SVG is served through an <a href=…><img src=…></a> pair
// in the README HTML layer; the SVG itself stays link-free.
//
//   contact       linkedin · email · portfolio
//   repositories  REPOSITORY (outline) · LIVE DEMO (filled)
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Svg, Text, Glyph, Logo, monoW } from "./primitives";

// feather-style 24×24 icons
const ICONS: Record<string, string> = {
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  mail: "M22 6l-10 7L2 6M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  play: "M5 3.5l14 8.5-14 8.5z",
};

export const BTN_W = 208;
export const BTN_H = 46;

function Btn({
  t,
  label,
  icon,
  logo,
  variant = "outline",
  W = BTN_W,
  H = BTN_H,
}: {
  t: ThemeTokens;
  label: string;
  icon?: string;
  logo?: string;
  variant?: "outline" | "fill";
  W?: number;
  H?: number;
}) {
  const textSize = 13.5;
  const labelW = monoW(label, textSize);
  const iconSize = 18;
  // lay out: icon at left, then centered-ish label
  const padL = 16;
  const iconX = padL;
  const iconY = H / 2 - iconSize / 2;
  const textX = padL + (logo || icon ? iconSize + 10 : 0);
  const alignX = (W + textX) / 2 - labelW / 2 + (logo || icon ? 5 : 0);

  return (
    <Svg width={W} height={H} title={label} desc={label}>
      {variant === "fill" ? (
        <rect x="1" y="1" width={W - 2} height={H - 2} rx={H / 2} fill={t.green} stroke={t.green} strokeWidth={1} />
      ) : (
        <rect x="1" y="1" width={W - 2} height={H - 2} rx={H / 2} fill={t.surfaceAlt} stroke={t.borderStrong} strokeWidth={1.5} />
      )}
      {logo ? (
        <Logo id={logo} x={iconX} y={iconY} size={iconSize} fill={variant === "fill" ? t.onAccent : t.accent} />
      ) : icon ? (
        <Glyph d={ICONS[icon]} x={iconX} y={iconY} size={iconSize} fill={variant === "fill" ? t.onAccent : t.accent} />
      ) : null}
      <Text
        x={variant === "fill" ? (W - labelW) / 2 : alignX}
        y={H / 2 + textSize / 2 - 1}
        size={textSize}
        fill={variant === "fill" ? t.onAccent : t.accent}
        weight={700}
        spacing={1}
      >
        {label}
      </Text>
    </Svg>
  );
}

export const linkedinButton = (t: ThemeTokens) => (
  <Btn t={t} label="LINKEDIN" icon="external" />
);
export const emailButton = (t: ThemeTokens) => <Btn t={t} label="EMAIL" icon="mail" />;
export const portfolioButton = (t: ThemeTokens) => <Btn t={t} label="PORTFOLIO" icon="external" />;

export const repoButton = (t: ThemeTokens) => <Btn t={t} label="REPOSITORY" logo="github" />;
export const demoButton = (t: ThemeTokens) => (
  <Btn t={t} label="LIVE DEMO" icon="play" variant="fill" />
);