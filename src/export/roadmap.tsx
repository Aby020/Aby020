// ─────────────────────────────────────────────────────────────
// // roadmap — what Abi is currently exploring. Honest framing:
// these are learning tracks, not completed achievements. Each
// row pairs a custom glyph with a short note and an EXPLORING tag.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, Divider, Glyph } from "./primitives";
import { roadmap } from "../data/roadmap";
import { roadmapGlyphs } from "./glyphs";

export function RoadmapSection({ t }: { t: ThemeTokens }) {
  const rowH = 68;
  const H = 108 + roadmap.length * rowH + 22;
  const top = 108;
  const ring = t.amber;

  return (
    <Window t={t} H={H} title="~/roadmap.md" cmd="cat ./roadmap.md">
      {roadmap.map((r, i) => {
        const y = top + i * rowH;
        return (
          <g key={r.id}>
            <rect x={44} y={y} width={44} height={44} rx={10} fill={t.surfaceAlt} stroke={t.border} strokeWidth={1} />
            <Glyph d={roadmapGlyphs[r.icon]} x={52} y={y + 10} size={24} fill={ring} />
            <Text x={102 + 10} y={y + 18} size={14.5} fill={t.textHi} weight={600}>
              {r.title}
            </Text>
            <Text x={102 + 10} y={y + 38} size={12} fill={t.textLow}>
              {r.note}
            </Text>
            <g>
              <rect x={1060 - 44 - 116} y={y + 10} width={116} height={24} rx={12} fill={ring} opacity={0.12} stroke={ring} strokeOpacity={0.5} strokeWidth={1} />
              <Text x={1060 - 44 - 116 + 58} y={y + 25} size={11} fill={ring} weight={700} anchor="middle" spacing={1}>
                EXPLORING
              </Text>
            </g>
            {i < roadmap.length - 1 && <Divider x={44} y={y + rowH} w={1060 - 88} color={t.border} />}
          </g>
        );
      })}
    </Window>
  );
}