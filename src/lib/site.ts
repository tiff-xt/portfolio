/** Single source of truth for identity and links. Edit freely. */
export const site = {
  name: "Tiff",
  role: "Full-stack software engineer",
  /** Shown beside the role in the hero. */
  experience: "6+ years",
  tagline: "I care as much about how a product feels to use as how it holds up under load.",
  /** The supporting line under the tagline: what the work covers. */
  scope:
    "6+ years building products end to end: data-rich interfaces, the APIs and databases behind them, and AI features.",
  github: "https://github.com/tiff-xt",
  email: "", // optional: shown in the footer when set
  linkedin: "https://www.linkedin.com/in/tiffanytranx/",
  /** The live lobbyd API, used by the "try to charge twice" panel. */
  lobbydApi: "https://lobbyd-api.onrender.com",
  url: "https://tiff-xt.vercel.app",
} as const;

export type Project = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  repo?: string;
  status: "live" | "building" | "planned" | "library";
  /** Hue (0–360) for the card's generative cover. */
  hue: number;
  /** Featured projects lead the work section; the rest sit below as craft. */
  featured?: boolean;
  /** Featured only: what the project demonstrates, in a few words. */
  proves?: string;
};

export const projects: Project[] = [
  {
    slug: "lobbyd",
    title: "lobbyd",
    summary:
      "A ticketing platform built for the minute a sale opens: seats that cannot be sold twice, payments that survive a failing provider, and an AI agent that operates it with human approval. FastAPI, Postgres and Redis, load tested and evaluated, with the numbers published.",
    tags: ["Python", "FastAPI", "Postgres", "Redis", "System design", "AI agents", "Evals"],
    href: "https://lobbyd.vercel.app",
    repo: "https://github.com/tiff-xt/lobbyd",
    status: "live",
    featured: true,
    proves: "Backend, system design and AI agents",
    hue: 75,
  },
  {
    slug: "helix-workspace",
    title: "Helix Workspace",
    summary:
      "A research tool for exploring gene-expression results: a 2,400-point interactive volcano plot, a multi-state workflow, a structured AI suggestion panel and a full design system.",
    tags: ["React", "TypeScript", "Data viz", "Design system", "Accessibility"],
    href: "https://tiff-xt.github.io/helix-workspace/",
    repo: "https://github.com/tiff-xt/helix-workspace",
    status: "live",
    featured: true,
    proves: "Product engineering, data visualization and design systems",
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
    featured: true,
    proves: "AI product engineering, guardrails and evals",
    hue: 300,
  },
  {
    slug: "oncely",
    title: "oncely",
    summary:
      "A small Python library for a network that retries: idempotency keys, so a repeated request does its work once, and a transactional outbox, so an event is published if and only if its change was saved. Extracted from lobbyd and tested against real Postgres and Redis, races included.",
    tags: ["Python", "SQLAlchemy", "Postgres", "Redis Streams", "Library design"],
    repo: "https://github.com/tiff-xt/oncely",
    status: "library",
    hue: 150,
  },
  {
    slug: "nightjar",
    title: "Nightjar",
    summary:
      "A fictional naked roadster modelled, lit and voiced entirely in code: a scroll-directed 3D showcase in a night garage, with an exploded view, a paint configurator and a synthesised parallel twin.",
    tags: ["three.js", "React Three Fiber", "Post-processing", "Web Audio", "Next.js"],
    href: "https://nightjar-by-tiff.vercel.app",
    repo: "https://github.com/tiff-xt/nightjar",
    status: "live",
    hue: 20,
  },
  {
    slug: "orbital",
    title: "Orbital",
    summary:
      "A fictional design studio rendered with one hand-written shader: a ray-marched planet, a seeded identity for every visitor, an audio-reactive synth and warp page transitions.",
    tags: ["WebGL2", "GLSL", "Web Audio", "Generative", "Next.js"],
    href: "https://orbital-by-tiff.vercel.app/",
    repo: "https://github.com/tiff-xt/orbital",
    status: "live",
    hue: 210,
  },
  {
    slug: "sprung",
    title: "Sprung",
    summary:
      "An npm library of micro-interactions driven by analytic springs compiled to CSS easings, with a gallery of 12 accessible components, a live spring playground and reduced-motion previews.",
    tags: ["npm package", "React", "Spring physics", "Web Animations API", "Accessibility"],
    href: "https://sprung.vercel.app",
    repo: "https://github.com/tiff-xt/sprung",
    status: "live",
    hue: 262,
  },
  {
    slug: "portfolio",
    title: "This site",
    summary:
      "Next.js with a GPU particle hero, a motion system, and a retrieval-grounded assistant on Workers AI and Postgres + pgvector, with deterministic guardrails and graceful fallback.",
    tags: ["Next.js", "WebGL", "RAG", "Postgres", "Edge AI"],
    href: "https://tiff-xt.vercel.app/",
    repo: "https://github.com/tiff-xt/portfolio",
    status: "live",
    hue: 285,
  },
];
