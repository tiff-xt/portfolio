# Portfolio

**Live:** https://tiff-xt.vercel.app/

A personal site that is also a full-stack system: a GPU-rendered hero, a small
motion system, and an assistant that answers questions about my technical work.
The assistant is grounded in my own notes, cites what it used, and shows how
each answer was produced.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · three.js with custom GLSL · Cloudflare Workers AI · Postgres + pgvector (Neon) ·
Zod · Vitest · GitHub Actions. Runs entirely on free tiers.

## Highlights

### Hero: data that becomes a name

About 9,000 points start as a volcano plot (effect size against significance)
and assemble into the headline's exact letterforms. The page's real `<h1>` is
rasterised with its computed font, its filled pixels are sampled, and those
become the particle targets. As you scroll, the name dissolves back into data.
Your cursor pushes through the points like a brush, and a live readout shows
the plot coordinates under it.

- All per-point motion runs in the vertex shader. Each frame the CPU only updates a few uniforms.
- three.js is loaded separately, client-only, so it stays off the critical path.
- **Progressive enhancement:** the DOM headline always renders. It's only made
  transparent once WebGL is running, so it still works for screen readers,
  selection, SEO and no-WebGL browsers.
- Rendering pauses when the hero is off-screen or the tab is hidden. Device
  pixel ratio is capped at 2. Point count drops on small screens.
- `prefers-reduced-motion` gets one static, fully formed frame.

### Motion system

- Easing, duration and stagger tokens live in CSS (`globals.css`), with a JS mirror in `src/lib/motion/tokens.ts`.
- **Primitives:**
  - `Reveal` and `SplitText`: compositor-only, and JS flips a single attribute.
  - `Magnetic`: spring physics. The rAF loop runs only while the element is settling.
  - `Tilt`: CSS-variable driven.
- **View Transitions:**
  - The skills panel and its sliding indicator move between tabs.
  - The theme switch does a circular wipe that starts at the cursor.
- Every effect has a reduced-motion path.

### Photo that arrives as data

The "Off the clock" photo is first drawn as a colour halftone: each dot is
sized by brightness, glowing like an LED matrix in dark mode and printed like
ink in light mode. The real photo then opens out from the subject. After that,
hovering shows a halftone lens under the cursor.

- The canvas is painted once, and again only on resize or theme change.
- The reveal and the lens are CSS `clip-path` and `mask`, so they run on the compositor.
- The `<img>` is the real content, and the canvas is decoration.

### Assistant: AI with deterministic edges

```
question ──▶ policy check ──▶ retrieval ──▶ generation ──▶ NDJSON stream ──▶ UI
             (rules, no LLM)   pgvector or     Workers AI, or
                               BM25 fallback   extractive fallback
```

1. **Policy first.** Off-limits topics are declined by deterministic rules
   before retrieval or any model call. The model gets the same instructions,
   but correctness doesn't depend on it following them.
2. **Grounded retrieval.**
   - Uses pgvector cosine similarity when embeddings exist, and BM25 keyword
     ranking (with domain synonyms) otherwise.
   - Weak tail matches are dropped so citations stay honest.
3. **Graceful degradation.** If Workers AI isn't configured, or the free daily
   allocation runs out, the route switches to an extractive answer that quotes
   the notes directly. It never fabricates. The route reads the first token
   before committing to "AI mode", so a quota error falls back cleanly instead
   of failing halfway through a stream.
4. **Typed streaming protocol.** Newline-delimited JSON events (`meta`, `delta`,
   `notice`, `done`, `error`) are shared by server and client, and the client
   can stop generation (`AbortController`).
5. **The UI explains itself.** A pipeline inspector shows which path ran, the
   retrieval method, the sources used and end-to-end latency.
6. **Privacy.**
   - Question text is never stored.
   - Metrics are anonymous counts: mode, sections used, latency.
   - Rate limiting is keyed on salted IP hashes.

### Knowledge base stays out of git

The notes the assistant answers from live in `content/knowledge/private/`,
which is gitignored and `.vercelignore`d. `npm run kb:ingest` chunks them by
heading, embeds only chunks that changed (content hashes), and upserts them to
Postgres. Production reads from the database. Resolution order:
**database → private files (local dev) → public example**, so the site always
works.

## Running locally

```bash
npm install
npm run dev
```

With no configuration, everything works in demo mode. To use your own notes,
add markdown files to `content/knowledge/private/`. Use `## Section` and
`### Subsection` headings. A `## Guidance` section becomes instructions for the
assistant and is never cited.

## Deploying (all free tiers)

1. **Vercel:** import this repo. No build settings are needed.
2. **Database:** in Vercel go to Storage → Create → Neon. This sets `DATABASE_URL`.
3. **Cloudflare Workers AI:** create an API token with the _Workers AI_ (Read)
   permission. Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to the
   Vercel environment variables.
4. **Set a salt:** add `RATE_LIMIT_SALT` with any random string.
5. **Migrate and ingest, from your machine:** put the same variables in
   `.env.local`, then run:
   ```bash
   npm run db:migrate
   npm run kb:ingest
   ```
6. **Check it:** `GET /api/health` reports which capabilities are live (booleans only).

Re-run `npm run kb:ingest` whenever you edit your notes. Answers refresh within five minutes.

## Quality

`npm run check` runs typecheck, lint and tests. CI also runs a production build.
The tests cover the risky logic:

- chunking and ranking
- topic policy, with false-positive cases like "rate limiting"
- SSE and NDJSON parsing across arbitrary chunk boundaries
- the extractive fallback never saying anything outside the notes
- rate-limit windows
