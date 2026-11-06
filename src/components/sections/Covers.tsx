import { mulberry32, volcano } from "../hero/volcano";

/** Generative, code-only project covers. No images to load, crisp at any DPR. */
export function Cover({ slug, hue }: { slug: string; hue: number }) {
  const bg = `radial-gradient(120% 90% at 0% 0%, oklch(0.72 0.14 ${hue} / 0.35), transparent 60%), radial-gradient(90% 80% at 100% 100%, oklch(0.6 0.16 ${(hue + 40) % 360} / 0.3), transparent 60%)`;
  return (
    <div
      className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface-2"
      style={{ backgroundImage: bg }}
    >
      <svg viewBox="0 0 320 200" className="absolute inset-0 size-full" aria-hidden>
        {motif(slug, hue)}
      </svg>
    </div>
  );
}

function motif(slug: string, hue: number) {
  const stroke = `oklch(0.75 0.15 ${hue})`;
  switch (slug) {
    case "helix-workspace": {
      const pts = volcano(380, 3);
      return (
        <g className="origin-center transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <line x1="160" y1="20" x2="160" y2="185" stroke="currentColor" strokeOpacity=".15" />
          <line x1="20" y1="185" x2="300" y2="185" stroke="currentColor" strokeOpacity=".15" />
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={160 + p.x * 46}
              cy={185 - p.y * 17}
              r={p.hot ? 2.3 : 1.4}
              fill={p.hot ? (p.hot > 0 ? "var(--accent)" : "var(--accent-2)") : "currentColor"}
              fillOpacity={p.hot ? 0.95 : 0.35}
            />
          ))}
        </g>
      );
    }
    case "portfolio": {
      const rand = mulberry32(5);
      return (
        <g>
          {Array.from({ length: 260 }, (_, i) => {
            const a = rand() * Math.PI * 2;
            const r = Math.sqrt(rand()) * 70;
            return (
              <circle
                key={i}
                cx={160 + Math.cos(a) * r * 1.6}
                cy={100 + Math.sin(a) * r}
                r={1.3}
                fill="currentColor"
                fillOpacity={0.25 + rand() * 0.5}
                className="transition-transform duration-1000 ease-out group-hover:[transform:translate(var(--dx),var(--dy))]"
                style={
                  { "--dx": `${(rand() - 0.5) * 30}px`, "--dy": `${(rand() - 0.5) * 30}px` } as React.CSSProperties
                }
              />
            );
          })}
          <text x="160" y="118" textAnchor="middle" fontFamily="var(--font-display)" fontSize="58" fill="var(--accent)">
            Aa
          </text>
        </g>
      );
    }
    case "ai-front-desk": {
      // Question in, grounded answer out: a guard checkpoint between them.
      return (
        <g className="transition-transform duration-700 ease-out group-hover:-translate-y-1.5">
          <rect x="44" y="40" width="132" height="34" rx="14" fill="currentColor" fillOpacity=".12" />
          <rect x="58" y="53" width="80" height="7" rx="3.5" fill="currentColor" fillOpacity=".45" />
          <rect x="128" y="96" width="148" height="62" rx="14" fill="var(--accent)" fillOpacity=".9" />
          <rect x="144" y="112" width="104" height="7" rx="3.5" fill="var(--accent-fg)" fillOpacity=".85" />
          <rect x="144" y="126" width="72" height="7" rx="3.5" fill="var(--accent-fg)" fillOpacity=".6" />
          <rect x="144" y="140" width="40" height="7" rx="3.5" fill="var(--accent-2)" />
          <circle cx="104" cy="104" r="15" fill="none" stroke="var(--accent-2)" strokeWidth="2" />
          <path
            d="M97 104l5 5 9-10"
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    }
    case "nightjar":
      // Streetfighter silhouette under a spotlight cone.
      return (
        <g>
          <defs>
            <radialGradient id="nj-spot" cx="50%" cy="100%" r="75%">
              <stop offset="0" stopColor="currentColor" stopOpacity=".3" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M138 0 L182 0 L262 192 L58 192 Z" fill="url(#nj-spot)" />
          <ellipse cx="160" cy="174" rx="112" ry="9" fill="#000" fillOpacity=".35" />
          <g className="transition-transform duration-700 ease-out group-hover:-translate-x-1">
            {/* Tyres and rims */}
            {[96, 226].map((x) => (
              <g key={x}>
                <circle cx={x} cy="140" r="30" fill="none" stroke="currentColor" strokeOpacity=".9" strokeWidth="9" />
                <circle cx={x} cy="140" r="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                <circle cx={x} cy="140" r="4" fill="currentColor" />
              </g>
            ))}
            {/* Swingarm, trellis, fork, bars */}
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M96 140 L150 122" strokeWidth="5" strokeOpacity=".8" />
              <path d="M136 88 L176 80 L150 122 Z M176 80 L190 112 L150 122" strokeWidth="2.5" strokeOpacity=".7" />
              <path d="M226 140 L204 74" strokeWidth="5" strokeOpacity=".85" />
              <path d="M198 66 L216 62" strokeWidth="3" />
              {/* Exhaust */}
              <path d="M172 126 L140 138 L118 130" strokeWidth="4" strokeOpacity=".55" />
            </g>
            {/* Engine block */}
            <rect x="148" y="100" width="40" height="32" rx="4" fill="currentColor" fillOpacity=".55" />
            <rect x="150" y="104" width="36" height="2" fill="var(--bg)" fillOpacity=".5" />
            <rect x="150" y="110" width="36" height="2" fill="var(--bg)" fillOpacity=".5" />
            {/* Tank, seat, tail */}
            <path d="M138 86 L156 70 L190 66 L204 76 L196 90 L150 92 Z" fill="currentColor" fillOpacity=".95" />
            <path d="M100 82 L138 80 L140 88 L104 92 Z" fill="currentColor" fillOpacity=".6" />
            <path d="M84 74 L104 80 L102 86 L88 82 Z" fill="currentColor" fillOpacity=".8" />
            {/* Headlight and tail light */}
            <circle
              cx="212"
              cy="80"
              r="5"
              fill="var(--accent-2)"
              className="transition-opacity duration-500 group-hover:opacity-100"
              opacity=".75"
            />
            <rect x="82" y="73" width="4" height="4" fill="var(--accent)" />
          </g>
        </g>
      );
    case "sprung":
      return (
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M 30 ${170 - i * 4} C ${110 + i * 6} ${170 - i * 4}, ${150 - i * 4} ${40 + i * 6}, 290 ${40 + i * 6}`}
              strokeOpacity={0.25 + i * 0.08}
              className="transition-[stroke-dashoffset] duration-1000 ease-out [stroke-dasharray:400] [stroke-dashoffset:0] group-hover:[stroke-dashoffset:400]"
              style={{ transitionDelay: `${i * 40}ms` }}
            />
          ))}
        </g>
      );
    default:
      return (
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[28, 48, 70, 94].map((r, i) => (
            <ellipse
              key={r}
              cx="160"
              cy="100"
              rx={r * 1.5}
              ry={r * 0.55}
              strokeOpacity={0.6 - i * 0.1}
              transform={`rotate(${-12 + i * 8} 160 100)`}
            />
          ))}
          <circle cx="160" cy="100" r="9" fill="var(--accent)" stroke="none" />
        </g>
      );
  }
}
