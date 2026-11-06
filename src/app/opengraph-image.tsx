import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";
import { volcano } from "@/components/hero/volcano";

export const alt = `${site.name}, ${site.role.toLowerCase()}: data-rich products, design systems and AI features`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social card: the hero's volcano plot behind the name, in the dark theme. */
export default async function Image() {
  const serif = await readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf"));
  const pts = volcano(700, 7);
  const x = (v: number) => 640 + ((v + 3.2) / 6.4) * 520;
  const y = (v: number) => 560 - (v / 11) * 470;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0c0e", position: "relative" }}>
      <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1="640" y1="560" x2="1160" y2="560" stroke="rgba(237,234,227,0.18)" />
        <line x1="900" y1="90" x2="900" y2="560" stroke="rgba(237,234,227,0.1)" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={x(p.x)}
            cy={y(p.y)}
            r={p.hot ? 4 : 2.2}
            fill={p.hot ? (p.hot > 0 ? "#a78bfa" : "#4f95ff") : "rgba(217,213,204,0.55)"}
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 72px 72px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 6,
            color: "#9b978f",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 10, background: "#a78bfa", marginRight: 14 }} />
          {site.role}
        </div>
        <div style={{ fontFamily: "Instrument Serif", fontSize: 230, lineHeight: 1, color: "#edeae3", marginTop: 8 }}>
          {site.name}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.35, color: "#c9c5bd", maxWidth: 560, marginTop: 18 }}>
          Data-rich products, design systems and AI features, from first sketch to production.
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }] },
  );
}
