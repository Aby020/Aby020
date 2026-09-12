// ─────────────────────────────────────────────────────────────
// // profile.json — the identity object rendered as a
// syntax-highlighted JSON document. Summary-at-a-glance for a
// recruiter scanning the profile.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text, monoW, Cursor } from "./primitives";
import { profile } from "../data/profile";

const LSIZE = 12.5;
const LINE = 26;
const KEY_X = 110;
const VAL_X = 248;

interface Row {
  k: string;
  v: string;
  indent: number;
  keyColor?: string;
  valColor?: string;
}

export function ProfileJsonSection({ t }: { t: ThemeTokens }) {
  const rows: Row[] = [
    { k: "name", v: profile.name, indent: 0 },
    { k: "role", v: profile.role, indent: 0 },
    { k: "tagline", v: profile.tagline, indent: 0 },
    { k: "location", v: profile.location, indent: 0 },
    { k: "affiliation", v: profile.affiliation, indent: 0 },
    { k: "status", v: profile.status, indent: 0 },
    { k: "email", v: profile.email, indent: 0 },
  ];
  const links: Row[] = [
    { k: "github", v: `@${profile.username}`, indent: 1 },
    { k: "linkedin", v: "/in/abithomas-dev", indent: 1 },
    { k: "portfolio", v: "abi-thomas-portfolio.vercel.app", indent: 1 },
  ];

  const H = 475;
  const y0 = 90 + 26;

  return (
    <Window t={t} H={H} title="~/profile.json" cmd="cat ./profile.json">
      {/* open brace */}
      <Text x={KEY_X - 20} y={y0} size={LSIZE} fill={t.textLow}>
        {"{"}
      </Text>
      {rows.map((r, i) => {
        const y = y0 + 26 + i * LINE;
        return (
          <g key={r.k}>
            <Text x={KEY_X + 4} y={y} size={LSIZE} fill={t.cyan}>
              {`"${r.k}"`}
            </Text>
            <Text x={KEY_X + monoW(`"${r.k}"`, LSIZE) + 12} y={y} size={LSIZE} fill={t.textLow}>
              :
            </Text>
            <Text x={VAL_X} y={y} size={LSIZE} fill={t.amber}>
              {`"${r.v}"`}
            </Text>
          </g>
        );
      })}
      <Text x={KEY_X - 20 + 16} y={y0 + 26 + 7 * LINE} size={LSIZE} fill={t.textLow}>
        ,
      </Text>
      <Text x={KEY_X - 20 + 16} y={y0 + 26 + 7 * LINE} size={LSIZE} fill={t.cyan}>
        "links"
      </Text>
      <Text x={KEY_X - 20 + 16 + monoW('"links"', LSIZE) + 8} y={y0 + 26 + 7 * LINE} size={LSIZE} fill={t.textLow}>
        : {"{"}
      </Text>
      {links.map((r, i) => {
        const y = y0 + 26 + 7 * LINE + 26 + 8 + i * LINE;
        return (
          <g key={r.k}>
            <Text x={KEY_X + 4 + 26} y={y} size={LSIZE} fill={t.cyan}>
              {`"${r.k}"`}
            </Text>
            <Text x={KEY_X + 30 + monoW(`"${r.k}"`, LSIZE) + 12} y={y} size={LSIZE} fill={t.textLow}>
              :
            </Text>
            <Text x={VAL_X + 26} y={y} size={LSIZE} fill={t.amber}>
              {`"${r.v}"`}
            </Text>
          </g>
        );
      })}
      <Text x={KEY_X - 20 + 16 + 26 + 4} y={y0 + 26 + 7 * LINE + 26 + 8 + 3 * LINE} size={LSIZE} fill={t.textLow}>
        {"}"}
      </Text>
      <Text x={KEY_X - 20 + 16} y={y0 + 26 + 7 * LINE + 26 + 8 + 3 * LINE + 26} size={LSIZE} fill={t.textLow}>
        {"}"}
      </Text>
      <Cursor
        x={KEY_X + 20}
        y={y0 + 26 + 7 * LINE + 26 + 8 + 3 * LINE + 26}
        size={LSIZE}
        color={t.accentHi}
      />
    </Window>
  );
}