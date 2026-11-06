import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#approach", label: "Approach" },
  { href: "/#skills", label: "Skills" },
  { href: "/#work", label: "Work" },
  { href: "/#life", label: "Life" },
  { href: "/#ask", label: "Ask" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-full border border-line bg-bg/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl backdrop-saturate-150 sm:mx-6 lg:mx-auto"
      >
        <Link href="/#top" className="font-display text-xl leading-none">
          {site.name}
          <span className="text-accent">.</span>
        </Link>
        <ul className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="relative rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
