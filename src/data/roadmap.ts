// ─────────────────────────────────────────────────────────────
// Roadmap data — current exploration, deliberately labelled as
// learning (not completed achievements). No invented dates.
// ─────────────────────────────────────────────────────────────

export interface RoadmapItem {
  id: string;
  title: string;
  note: string;
  icon: string;
}

export const roadmap: RoadmapItem[] = [
  {
    id: "spring",
    title: "Spring Security",
    note: "authn & authorization in the JVM ecosystem",
    icon: "shield",
  },
  {
    id: "micro",
    title: "Microservices",
    note: "decomposing systems into focused services",
    icon: "boxes",
  },
  {
    id: "mcp",
    title: "Model Context Protocol",
    note: "standard context for AI assistants & tools",
    icon: "node",
  },
  {
    id: "rag",
    title: "Retrieval-Augmented Generation",
    note: "grounding LLM answers in your own data",
    icon: "search",
  },
  {
    id: "llm",
    title: "AI Integration with LLM APIs",
    note: "practical integration of language models",
    icon: "chat",
  },
];