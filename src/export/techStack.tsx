// ─────────────────────────────────────────────────────────────
// // tech.stack — the verified technology grid. Six group cards
// (languages · backend · frontend · database · deploy & cloud ·
// tools) each listing on-brand monochrome chips with Simple
// Icons marks. Purely visual — no links.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, Divider, Logo, monoW } from "./primitives";
import { techGroups } from "../data/technologies";

const PAD = 44;
const COLS = 3;
const GAP = 18;
const CARD_W = (1060 - PAD * 2 - GAP * (COLS - 1)) / COLS; // 312
const CARD_H = 200;
const ROW_H = CARD_H + GAP;

export function TechStackSection({ t }: { t: ThemeTokens }) {
  const top = 100;
  const H = top + ROW_H * 2 + 34;

  const colX = (c: number) => PAD + c * (CARD_W + GAP);

  return (
    <Window t={t} H={H} title="~/tech.stack" cmd="ls ./stack">
      {techGroups.map((g, gi) => {
        const c = gi % COLS;
        const r = Math.floor(gi / COLS);
        const x = colX(c);
        const y = top + r * ROW_H;
        const chipCols = 2;
        const chipW = (CARD_W - PAD * 2 - 10) / chipCols;

        return (
          <g key={g.label}>
            <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={12} fill={t.surface} stroke={t.border} strokeWidth={1} />
            <Text x={x + 20} y={y + 26} size={13} fill={t.textHi} weight={600}>
              ./{g.label}
            </Text>
            <Text x={x + CARD_W - 20} y={y + 26} size={10.5} fill={t.textLow} anchor="end" spacing={0.5}>
              {g.note}
            </Text>
            <Divider x={x} y={y + 40} w={CARD_W} color={t.border} />
            {g.items.map((ch, chi) => {
              const cc = chi % chipCols;
              const cr = Math.floor(chi / chipCols);
              const cx = x + 20 + cc * (chipW + 10);
              const cy = y + 58 + cr * 40;
              return (
                <g key={ch.logo}>
                  <rect x={cx} y={cy} width={chipW} height={30} rx={8} fill={t.surfaceAlt} stroke={t.border} strokeWidth={1} />
                  <Logo id={ch.logo} x={cx + 8} y={cy + 7.5} size={15} fill={t.textMid} />
                  <Text x={cx + 32} y={cy + 19.5} size={12} fill={t.textMid}>
                    {fitChip(ch.name, 12, chipW - 40)}
                  </Text>
                </g>
              );
            })}
          </g>
        );
      })}
    </Window>
  );
}

// local truncation so chips never overflow their slot
function fitChip(text: string, size: number, max: number): string {
  if (monoW(text, size) <= max) return text;
  let out = text;
  while (out.length > 1 && monoW(out + "…", size) > max) out = out.slice(0, -1);
  return out + "…";
}