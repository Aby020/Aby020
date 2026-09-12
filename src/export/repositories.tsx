// ─────────────────────────────────────────────────────────────
// Repository cards — one visual card per project. These SVGs are
// STRICTLY non-interactive: no links, no hit targets. Clickable
// behaviour lives in ../buttons.tsx, served as separate <a><img>
// pairs in the README HTML layer.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Svg, Text, TermDots, Divider, monoW, wrapMono, accentFor } from "./primitives";
import { Project } from "../data/projects";

export const CARD_W = 820;
export const CARD_H = 220;

const TITLE_H = 40;

function StackChips({
  t,
  x,
  y,
  stack,
  accent,
  maxW,
}: {
  t: ThemeTokens;
  x: number;
  y: number;
  stack: string[];
  accent: string;
  maxW: number;
}) {
  // fit as many chips as the row allows, then fold the rest into "+N"
  const sizes: number[] = [];
  let used = 0;
  for (const s of stack) {
    const w = monoW(s, 11.5) + 26;
    if (used + w > maxW) break;
    sizes.push(w);
    used += w + 8;
  }
  const shown = sizes.length;
  const hidden = stack.length - shown;

  let cx = x;
  return (
    <g>
      {stack.slice(0, shown).map((s, i) => {
        const w = sizes[i];
        const el = (
          <g key={s}>
            <rect x={cx} y={y} width={w} height={26} rx={8} fill={t.surfaceAlt} stroke={t.border} strokeWidth={1} />
            <Text x={cx + w / 2} y={y + 17} size={11.5} fill={t.textMid} anchor="middle">
              {s}
            </Text>
          </g>
        );
        cx += w + 8;
        return el;
      })}
      {hidden > 0 && (
        <g key="+more">
          <rect x={cx} y={y} width={monoW(`+${hidden}`, 11.5) + 18} height={26} rx={8} fill={accent} opacity={0.14} stroke={accent} strokeOpacity={0.5} strokeWidth={1} />
          <Text x={cx + 9 + monoW(`+${hidden}`, 11.5) / 2} y={y + 17} size={11.5} fill={accent} weight={600} anchor="middle">
            +{hidden}
          </Text>
        </g>
      )}
    </g>
  );
}

export function RepoCard({ t, project }: { t: ThemeTokens; project: Project }) {
  const accent = accentFor(t, project.accent);
  const sumW = CARD_W - 60;
  const sum = wrapMono(project.summary, 13, sumW).slice(0, 2);
  const chipsMaxW = CARD_W - 60;

  return (
    <Svg width={CARD_W} height={CARD_H} title={project.name} desc={project.tagline}>
      <rect x="1" y="1" width={CARD_W - 2} height={CARD_H - 2} rx={14} fill="none" stroke={t.borderStrong} strokeWidth={1} />
      <rect x="0" y="0" width={CARD_W} height={CARD_H} rx={14} fill={t.bgDeep} />

      {/* mini title bar */}
      <TermDots x={18} y={TITLE_H / 2} />
      <Text x={50} y={TITLE_H / 2 + 4} size={12.5} fill={t.textLow}>
        ~/{project.name}
      </Text>
      <Text x={CARD_W - 20} y={TITLE_H / 2 + 4} size={12} fill={accent} anchor="end" weight={600}>
        {project.num}
      </Text>
      <Divider x={0} y={TITLE_H} w={CARD_W} color={t.border} />

      {/* name + tagline */}
      <Text x={30} y={76} size={21} fill={accent} weight={700}>
        {project.name}
      </Text>
      <Text x={30} y={76 + 24} size={12.5} fill={t.textLow}>
        {project.tagline}
      </Text>

      {/* summary (max 2 wrapped lines) */}
      {sum.map((l, i) => (
        <Text key={i} x={30} y={132 + i * 24} size={13} fill={t.textMid}>
          {l}
        </Text>
      ))}

      {/* stack chips */}
      <StackChips t={t} x={30} y={186} stack={project.stack} accent={accent} maxW={chipsMaxW} />
    </Svg>
  );
}