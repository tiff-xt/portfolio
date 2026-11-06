/** Single source of truth for identity and links. Edit freely. */
export const site = {
  name: "Tiff",
  role: "Software engineer",
  tagline:
    "I build interfaces that make complex things feel clear: data-rich products, design systems and AI features, from first sketch to production.",
  github: "https://github.com/tiff-xt",
  email: "", // optional: shown in the footer when set
  linkedin: "", // optional
  url: "https://tiff-xt.vercel.app",
} as const;

export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  repo?: string;
  status: "live" | "building" | "planned";
  /** Hue (0–360) for the card's generative cover. */
  hue: number;
};

export const projects: Project[] = [
  {
    slug: "helix-workspace",
    title: "Helix Workspace",
    summary:
      "A research tool for exploring gene-expression results: a 2,400-point interactive volcano plot, a multi-state workflow, a structured AI suggestion panel and a full design system.",
    tags: ["React", "TypeScript", "Data viz", "Design system", "Accessibility"],
    href: "https://tiff-xt.github.io/helix-workspace/",
    repo: "https://github.com/tiff-xt/helix-workspace",
    status: "live",
    hue: 235,
  },
  {
    slug: "ai-front-desk",
    title: "AI Front Desk",
    summary:
      "An AI front desk for a fictional preschool where the AI never computes a fact: deterministic policy code answers, the LLM only classifies and translates, and a guard rejects any number or date it can't back up. Includes a staff console for autonomy, gaps and live evals.",
    tags: ["React", "TypeScript", "LLM guardrails", "Cloudflare Workers", "i18n", "Evals"],
    href: "https://tiff-xt.github.io/ai-front-desk/",
    repo: "https://github.com/tiff-xt/ai-front-desk",
    status: "live",
    hue: 300,
  },
  {
    slug: "portfolio",
    title: "This site",
    summary:
      "Next.js with a GPU particle hero, a motion system, and a retrieval-grounded assistant on Workers AI and Postgres + pgvector, with deterministic guardrails and graceful fallback.",
    tags: ["Next.js", "WebGL", "RAG", "Postgres", "Edge AI"],
    repo: "https://github.com/tiff-xt/portfolio",
    status: "live",
    hue: 285,
  },
  {
    slug: "motion-lab",
    title: "Motion Lab",
    summary: "A library of micro-interactions with live controls, reduced-motion variants and copyable code.",
    tags: ["Motion", "Interaction design", "Component API"],
    status: "planned",
    hue: 262,
  },
  {
    slug: "orbital",
    title: "Orbital",
    summary: "A generative brand system rendered entirely with shaders: noise-driven identity, WebGL transitions.",
    tags: ["GLSL", "Three.js", "Creative coding"],
    status: "building",
    repo: "https://github.com/tiff-xt/orbital",
    hue: 210,
  },
];
