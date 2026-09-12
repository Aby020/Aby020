// ─────────────────────────────────────────────────────────────
// Technology data — verified stack from the resume and the
// actual repositories. `logo` keys map to brand marks in
// src/export/logos-data.ts (Simple Icons CC0) or custom glyphs.
// ─────────────────────────────────────────────────────────────

export interface Tech {
  name: string;
  logo: string;
}

export interface TechGroup {
  label: string;
  note: string;
  items: Tech[];
}

export const techGroups: TechGroup[] = [
  {
    label: "languages",
    note: "primary languages",
    items: [
      { name: "Python", logo: "python" },
      { name: "JavaScript", logo: "javascript" },
      { name: "TypeScript", logo: "typescript" },
      { name: "SQL", logo: "sql" },
    ],
  },
  {
    label: "backend",
    note: "APIs & services",
    items: [
      { name: "Django", logo: "django" },
      { name: "Django REST", logo: "djangorestframework" },
      { name: "REST APIs", logo: "api" },
      { name: "Node.js", logo: "nodedotjs" },
      { name: "Express.js", logo: "express" },
    ],
  },
  {
    label: "frontend",
    note: "web interfaces",
    items: [
      { name: "React", logo: "react" },
      { name: "Vite", logo: "vite" },
      { name: "Tailwind CSS", logo: "tailwindcss" },
      { name: "Bootstrap", logo: "bootstrap" },
      { name: "HTML5", logo: "html5" },
      { name: "CSS3", logo: "css3" },
    ],
  },
  {
    label: "database",
    note: "storage & queries",
    items: [
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "Neon", logo: "neon" },
      { name: "SQLite", logo: "sqlite" },
    ],
  },
  {
    label: "deploy & cloud",
    note: "shipping to production",
    items: [
      { name: "Render", logo: "render" },
      { name: "Vercel", logo: "vercel" },
      { name: "Cloudinary", logo: "cloudinary" },
      { name: "Docker", logo: "docker" },
    ],
  },
  {
    label: "tools",
    note: "day-to-day workflow",
    items: [
      { name: "Git", logo: "git" },
      { name: "GitHub", logo: "github" },
      { name: "VS Code", logo: "visualstudiocode" },
    ],
  },
];