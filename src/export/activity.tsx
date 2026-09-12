// ─────────────────────────────────────────────────────────────
// // activity — GitHub pulse. The contribution snake is served in
// README from the live GitHub Action (output branch) so it updates
// daily; this SVG renders the verified stat snapshot plus the
// snake's mounting frame.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, Divider, StatusDot } from "./primitives";
import { activity } from "../data/activity";

export function ActivitySection({ t }: { t: ThemeTokens }) {
  const H = 300;
  const top = 110;
  const stats = activity.stats;
  const boxW = (1060 - 44 * 2 - 20 * 2) / 3;
  const boxH = 150;

  return (
    <Window t={t} H={H} title="~/activity.log" cmd="history --stats --days 7">
      {stats.map((s, i) => {
        const x = 44 + i * (boxW + 20);
        return (
          <g key={s.key}>
            <rect x={x} y={top} width={boxW} height={boxH} rx={12} fill={t.surface} stroke={t.border} strokeWidth={1} />
            <Text x={x + boxW / 2} y={top + 46} size={42} fill={t.textHi} weight={700} anchor="middle">
              {s.value}
            </Text>
            <Text x={x + boxW / 2} y={top + 78} size={12} fill={t.accent} weight={600} anchor="middle" spacing={2}>
              {s.label}
            </Text>
            <Text x={x + boxW / 2} y={top + boxH - 26} size={11} fill={t.textLow} anchor="middle">
              snapshot · 2026-09
            </Text>
          </g>
        );
      })}

      {/* live snake line */}
      <Divider x={44} y={top + boxH + 24} w={1060 - 88} color={t.border} />
      <StatusDot x={46} y={top + boxH + 48} r={4} color={t.green} dur={2.4} />
      <Text x={60} y={top + boxH + 53} size={12.5} fill={t.textMid}>
        contribution-grid.snake — regenerated daily by GitHub Actions
      </Text>
      <Text x={1060 - 44} y={top + boxH + 53} size={12} fill={t.textLow} anchor="end">
        below in this README
      </Text>
    </Window>
  );
}