// ─────────────────────────────────────────────────────────────
// Buttons — the ONLY interactive surface in the whole profile.
// Each SVG is served through an <a href=…><img src=…></a> pair
// in the README HTML layer; the SVG itself stays link-free.
//
//   contact       linkedin · email · portfolio
//   repositories  REPOSITORY (outline) · LIVE DEMO (filled)
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Svg, Text, Glyph, Logo, monoW, sansW } from "./primitives";

// feather-style 24×24 icons
const ICONS: Record<string, string> = {
  play: "M5 3.5l14 8.5-14 8.5z",
};

export const BTN_W = 208;
export const BTN_H = 46;

// ── contact buttons ──────────────────────────────────────────
// The hero row is a matched set: one fixed width, one height,
// one radius, so all three read as a single unit. Width stays at
// BTN_W so the row keeps its established footprint in the README;
// only the internal layout is rebalanced.
export const CONTACT_BTN_W = 208;
export const CONTACT_BTN_H = 40;

/**
 * Optical sizing per mark. All three paths fill their 24×24 box, so a
 * single scale renders them at wildly different visual weights: the
 * globe is a solid disc and reads far heavier than the LinkedIn wordmark
 * box. These factors level them out. The circle and envelope marks are
 * geometrically centred, so they need no x-shift.
 */
const LOGO_OPTICS: Record<string, { scale: number; dx: number; dy: number }> = {
  linkedin: { scale: 1, dx: 0, dy: 0 },
  gmail: { scale: 0.9, dx: 0, dy: 0.1 },
  portfolio: { scale: 0.82, dx: 0, dy: 0 },
};

/**
 * Contact button — a glass pill with the brand mark and label optically
 * centred as one group. The group is centred on the box's midpoint and
 * both the mark and the text are placed with `middle` anchors, so left
 * and right padding are equal by construction and the three buttons
 * line up across the row regardless of label length.
 */
function ContactBtn({
  t,
  label,
  logo,
}: {
  t: ThemeTokens;
  label: string;
  logo: string;
}) {
  const W = CONTACT_BTN_W;
  const H = CONTACT_BTN_H;
  const textSize = 13;
  const spacing = 0.4;
  const iconSize = 16;
  const gap = 9;
  const cy = H / 2;

  const labelW = sansW(label, textSize) + (label.length - 1) * spacing;
  const groupW = iconSize + gap + labelW;
  const groupX = (W - groupW) / 2;

  const optics = LOGO_OPTICS[logo] ?? { scale: 1, dx: 0, dy: 0 };
  const drawn = iconSize * optics.scale;

  return (
    <Svg width={W} height={H} title={label} desc={label}>
      <rect
        x="0.5"
        y="0.5"
        width={W - 1}
        height={H - 1}
        rx={H / 2}
        fill={t.surfaceAlt}
        stroke={t.borderStrong}
        strokeWidth={1}
      />
      <Logo
        id={logo}
        x={groupX + (iconSize - drawn) / 2 + optics.dx}
        y={cy - drawn / 2 + optics.dy}
        size={drawn}
        fill={t.textMid}
      />
      <Text
        x={groupX + iconSize + gap + labelW / 2}
        y={cy + textSize * 0.35}
        size={textSize}
        fill={t.textHi}
        weight={500}
        spacing={spacing}
        mono={false}
        anchor="middle"
      >
        {label}
      </Text>
    </Svg>
  );
}

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
  <ContactBtn t={t} label="LinkedIn" logo="linkedin" />
);
export const emailButton = (t: ThemeTokens) => <ContactBtn t={t} label="Email" logo="gmail" />;
export const portfolioButton = (t: ThemeTokens) => (
  <ContactBtn t={t} label="Portfolio" logo="portfolio" />
);

export const repoButton = (t: ThemeTokens) => <Btn t={t} label="REPOSITORY" logo="github" />;
export const demoButton = (t: ThemeTokens) => (
  <Btn t={t} label="LIVE DEMO" icon="play" variant="fill" />
);