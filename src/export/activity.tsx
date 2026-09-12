// ─────────────────────────────────────────────────────────────
// // activity — GitHub pulse. The contribution snake is served in
// README from the live GitHub Action (output branch) so it updates
// daily; this SVG renders the verified stat snapshot as a compact
// developer-dashboard showcase (revealed numbers, small labels,
// subtle indicators, restrained SMIL). Purely visual — no links.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, Divider, StatusDot } from "./primitives";
import { activity } from "../data/activity";

export function ActivitySection({ t }: { t: ThemeTokens }) {
  const H = 380;
  const top = 104;
  const stats = activity.stats;
  const boxW = (1060 - 44 * 2 - 20 * 2) / 3;
  const boxH = 200;

  // per-tile accent so each card reads as its own status cell
  const tileAccent = [t.accent, t.cyan, t.green];

  return (
    <Window t={t} H={H} title="~/activity.log" cmd="history --stats --days 7" right="snapshot · 2026-09">
      {stats.map((s, i) => {
        const x = 44 + i * (boxW + 20);
        const a = tileAccent[i % tileAccent.length];
        return (
          <g key={s.key}>
            {/* stat card */}
            <rect x={x} y={top} width={boxW} height={boxH} rx={12} fill={t.surface} stroke={t.border} strokeWidth={1} />
            {/* top accent hairline */}
            <rect x={x + 16} y={top} width={boxW - 32} height={2.5} rx={1.25} fill={a} opacity={0.5} />

            {/* header — indicator · label · index */}
            <circle cx={x + 20} cy={top + 28} r={3.5} fill={a}>
              <animate attributeName="opacity" values="1;0.35;1" dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" />
            </circle>
            <Text x={x + 33} y={top + 32} size={12} fill={t.textLow} weight={600} spacing={2}>
              {s.label}
            </Text>
            <Text x={x + boxW - 20} y={top + 32} size={10.5} fill={t.textLow} anchor="end" opacity={0.7}>
              0{i + 1}
            </Text>
            <Divider x={x} y={top + 46} w={boxW} color={t.border} />

            {/* value — immediately readable, big + bold */}
            <Text x={x + boxW / 2} y={top + 120} size={56} fill={t.textHi} weight={700} anchor="middle">
              {s.value}
            </Text>
            <rect x={x + boxW / 2 - 16} y={top + 132} width={32} height={2} rx={1} fill={a} opacity={0.5} />

            {/* footer — verified · live */}
            <Text x={x + 20} y={top + boxH - 24} size={11} fill={t.textLow} spacing={1}>
              verified
            </Text>
            <circle cx={x + boxW - 24} cy={top + boxH - 28} r={6} fill={t.green} opacity={0.15} />
            <circle cx={x + boxW - 24} cy={top + boxH - 28} r={3} fill={t.green}>
              <animate attributeName="opacity" values="1;0.35;1" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}

      {/* live snake line */}
      <Divider x={44} y={top + boxH + 28} w={1060 - 88} color={t.border} />
      <StatusDot x={46} y={top + boxH + 52} r={4} color={t.green} dur={2.4} />
      <Text x={60} y={top + boxH + 57} size={12.5} fill={t.textMid}>
        contribution-grid.snake — regenerated daily by GitHub Actions
      </Text>
      <Text x={1060 - 44} y={top + boxH + 57} size={12} fill={t.textLow} anchor="end">
        below in this README
      </Text>
    </Window>
  );
}