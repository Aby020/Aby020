// ─────────────────────────────────────────────────────────────
// // signature — closing block. Motto, authored-by line and a
// compact contact hint. Ends the profile the way a terminal
// session ends cleanly.
// ─────────────────────────────────────────────────────────────
import { ThemeTokens } from "../system/tokens";
import { Window } from "./frame";
import { Text } from "./primitives";
import { profile } from "../data/profile";

export function SignatureSection({ t }: { t: ThemeTokens }) {
  const H = 250;
  return (
    <Window t={t} H={H} title="~/signature.sh" cmd="./signature.sh">
      <Text x={44} y={120} size={11} fill={t.textLow}>
        # done.
      </Text>
      <Text x={44} y={158} size={24} fill={t.textHi} weight={700}>
        {profile.motto}
      </Text>
      <Text x={44} y={192} size={13} fill={t.textMid}>
        — {profile.name} · {profile.username}
      </Text>
      <Text x={44} y={226} size={12} fill={t.textLow}>
        {profile.email}
      </Text>
    </Window>
  );
}