// ─────────────────────────────────────────────────────────────
// // about — bio, focus areas, education and current exploration.
// Two-column: the summary text on the left, education +
// currently-learning on the right.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, Divider, wrapMono, accentFor } from "./primitives";
import { profile } from "../data/profile";

const SOLID = 13;

export function AboutSection({ t }: { t: ThemeTokens }) {
  const y0 = 96;
  const leftX = 44;
  const leftW = 555;
  const rightX = 660;

  // wrap the two summary paragraphs
  const p1 = wrapMono(profile.summary[0], SOLID, leftW);
  const p2 = wrapMono(profile.summary[1], SOLID, leftW);

  const focusItems = profile.focus;
  const accent = accentFor(t, "green");

  const H = 470;

  return (
    <Window t={t} H={H} title="~/about.md" cmd="cat ~/about.md">
      {/* ── left column ── */}
      <Text x={leftX} y={y0} size={12} fill={t.violet} weight={600}>
        # about
      </Text>
      {p1.map((l, i) => (
        <Text key={`p1-${i}`} x={leftX} y={y0 + 34 + i * 23} size={SOLID} fill={t.textMid}>
          {l}
        </Text>
      ))}
      {p2.map((l, i) => (
        <Text key={`p2-${i}`} x={leftX} y={y0 + 34 + p1.length * 23 + 8 + i * 23} size={SOLID} fill={t.textMid}>
          {l}
        </Text>
      ))}

      <Text x={leftX} y={y0 + 34 + (p1.length + p2.length) * 23 + 8 + 24} size={12} fill={t.violet} weight={600}>
        # focus areas
      </Text>
      {focusItems.map((f, i) => (
        <g key={f}>
          <rect x={leftX} y={y0 + 34 + (p1.length + p2.length) * 23 + 8 + 24 + 30 + i * 28 - 9} width={9} height={9} rx={2} fill={accent} opacity={0.85} />
          <Text x={leftX + 18} y={y0 + 34 + (p1.length + p2.length) * 23 + 8 + 24 + 30 + i * 28} size={12.5} fill={t.textHi}>
            {f}
          </Text>
        </g>
      ))}

      {/* ── right column ── */}
      <Text x={rightX} y={y0} size={12} fill={t.violet} weight={600}>
        # education
      </Text>
      {profile.education.map((e, i) => {
        const cardY = y0 + 34 + i * 112;
        return (
          <g key={e.degree}>
            <rect x={rightX} y={cardY - 16} width={360} height={96} rx={10} fill={t.surface} stroke={t.border} strokeWidth={1} />
            <Text x={rightX + 18} y={cardY} size={17} fill={t.textHi} weight={700}>
              {e.degree}
            </Text>
            <Text x={rightX + 18} y={cardY + 26} size={11.5} fill={t.textLow}>
              {e.school}
            </Text>
            <Text x={rightX + 18} y={cardY + 58} size={11.5} fill={t.textLow}>
              {e.years}
            </Text>
            <g>
              <rect x={rightX + 360 - 18 - 82} y={cardY - 4} width={82} height={26} rx={13} fill={t.green} opacity={0.12} stroke={t.green} strokeOpacity={0.5} strokeWidth={1} />
              <Text x={rightX + 360 - 18 - 41} y={cardY + 13} size={11.5} fill={t.green} weight={600} anchor="middle">
                CGPA {e.cgpa}
              </Text>
            </g>
            {i < profile.education.length - 1 && <Divider x={rightX + 18} y={cardY + 96 + 8} w={360 - 36} color={t.border} />}
          </g>
        );
      })}

      <Text x={rightX} y={y0 + 34 + 2 * 112 + 14} size={12} fill={t.violet} weight={600}>
        # currently
      </Text>
      <Text x={rightX} y={y0 + 34 + 2 * 112 + 14 + 30} size={12.5} fill={t.textMid}>
        exploring AI systems · RAG · MCP · LLM APIs
      </Text>
      <Text x={rightX} y={y0 + 34 + 2 * 112 + 14 + 54} size={12.5} fill={t.textLow}>
        learning: Spring Security · Microservices
      </Text>
    </Window>
  );
}