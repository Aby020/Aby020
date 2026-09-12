// ─────────────────────────────────────────────────────────────
// Asset manifest — the single ordered list of everything the
// export pipeline renders. Each entry maps to one .svg file.
// The pipeline and the README builder both drive off this list
// so the two can never drift apart.
// ─────────────────────────────────────────────────────────────
import React from "react";
import { ThemeTokens, themes, Theme } from "../system/tokens";
import { HeroSection } from "./hero";
import { ProfileJsonSection } from "./profileJson";
import { AboutSection } from "./about";
import { TechStackSection } from "./techStack";
import { RoadmapSection } from "./roadmap";
import { ActivitySection } from "./activity";
import { SignatureSection } from "./signature";
import { RepoCard, CARD_W, CARD_H } from "./repositories";
import {
  linkedinButton,
  emailButton,
  portfolioButton,
  repoButton,
  demoButton,
  BTN_W,
  BTN_H,
} from "./buttons";
import { projects } from "../data/projects";

const THEMES: Theme[] = ["dark", "light"];
const suffix = (t: Theme) => (t === "dark" ? "--dark" : "--light");

export interface Build {
  kind: "hero" | "section" | "card" | "button";
  rel: string; // path relative to assets/generated/
  element: React.ReactElement;
  w: number;
  h: number;
}

export const HERO_W_DESKTOP = 1140;
export const HERO_H_DESKTOP = 700;
export const HERO_W_MOBILE = 720;
export const HERO_H_MOBILE = 1180;
export const SECTION_W = 1060;

const builds: Build[] = [];

// ── hero (4 variants) ─────────────────────────────────────────
for (const t of THEMES) {
  builds.push({
    kind: "hero",
    rel: `hero/hero--desktop${suffix(t)}.svg`,
    element: <HeroSection t={themes[t]} size="desktop" />,
    w: HERO_W_DESKTOP,
    h: HERO_H_DESKTOP,
  });
  builds.push({
    kind: "hero",
    rel: `hero/hero--mobile${suffix(t)}.svg`,
    element: <HeroSection t={themes[t]} size="mobile" />,
    w: HERO_W_MOBILE,
    h: HERO_H_MOBILE,
  });
}

// ── sections (dark + light) ───────────────────────────────────
interface SectionDef {
  name: string;
  render: (t: ThemeTokens) => React.ReactElement;
  h: number;
}
const sections: SectionDef[] = [
  { name: "profileJson", render: (t) => <ProfileJsonSection t={t} />, h: 475 },
  { name: "about", render: (t) => <AboutSection t={t} />, h: 470 },
  { name: "techStack", render: (t) => <TechStackSection t={t} />, h: 100 + 200 + 18 + 200 + 34 },
  { name: "roadmap", render: (t) => <RoadmapSection t={t} />, h: 108 + 5 * 68 + 22 },
  { name: "activity", render: (t) => <ActivitySection t={t} />, h: 300 },
  { name: "signature", render: (t) => <SignatureSection t={t} />, h: 250 },
];
for (const t of THEMES) {
  for (const s of sections) {
    builds.push({
      kind: "section",
      rel: `sections/${s.name}${suffix(t)}.svg`,
      element: s.render(themes[t]),
      w: SECTION_W,
      h: s.h,
    });
  }
}

// ── repository cards (per project × dark/light) ───────────────
for (const t of THEMES) {
  for (const p of projects) {
    builds.push({
      kind: "card",
      rel: `cards/${p.num.toLowerCase()}--${p.name.toLowerCase()}${suffix(t)}.svg`,
      element: <RepoCard t={themes[t]} project={p} />,
      w: CARD_W,
      h: CARD_H,
    });
  }
}

// ── buttons (contact + per-project × dark/light) ──────────────
for (const t of THEMES) {
  const theme = themes[t];
  const btn = (name: string, el: React.ReactElement) =>
    builds.push({
      kind: "button",
      rel: `buttons/${name}${suffix(t)}.svg`,
      element: el,
      w: BTN_W,
      h: BTN_H,
    });

  btn("linkedin", linkedinButton(theme));
  btn("email", emailButton(theme));
  btn("portfolio", portfolioButton(theme));
  for (const p of projects) {
    btn(`repo--${p.name.toLowerCase()}`, repoButton(theme));
    if (p.demo) btn(`demo--${p.name.toLowerCase()}`, demoButton(theme));
  }
}

export const allBuilds: Build[] = builds;

/** Convenience: a themed variant ready for the README builder. */
export const themeColors = (theme: Theme) => themes[theme];