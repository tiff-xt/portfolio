/**
 * Case-study content, keyed by project slug. Plain data: the page template in
 * src/app/work/[slug] renders it. House style: no em dashes.
 */
export type Shot = { src: string; alt: string; caption: string; width: number; height: number };
export type Decision = { title: string; body: string };

export type CaseStudy = {
  slug: string;
  /** One-line framing shown under the title. */
  headline: string;
  role: string;
  focus: string[];
  stack: string[];
  problem: string[];
  approach: string[];
  decisions: Decision[];
  outcome: string[];
  shots: Shot[];
};

const shot = (slug: string, file: string, alt: string, caption: string, width = 1440, height = 900): Shot => ({
  src: `/work/${slug}/${file}.webp`,
  alt,
  caption,
  width,
  height,
});

export const caseStudies: CaseStudy[] = [
  {
    slug: "helix-workspace",
    headline: "Designing clarity into complex scientific workflows.",
    role: "Design and engineering, end to end",
    focus: ["Product design", "Data visualization", "Design systems", "Accessibility"],
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "SVG / Canvas"],
    problem: [
      "Research tools tend to fail the same way: dense data, long multi-step pipelines, and interfaces built for whoever wrote the analysis rather than the person deciding what to investigate next.",
      "I wanted a case study that deals with those real problems without reproducing any proprietary work: a fictional tool for inspecting gene-expression results, with every number generated in the browser.",
    ],
    approach: [
      "The page alternates between a working product and short explanations of the decisions behind it, so a reviewer can use the thing and then read why it works that way.",
      "The centre is a volcano plot of about 2,400 genes with hover, selection, keyboard navigation, live thresholds and selective labelling, surrounded by the states a real product needs: a five-step workflow that can fail and recover, and a structured research assistant.",
    ],
    decisions: [
      {
        title: "Label less, not more",
        body: "Direct labels only on the points that matter at the current thresholds, and a legend that shows counts. Labelling everything turns 2,400 points into noise.",
      },
      {
        title: "An assistant, not a chatbot",
        body: "Suggestions arrive as ranked candidates with a rationale, calibrated confidence and a next step, and each one links back to the plot. The user can see what an answer is based on.",
      },
      {
        title: "Status never relies on colour",
        body: "Contrast ratios are computed live from the active theme, and a grayscale preview proves every state is still distinguishable without colour.",
      },
      {
        title: "Show the system, from production components",
        body: "Tokens, type and spacing scales and every component state are rendered from the same components the product uses, in light and dark side by side.",
      },
    ],
    outcome: [
      "A single page that demonstrates product thinking, dense-data interaction and a component system together.",
      "Keyboard-operable visualization and an accessibility section that verifies itself instead of just claiming compliance.",
    ],
    shots: [
      shot(
        "helix-workspace",
        "hero",
        "Helix Workspace product shell with sidebar, workspace and inspector",
        "The product shell: sidebar, top bar, workspace and inspector.",
      ),
      shot(
        "helix-workspace",
        "plot",
        "Interactive volcano plot of about 2,400 genes with threshold controls",
        "The volcano plot: thresholds, selective labels and keyboard navigation.",
      ),
      shot(
        "helix-workspace",
        "assistant",
        "Research assistant panel with ranked, cited suggestions",
        "The research assistant: ranked candidates, honest confidence, a next step.",
      ),
      shot(
        "helix-workspace",
        "system",
        "Design system section showing light and dark themes side by side",
        "The design system, rendered from production components.",
      ),
    ],
  },
  {
    slug: "ai-front-desk",
    headline: "An AI front desk where the AI never computes a fact.",
    role: "Design and engineering, end to end",
    focus: ["AI product design", "LLM guardrails", "Internationalization", "Operator tools"],
    stack: ["React", "TypeScript", "Vite", "Cloudflare Workers", "Vitest"],
    problem: [
      "Most AI front desks answer questions about the organisation. Parents ask about their child, on a specific day: can she come in with a temperature, is Wednesday a holiday, what can she eat given her allergy.",
      "Those answers have to be right every time, and an LLM paraphrasing policy is exactly where they go wrong.",
    ],
    approach: [
      "Policy logic is deterministic code over a structured source of truth that staff edit. The LLM, when configured, does only two jobs: classify wording the rules miss, and translate grounded answers for parents who write in another language.",
      "Every answer shows its status, its source and who last updated it, and a trace of why it was given. Staff get a console to set how much the AI may say per topic, see where it struggled, and fix a gap once for every family that asked.",
    ],
    decisions: [
      {
        title: "A guard on every translation",
        body: "Translated answers are checked both ways: any number, date or weekday the facts don't support is rejected, and so is any number the translation dropped. It understands formats like $1.890, 100,4 and jueves.",
      },
      {
        title: "Don't paraphrase policy",
        body: "English answers keep their exact template wording. In testing, a friendlier LLM rewrite once dropped a child's allergy, so rewriting was removed rather than tuned.",
      },
      {
        title: "Autonomy is a staff setting",
        body: "Per topic: answer, draft for me, or always me. Emergencies and other families' data are locked guardrails that can't be loosened.",
      },
      {
        title: "Golden questions block deploys",
        body: "27 evaluation questions run in CI and live in the staff console, re-checked against every knowledge edit. A policy regression stops the release.",
      },
    ],
    outcome: [
      "Answers that are specific to the child, cited, and correct by construction rather than by prompt.",
      "Works with no LLM at all: it degrades to rules and templates, and the model only ever widens coverage.",
    ],
    shots: [
      shot(
        "ai-front-desk",
        "parent",
        "Parent view of the AI front desk with a cited answer",
        "The parent front desk: answers specific to the child, with sources.",
      ),
      shot(
        "ai-front-desk",
        "staff",
        "Staff console showing grouped unanswered questions",
        "Staff console, Gaps: answer once for every family that asked.",
      ),
      shot("ai-front-desk", "spanish", "Parent interface in Spanish", "Any language in, facts checked on the way out."),
    ],
  },
  {
    slug: "nightjar",
    headline: "A motorcycle launch told in light, scroll and sound, built entirely in code.",
    role: "Concept, 3D, motion and sound",
    focus: ["Real-time 3D", "Lighting", "Scroll storytelling", "Web Audio"],
    stack: ["Next.js", "three.js", "React Three Fiber", "drei", "postprocessing", "Web Audio"],
    problem: [
      "Product launch sites usually lean on video. I wanted the opposite: a real-time scene the visitor directs with their scroll, where the product can be pulled apart, recoloured and heard.",
      "No downloaded model either. The bike, the lighting and the engine note are all generated in code.",
    ],
    approach: [
      "The bike is built from a small geometry kit: rods between two points, swept tubes for the headers, coil springs, and bevelled side-profile extrusions that give the faceted tank its edges. Seven assemblies each have an explode vector.",
      "One story-progress value drives everything: the camera keyframes, the exploded view, night mode with the headlight beam, and the callouts pinned to parts of the bike.",
    ],
    decisions: [
      {
        title: "Chrome comes from what it reflects",
        body: "The liquid-silver finish comes from a custom environment of softbox and strip lights, so the metal shows long, clean highlights instead of a photo backdrop.",
      },
      {
        title: "Frame the product beside the copy",
        body: "A camera film offset keeps the bike clear of the text on wide screens and re-centres it on phones, without moving the camera's subject.",
      },
      {
        title: "A V-twin with no samples",
        body: "Pulses at the firing frequency, an uneven firing pattern, a sub-octave and an intake filter that opens with revs. Scroll speed and a hold-to-rev control drive it.",
      },
      {
        title: "Story maths is tested",
        body: "Camera interpolation and effect windows are pure functions with tests: no jumps between shots, and effects only appear in their sections.",
      },
    ],
    outcome: [
      "A launch site that works as a product page and a technical demo at once.",
      "Fully fictional and original: no real brand, design or specifications.",
    ],
    shots: [
      shot(
        "nightjar",
        "hero",
        "Nightjar motorcycle under a garage spotlight with a chrome wordmark",
        "The hero: one spotlight, a reflective floor and a chrome wordmark.",
        1120,
        700,
      ),
      shot(
        "nightjar",
        "twin",
        "Close-up of the engine with labelled callouts",
        "Callouts pinned to parts of the bike in 3D.",
        1120,
        700,
      ),
      shot(
        "nightjar",
        "exploded",
        "The motorcycle pulled apart into its assemblies",
        "The anatomy section pulls the bike into seven assemblies.",
        1120,
        700,
      ),
      shot(
        "nightjar",
        "build",
        "Paint and frame configurator beside the bike",
        "The configurator: physically based finishes on a turntable.",
        1120,
        700,
      ),
    ],
  },
  {
    slug: "portfolio",
    headline: "A personal site that is also a full-stack system.",
    role: "Design and engineering, end to end",
    focus: ["Full stack", "Retrieval and LLMs", "Motion", "Privacy"],
    stack: ["Next.js", "React 19", "Postgres + pgvector", "Cloudflare Workers AI", "three.js", "Vitest"],
    problem: [
      "A portfolio usually proves taste but not engineering. I wanted this one to show the full stack: real data, a real model, real failure modes.",
      "It also had to answer questions about my work without publishing my private notes to a public repository.",
    ],
    approach: [
      "The assistant answers from a private knowledge base that never enters git: notes are chunked, embedded and synced to Postgres from my machine. Questions go through a deterministic topic policy, then retrieval, then generation, streamed as typed events.",
      "The front end is a motion system with one signature piece: thousands of points that start as a volcano plot and assemble into the headline's exact letterforms.",
    ],
    decisions: [
      {
        title: "Rules before the model",
        body: "Off-limits topics are declined by code before any model call. The model is told the same rules, but correctness doesn't depend on it following them.",
      },
      {
        title: "Degrade, never fabricate",
        body: "If the model is unavailable or the free quota runs out, answers fall back to quoting the notes directly. The stream reads the first token before committing to model mode, so a failure mid-request still falls back cleanly.",
      },
      {
        title: "The UI explains itself",
        body: "A pipeline inspector shows which path ran, the retrieval method, the sources and the latency for every answer.",
      },
      {
        title: "Progressive enhancement for the hero",
        body: "The real headline always renders and is only painted transparent once WebGL is running, so it still works for screen readers, selection and browsers without WebGL.",
      },
    ],
    outcome: [
      "Question text is never stored; metrics are anonymous counts and rate limits use salted IP hashes.",
      "Runs entirely on free tiers, with tests around the risky logic: ranking, policy, stream parsing and fallbacks.",
    ],
    shots: [
      shot(
        "portfolio",
        "hero",
        "Portfolio hero with particles forming the name",
        "Points start as a volcano plot and assemble into the headline.",
      ),
      shot(
        "portfolio",
        "work",
        "Work section with project cards",
        "Project covers are generative SVG, no images to load.",
      ),
      shot(
        "portfolio",
        "ask",
        "AI assistant answering with sources and a pipeline inspector",
        "The assistant cites its sources and shows how each answer was produced.",
      ),
    ],
  },
  {
    slug: "sprung",
    headline: "Micro-interactions with physics, published to npm.",
    role: "Library design, engineering and documentation",
    focus: ["Component API design", "Motion", "Accessibility", "Open source"],
    stack: ["React", "TypeScript", "Web Animations API", "Next.js", "Vitest", "Testing Library"],
    problem: [
      "Most interaction libraries hand you durations and easing curves and leave the feel to guesswork. Springs feel better, but are usually simulated in a JavaScript loop every frame.",
      "I wanted interactions that feel physical, run on the compositor, survive being interrupted, and are accessible without extra work.",
    ],
    approach: [
      "Springs are solved in closed form for all three damping regimes and compiled into a CSS linear() easing with a duration derived from settle time, so animations run through the Web Animations API instead of a per-frame loop.",
      "Twelve headless components build on that core, and a gallery site uses the published package itself, with a spring playground and a reduced-motion preview on every demo.",
    ],
    decisions: [
      {
        title: "Interruptible by default",
        body: "Every animation starts from the element's current visual state, so rapid toggles and mid-flight changes never jump.",
      },
      {
        title: "Headless",
        body: "Components ship no CSS. Consumers style them with className and data-state attributes, so the library fits any design system.",
      },
      {
        title: "Reduced motion is a design, not an off switch",
        body: "Each component has a considered reduced-motion behaviour, and the gallery shows it side by side so it's reviewed, not assumed.",
      },
      {
        title: "Verified maths",
        body: "The analytic solution is tested against numerical integration, and accessibility behaviour (ARIA patterns, keyboard models, announcements) is tested in jsdom.",
      },
    ],
    outcome: [
      "Published as @tiffxt/sprung, with typed ESM output and a documented API.",
      "A headline that demonstrates the library: the word physics rides the package's own spring on its variable-font axes, without reflowing the line.",
    ],
    shots: [
      shot(
        "sprung",
        "hero",
        "Sprung landing page with the headline",
        "The headline flexes on the library's own spring.",
      ),
      shot(
        "sprung",
        "playground",
        "Spring playground with sliders and a live curve",
        "Tune stiffness, damping and mass, and copy the CSS it compiles to.",
      ),
      shot(
        "sprung",
        "demos",
        "Gallery of interaction demos",
        "Every demo has a reduced-motion preview, rationale and code.",
      ),
    ],
  },
  {
    slug: "orbital",
    headline: "A generative studio identity rendered with one hand-written shader.",
    role: "Concept, graphics programming and sound",
    focus: ["GLSL", "Generative identity", "Audio reactivity", "Performance"],
    stack: ["Next.js", "WebGL2", "GLSL ES 3.0", "Web Audio", "Vitest"],
    problem: [
      "Static logos are a print-era habit. On a screen, a brand can breathe, react and make a sound.",
      "I wanted to build that from first principles: no 3D engine, no textures, every pixel computed by the GPU.",
    ],
    approach: [
      "The sky is a single fragment shader: a domain-warped nebula, parallax stars, a ray-marched planet with fractal terrain, banded clouds and shadowed rings, and an atmosphere that is brighter on the lit side.",
      "One short seed generates the palette, the planet and the logo's orbit, so every visitor gets their own Orbital and can share it as a link.",
    ],
    decisions: [
      {
        title: "Only march where the planet is",
        body: "An analytic bounding-sphere test runs first, so pixels of empty sky skip the ray march entirely.",
      },
      {
        title: "No flash of the wrong brand",
        body: "A tiny inline script resolves the seed and applies its palette before first paint. A test runs that script and checks it agrees with the TypeScript implementation.",
      },
      {
        title: "Quality that adapts",
        body: "A governor watches frame times and trades resolution and march steps for frame rate, with hysteresis so it never flickers between tiers.",
      },
      {
        title: "Sound you can see",
        body: "A synthesised house loop or the microphone is split into bass, mid and high bands that drive the atmosphere, nebula and stars. Audio is analysed locally and never recorded.",
      },
    ],
    outcome: [
      "A brand that is generated, interactive and audible, and still fast on a mid-range phone.",
      "A lab page where every parameter is a live control and any planet is a shareable URL.",
    ],
    shots: [
      shot(
        "orbital",
        "hero",
        "Orbital hero with a ringed planet and the signal wordmark",
        "The hero: one shader, one seed, one planet.",
      ),
      shot("orbital", "solar", "A different seed with a warm solar palette", "Another seed, another identity."),
      shot(
        "orbital",
        "lab",
        "The lab with live controls beside the planet",
        "The lab: every parameter live, every planet shareable.",
      ),
    ],
  },
];

export const caseStudyBySlug = (slug: string) => caseStudies.find((c) => c.slug === slug);
