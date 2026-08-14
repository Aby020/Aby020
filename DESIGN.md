# GitHub Profile Portfolio — Premium Redesign Design Specification

**Codename**: "Engine" — A premium software engineer portfolio with developer-first visual language

**Aesthetic**: GitHub × VS Code × Terminal × Premium Developer Portfolio

---

## Design Philosophy

This is NOT a README. It's a **developer interface** — a curated, intentional presentation of a software engineer's work that reads like a well-crafted piece of software itself.

Every section uses authentic developer metaphors:
- **Code editor panels** (VS Code aesthetic)
- **Terminal sessions** (already in hero)
- **JSON/YAML config** (profile metadata)
- **Repository cards** (GitHub native)
- **Git timeline** (experience/education)
- **CI/CD status badges** (learning/status)

---

## Visual System

### Color Palette

#### Core (Dark Theme — Primary)
| Token | Hex | Use |
|-------|-----|-----|
| `--bg-base` | `#0d1117` | Main background |
| `--bg-elevated` | `#161b22` | Panels, cards |
| `--bg-inset` | `#010409` | Deep insets, code blocks |
| `--border` | `#30363d` | Default borders |
| `--border-muted` | `#21262d` | Subtle dividers |
| `--text-primary` | `#e6edf3` | Headings, key text |
| `--text-secondary` | `#8b949e` | Body, muted |
| `--text-tertiary` | `#6e7681` | Footnotes, meta |

#### Accent System (Refined, not neon)
| Token | Hex | Use |
|-------|-----|-----|
| `--accent-blue` | `#58a6ff` | Primary actions, links |
| `--accent-cyan` | `#22d3ee` | Highlights, tech tags |
| `--accent-violet` | `#a855f7` | Secondary accent, gradients |
| `--accent-green` | `#3fb950` | Success, status, live |
| `--accent-amber` | `#d29922` | Warnings, learning |

#### Gradient
```
--gradient-hero: linear-gradient(135deg, #58a6ff → #a855f7)
--gradient-border: linear-gradient(90deg, #a855f7 → #58a6ff → #22d3ee)
```

### Typography

| Context | Font | Size | Weight |
|---------|------|------|--------|
| Display heading | System UI (Segoe UI/Inter) | 28-32px | Bold |
| Section heading | System UI | 18-20px | Semibold |
| Body | System UI | 14-15px | Regular |
| Code/terminal | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | 13-14px | Regular |
| Metadata | Monospace | 12px | Regular |

### Spacing System (8px base)
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

### Visual Elements
- **Borders**: 1px solid `--border`, rounded 6-12px
- **Panels**: Elevated bg (`#161b22`), subtle 1px border
- **Shadows**: Minimal — only on CTA buttons (`0 4px 12px rgba(88,166,255,.25)`)
- **Grid**: Subtle dot/line pattern (4% opacity) in hero/section backgrounds
- **Glow**: Controlled — only on key accent elements (e.g., CTA button)
- **Dividers**: Thin 1px border-muted lines between major sections

---

## Layout Architecture

### Container
- Max content width: 980px (GitHub README container)
- Centered, with consistent horizontal padding
- Mobile: full-width, single column

### Section Structure
Each major section follows a consistent pattern:
```
┌─────────────────────────────────────────┐
│ ◆ SECTION_LABEL                           │  ← Monospace section marker
│ ─────────────────────────────────────────  │  ← Thin divider
│                                             │
│  [Content: panel/cards/timeline]           │
│                                             │
└─────────────────────────────────────────┘
```

### Section Markers
Use subtle monospace labels with accent color:
- `// profile.json`
- `// tech.stack`
- `// repositories`
- `// timeline`
- `// activity`

---

## Section-by-Section Design

### 1. HERO (Kept, enhanced)

**Current**: ASCII portrait + animated terminal transcript (excellent, keep)

**Enhancements**:
1. **Portfolio CTA**: Add prominent "↗ View My Portfolio" button in hero SVG footer area
2. **Status badge**: Add "● Open to Opportunities" status indicator (green pulse)
3. **Links row**: Keep shields.io badges below hero (GitHub, LinkedIn, Email)
4. **Visual continuity**: Hero bottom border gradient matches section dividers

**Hero SVG updates** (in `hero.mjs`):
- Add CTA button shape with glow at bottom-center
- Add status indicator (dot + text)
- Ensure text is readable on mobile (mobile variant already 720×1160)

**CTA Button design** (SVG):
```
Rounded rect, fill: linear-gradient(#58a6ff → #a855f7)
Text: "↗ View My Portfolio" (white, bold)
Glow: subtle drop shadow
Position: bottom-center, above footer text
```

### 2. ABOUT / PROFILE

**Concept**: `cat profile.json` — Syntax-highlighted JSON panel

**Visual**:
```
┌─ profile.json ─────────────────────────┐
│ {                                        │
│   "name":     "Abi Thomas",             │  ← key: muted, value: blue
│   "role":     "Software Engineer",      │
│   "status":   "● Open to Opportunities",│  ← green dot
│   "location": "Kerala, India",          │
│   "education": "MCA · APJ AKTU",        │
│   "focus":    [                         │
│     "Backend", "REST APIs",             │
│     "AI Systems", "PostgreSQL"          │
│   ],                                     │
│   "links": {                             │
│     "github":   "Aby020",               │
│     "linkedin": "abithomas-dev",        │
│     "email":    "abithomas520@..."      │
│   }                                      │
│ }                                        │
└─────────────────────────────────────────┘
```

**Implementation**: Fenced code block with manual syntax highlighting (GitHub renders `json` fenced blocks with highlighting). Add a label header above.

**Enhanced**: Add a "terminal prompt" line above: `$ cat profile.json`

### 3. ABOUT — NARRATIVE

**Concept**: `cat about.md` — Prose block

**Visual**: Elegant prose panel with left accent border (violet)
```
| "Backend Engineer focused on building scalable
| REST APIs and full-stack web applications with
| Python, Django, Django REST Framework, and
| PostgreSQL — and AI-powered systems..."
```

Keep as clean text block with accent left-border.

### 4. TECH STACK

**Concept**: `// tech.stack` — Grouped technology cards

**Structure**:
```
┌─ Core ───────────────────────────────┐
│ [Python] [Django] [PostgreSQL] [REST] │  ← Larger chips, accent border
└──────────────────────────────────────┘

┌─ Backend ────┐ ┌─ Frontend ───┐
│ Python       │ │ HTML5       │
│ Django       │ │ CSS3        │
│ DRF          │ │ JavaScript  │
│ Java         │ │ Bootstrap   │
│ Spring Boot  │ │             │
└──────────────┘ └─────────────┘

┌─ Database ──────────┐ ┌─ DevOps ──────────┐
│ PostgreSQL          │ │ Git               │
│ MySQL               │ │ GitHub Actions    │
│ MongoDB             │ │ PythonAnywhere    │
│                     │ │ Render            │
│                     │ │ Cloudinary        │
└─────────────────────┘ └──────────────────┘
```

**Implementation**: 
- Core: single row of larger badges (Shields.io or manual SVG chips)
- Groups: 2-column responsive grid (collapses to 1 column on mobile)
- Use Shields.io badges with consistent style: `style=flat-square&color=21262d`
- Group headers in monospace accent color

**Tech badge style**:
```
[ Python ]  ← Rounded, bg #21262d, text #e6edf3, left accent dot
```

### 5. PROJECTS

**Concept**: `// repositories` — GitHub-style repo cards

**Card design**:
```
┌─────────────────────────────────────────┐
│ 📁 ResumeAI                    [✅ Done] │  ← Name + status badge
│ ───────────────────────────────────────  │
│ AI-powered resume analysis with ATS      │  ← Description
│ scoring, job-description matching, and   │
│ intelligent feedback.                     │
│                                           │
│ [Python] [Django] [PostgreSQL] [OCR]     │  ← Tech pills
│                                           │
│ ┌─ Repository ┐  ┌─ Live Demo ┐          │  ← Action buttons
│ └────────────┘  └────────────┘          │
└─────────────────────────────────────────┘
```

**Visual identity per project**:
- ResumeAI: blue accent
- TrackWise: cyan accent  
- NEXVENT: violet accent (featured)
- NanoServ: green accent (live)

**Layout**: 2-column responsive grid (1 column mobile)
**Implementation**: HTML table (2 cols) or CSS-free flexbox via nested tables
**Preview images**: Generate simple SVG previews (code-editor mockup) per project
**Status badges**: ✅ Completed / 🚧 In Progress / 🟢 Live

**Project card SVG preview** (mockup):
- Mini code editor window (title bar + 3 dots)
- Syntax-colored lines representing project tech
- Project name watermark

### 6. EXPERIENCE / EDUCATION TIMELINE

**Concept**: `git log --oneline` style timeline

**Visual**:
```
2026 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
     ├─ 🎓 MCA — APJ Abdul Kalam Technological University
     │     CGPA 7.65 | Backend Dev Focus
     │
     ├─ 💼 ResumeAI — AI Resume Analysis Platform
     │     Django · PostgreSQL · OCR · RAG
     │
     └─ 💼 TrackWise — Attendance System
           React · Node · PostgreSQL

2023 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
     └─ 🎓 BCA — University of Kerala
           CGPA 6.035

2020 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
     └─ ▶ Started CS Journey
```

**Implementation**: Vertical timeline using nested HTML/CSS-free structure
- Use `●` nodes with accent color
- Connector lines via `│` Unicode or SVG
- Year labels in monospace accent
- Content in panel cards

**Data sources** (from resume + config):
- MCA: 2024–2026, APJ AKTU, CGPA 7.65
- BCA: 2020–2023, University of Kerala, CGPA 6.035
- Projects with dates (from resume):
  - TrackWise: Jul 2026 – Aug 2026
  - ResumeAI: Apr 2026 – Jul 2026
  - NEXVENT: Jan 2026 – Mar 2026
  - NanoServ: Aug 2025 – Oct 2025

### 7. LEARNING / CURRENTLY EXPLORING

**Concept**: `// roadmap` — Status badge row

**Visual**:
```
┌─ Currently Exploring ───────────────────┐
│ [Spring Security] [Microservices]        │
│ [Model Context Protocol] [RAG]           │
│ [AI Integration with LLM APIs]           │
└─────────────────────────────────────────┘
```

**Style**: Amber-accent badges (learning = in-progress)
**Implementation**: Shields.io badges with amber color, or manual SVG

### 8. GITHUB ACTIVITY / STATS

**Concept**: `// activity` — Contribution visualization

**Current**: Snake animation (keep, integrate better)

**Enhanced layout**:
```
┌─ Contribution Activity ─────────────────┐
│                                           │
│   [Snake animation SVG]                   │  ← From output branch
│                                           │
│  ┌─ Stats ──────────────────────────┐    │
│  │ 🔥 Longest streak: [auto]        │    │
│  │ 📅 Total contributions: [auto]   │    │
│  │ 🌟 Public repos: 4               │    │
│  └──────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Note**: Don't fabricate stats. Use real GitHub stats API or shields.io:
- `https://img.shields.io/github/followers/Aby020`
- `https://img.shields.io/github/stars/Aby020` (if any)
- Contribution count from snake generation

**Integration**: Wrap snake in styled panel, add caption

### 9. CONTACT

**Concept**: `// connect` — Prominent CTA + clean links

**Visual**:
```
┌─────────────────────────────────────────┐
│                                           │
│   ↗ View My Portfolio                     │  ← PRIMARY CTA (big, glowing)
│   abi-thomas-portfolio.vercel.app         │
│                                           │
│   [GitHub]  [LinkedIn]  [Email]           │  ← Secondary links
│                                           │
└─────────────────────────────────────────┘
```

**CTA Button**: 
- Large, rounded, gradient fill
- Text: "↗ View My Portfolio"
- URL: https://abi-thomas-portfolio.vercel.app/
- Glow shadow

**Links**: Shields.io badges (GitHub, LinkedIn, Email)

### 10. FOOTER

**Concept**: Terminal prompt
```
$ exit 0

# Code • Build • Improve

Built with ⚡ by Abi Thomas
```

Keep minimal, monospace, accent color.

---

## Animation Strategy

### Keep (GitHub-compatible SVG `<animate>`)
1. **Hero ASCII gradient cycle** (9s loop)
2. **Hero line reveals** (clip-path stagger)
3. **Hero portrait mask** (2.1s)
4. **Hero cursor blink** (1.4s loop)
5. **Hero border pulse** (3.4s)
6. **Contribution snake** (GitHub Action)

### Add (where appropriate)
1. **Hero CTA glow pulse** (subtle, 3s loop) — SVG `<animate>` on opacity
2. **Status dot pulse** (green, 2s loop) — SVG `<animate>` on opacity

### Never (GitHub-incompatible)
- ❌ CSS `@keyframes` in `<style>` blocks
- ❌ JavaScript interactions
- ❌ Hover effects
- ❌ Scroll animations

### New Animated Assets (if needed)
- **Project preview GIFs**: Optional, only if substantial value
- **Typing animation**: Use SVG `<animate>` on text reveal (like hero)

---

## Assets Plan

### New SVG Assets to Create
1. **Project preview mockups** (4): `assets/previews/{project}-preview.svg`
   - Mini code-editor windows with project-specific syntax colors
   - Used as card thumbnail or hero accent

2. **Section divider decoration** (optional): subtle SVG pattern

3. **Tech badge SVGs** (optional): If not using Shields.io
   - Prefer Shields.io for reliability + dynamic updates

### Reuse Existing
1. **Hero 4-variants** (perfect as-is, minor CTA enhancement)
2. **Contribution snake** (auto-generated)
3. **Portrait source** (for hero regen if needed)

### Shields.io Badge Strategy
All badges use consistent style:
```
https://img.shields.io/badge/{LABEL}-{VALUE}-{COLOR}?style=flat-square&logo={LOGO}
```
Colors mapped to palette:
- GitHub: `0D1117` (dark) with logo
- LinkedIn: `0A66C2`
- Email: `EA4335`
- Tech: `21262d` (panel) with per-tech logo
- Status: `3fb950` (green) / `d29922` (amber)

---

## Generation Workflow Updates

### `scripts/lib/readme.mjs` — Rewrite section renderers
- `renderProfilePanel()` — JSON panel for about
- `renderTechStackCards()` — Grouped badge grid
- `renderProjectCards()` — Repository cards with previews
- `renderTimeline()` — Experience/education timeline
- `renderLearning()` — Status badge row
- `renderActivity()` — Integrated snake + stats
- `renderContact()` — CTA + links
- Keep: `renderLinks()`, `renderStatsSection()`

### `scripts/lib/hero.mjs` — Minor enhancements
- Add CTA button to hero SVG
- Add status indicator
- Keep all existing animations

### `profile.config.json` — Extend (optional)
- Add `timeline` field for experience/education dates
- Add `portfolio` URL field
- Keep all existing data

### `profile.schema.json` — Update validation
- Add new optional fields
- Keep backward compatibility

### Validation (`validate.mjs`)
- Keep existing checks
- Add: no `<style>` blocks in README
- Add: all asset references resolve
- Add: no JS in README

---

## Responsive Strategy

### Desktop (>980px)
- 2-column project grid
- 2-column tech group grid
- Hero desktop variant
- Full timeline with connectors

### Mobile (<760px)
- 1-column project grid
- 1-column tech groups
- Hero mobile variant (already 720×1160)
- Timeline simplified (no connectors or minimal)

### Tables
- Use HTML tables for grids (GitHub renders natively)
- Set `width="100%"` to prevent overflow
- Avoid fixed pixel widths > 300px per cell

### Code blocks
- GitHub wraps long lines (horizontal scroll)
- Keep lines < 80 chars where possible

### Images
- Hero: `width="100%"` (scales)
- Snake: `width="100%"` max 980px
- Previews: `width="100%"` in cards

---

## GitHub Compatibility Checklist

- [x] No `<script>` tags
- [x] No `<style>` blocks (removed from current)
- [x] No `onclick`/`onload` handlers
- [x] No external CSS/JS
- [x] Supported HTML: `<table>`, `<img>`, `<picture>`, `<a>`, `<details>`, `<summary>`, `<blockquote>`
- [x] Images hosted on GitHub (raw.githubusercontent.com or assets)
- [x] SVG with `<animate>` (GitHub renders SMIL animations)
- [x] Markdown standard syntax
- [x] No fixed-width layouts causing overflow

---

## Success Metrics

1. **First impression** (<3s): Visitor thinks "This person builds software"
2. **Scannability**: Key info found in <10s (name, role, status, portfolio CTA)
3. **Technical authenticity**: Every section uses real developer metaphor
4. **Visual polish**: Spacing, typography, color all intentional
5. **Mobile**: Fully readable on phone
6. **Animation**: Hero feels alive, subtle motion throughout
7. **GitHub-render**: No broken elements, no raw HTML/CSS exposed

---

*Design spec complete. Ready for implementation.*
