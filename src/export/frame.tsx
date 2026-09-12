// ─────────────────────────────────────────────────────────────
// Section window frame — the consistent terminal chrome every
// informational section shares: outer window, traffic-light dots,
// a title, a `$ cmd` prompt row and the content area. Sections
// render their own content inside; the frame guarantees rhythm.
// ─────────────────────────────────────────────────────────────
import React from "react";
import { ThemeTokens } from "../system/tokens";
import { Svg, Text, TermDots, Divider, Cursor, monoW } from "./primitives";

export const SECTION_W = 1060;

export function Window({
  t,
  W = SECTION_W,
  H,
  title,
  cmd = "cat",
  right,
  children,
}: {
  t: ThemeTokens;
  W?: number;
  H: number;
  title: string;
  cmd?: string;
  right?: string;
  children: React.ReactNode;
}) {
  const TITLE_H = 46;
  const CMD_H = 44;
  return (
    <Svg width={W} height={H} title={title} desc={cmd}>
      <defs>
        <pattern id={`window-grid-${title.replace(/[^a-z0-9]/gi, "")}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <line x1="34" y1="0" x2="34" y2="34" stroke={t.gridLine} strokeWidth="1" />
          <line x1="0" y1="34" x2="34" y2="34" stroke={t.gridLine} strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="1" y="1" width={W - 2} height={H - 2} rx={16} fill={t.bgDeep} />
      <rect x="0" y="0" width={W} height={H} rx={16} fill="none" stroke={t.borderStrong} strokeWidth={1} />

      {/* title bar */}
      <TermDots x={26} y={TITLE_H / 2} />
      <Text x={58} y={TITLE_H / 2 + 4} size={12.5} fill={t.textLow}>
        {title}
      </Text>
      {right && (
        <Text x={W - 26} y={TITLE_H / 2 + 4} size={11.5} fill={t.textLow} anchor="end" spacing={1}>
          {right}
        </Text>
      )}
      <Divider x={0} y={TITLE_H} w={W} color={t.border} />

      {/* command row */}
      <Text x={30} y={TITLE_H + CMD_H - 13} size={13} fill={t.green} weight={700}>
        $
      </Text>
      <Text x={30 + monoW("$ ", 13)} y={TITLE_H + CMD_H - 13} size={13} fill={t.textHi} weight={600}>
        {cmd}
      </Text>
      <Cursor x={30 + monoW(`$ ${cmd} `, 13)} y={TITLE_H + CMD_H - 13} size={13} color={t.accentHi} />
      <Divider x={0} y={TITLE_H + CMD_H} w={W} color={t.border} />

      {/* content */}
      {children}
    </Svg>
  );
}