// ─────────────────────────────────────────────────────────────
// Project data — verified repos, descriptions and tech stacks.
// Order matches the profile display order (01–05). Descriptions
// come from the resume and the verified repositories.
// ─────────────────────────────────────────────────────────────

export type AccentKey = "blue" | "cyan" | "violet" | "green" | "amber";

export interface Project {
  num: string;
  name: string;
  tagline: string;
  summary: string;
  stack: string[];
  repo: string;
  demo?: string;
  accent: AccentKey;
}

export const projects: Project[] = [
  {
    num: "01",
    name: "TrustFund",
    tagline: "Charity & Donation Management",
    summary:
      "Charity and donation platform with JWT auth, RBAC, Razorpay payments, campaign management, receipts, volunteer dashboards, notifications and audit logging.",
    stack: ["Django", "React", "PostgreSQL", "DRF", "JWT", "Razorpay"],
    repo: "https://github.com/Aby020/TrustFund",
    demo: "https://trustfund-i8r1.onrender.com/",
    accent: "blue",
  },
  {
    num: "02",
    name: "Plannix",
    tagline: "Event Management System",
    summary:
      "Event management platform with authentication, event booking, admin dashboards and feedback management.",
    stack: ["Django", "Python", "Bootstrap", "SQLite"],
    repo: "https://github.com/Aby020/Plannix",
    demo: "https://plannix-0to5.onrender.com/",
    accent: "cyan",
  },
  {
    num: "03",
    name: "ResumeAI",
    tagline: "AI Resume Analysis Platform",
    summary:
      "ATS platform with NLP-based skill matching, PDF parsing, authentication and 88 automated tests — resume scoring and job-description matching.",
    stack: ["Python", "Django", "PostgreSQL", "NLP", "PDF Parsing"],
    repo: "https://github.com/Aby020/ResumeAI",
    demo: "https://resumeai-backend-8rza.onrender.com/",
    accent: "violet",
  },
  {
    num: "04",
    name: "TrackWise",
    tagline: "Employee Attendance Management",
    summary:
      "Full-stack attendance tracking with secure JWT auth, role-based dashboards and a REST API built with Node and Express.",
    stack: ["React", "Node.js", "Express.js", "PostgreSQL", "JWT", "Tailwind CSS"],
    repo: "https://github.com/Aby020/TrackWise",
    demo: "https://trackwise-frontend-tla4.onrender.com/",
    accent: "green",
  },
  {
    num: "05",
    name: "ServiGo",
    tagline: "Home Services & EV Charging",
    summary:
      "Booking platform for home services and EV charging with authentication, RBAC, service booking and EV station search.",
    stack: ["Django", "Python", "JavaScript", "HTML5", "CSS3", "SQLite"],
    repo: "https://github.com/Aby020/ServiGo",
    accent: "amber",
  },
];