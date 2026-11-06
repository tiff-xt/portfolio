import { site } from "@/lib/site";

export function Footer() {
  const links = [
    { href: site.github, label: "GitHub" },
    site.linkedin && { href: site.linkedin, label: "LinkedIn" },
    site.email && { href: `mailto:${site.email}`, label: "Email" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="px-5 pb-10 pt-20 sm:px-10">
      <div className="mx-auto max-w-6xl border-t border-line pt-10">
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-end">
          <p className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.9]">
            Let&apos;s build
            <br />
            something <em className="text-accent">clear</em>.
          </p>
          <ul className="flex gap-6">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-sm underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-14 font-mono text-[11px] leading-relaxed text-muted">
          Designed and built in code by {site.name}. Next.js · WebGL (three.js, custom GLSL) · Cloudflare Workers AI ·
          Postgres + pgvector.{" "}
          <a href={`${site.github}/portfolio`} className="underline underline-offset-2 hover:text-fg">
            Source
          </a>
        </p>
      </div>
    </footer>
  );
}
