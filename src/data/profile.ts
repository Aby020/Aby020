// ─────────────────────────────────────────────────────────────
// Profile data — single source of truth for identity content.
// Verified against resume (Abi_Thomas_Resume.pdf) and live
// GitHub. Do not invent information here.
// ─────────────────────────────────────────────────────────────

export interface Education {
  degree: string;
  school: string;
  cgpa: string;
  years: string;
}

export const profile = {
  name: "Abi Thomas",
  username: "Aby020",
  role: "Backend / Full-Stack Developer",
  tagline: "Python · Django · PostgreSQL · React",
  affiliation: "MCA — APJ Abdul Kalam Technological University",
  location: "Kerala, India",
  status: "Open to Software Engineer opportunities",
  motto: "Code • Build • Improve",
  email: "abithomas520@gmail.com",
  contact: {
    linkedin: "https://www.linkedin.com/in/abithomas-dev/",
    email: "mailto:abithomas520@gmail.com",
    portfolio: "https://abi-thomas-portfolio.vercel.app/",
    github: "https://github.com/Aby020",
  },
  summary: [
    "Backend engineer focused on building scalable REST APIs and full-stack web applications — Python, Django, Django REST Framework and PostgreSQL.",
    "Currently exploring AI-assisted systems with LLMs — Retrieval-Augmented Generation, Model Context Protocol and API integrations.",
  ],
  focus: [
    "Backend Engineering",
    "REST API Design",
    "Full-Stack Development",
    "PostgreSQL & Data Modeling",
    "AI Integration",
  ],
  education: [
    {
      degree: "MCA",
      school: "APJ Abdul Kalam Technological University",
      cgpa: "7.65",
      years: "2024 – 2026",
    },
    {
      degree: "BCA",
      school: "University of Kerala",
      cgpa: "6.035",
      years: "2020 – 2023",
    },
  ],
};

export const terminalCursor = "▍";