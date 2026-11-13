import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";
import { seatLayout } from "@/components/hero/scenes";

export const alt = `${site.name}, ${site.role.toLowerCase()}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social card: the hero's seat map beside the name and the one-line pitch, in the dark theme. */
export default async function Image() {
  const serif = await readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf"));
  const W = 500;
  const H = 440;
  const { seats, size: seat } = seatLayout(W, H);
  const ox = 640;
  const oy = 96;
  const fill = { "-1": "#4f95ff", "0": "rgba(217,213,204,0.22)", "1": "#a78bfa" } as const;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0c0e", position: "relative" }}>
      <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M ${ox + W * 0.27} ${oy + 8} Q ${ox + W / 2} ${oy + 58} ${ox + W * 0.73} ${oy + 8}`}
          fill="none"
          stroke="rgba(237,234,227,0.55)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {seats.map((s, i) => (
          <rect
            key={i}
            x={ox + s.x - seat / 2}
            y={oy + s.y - seat / 2}
            width={seat}
            height={seat}
            rx="2.5"
            fill={fill[String(s.state) as keyof typeof fill]}
          />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 72px 64px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 21,
            letterSpacing: 5,
            color: "#9b978f",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 10, background: "#a78bfa", marginRight: 14 }} />
          {site.role} / {site.experience}
        </div>
        <div style={{ fontFamily: "Instrument Serif", fontSize: 220, lineHeight: 1, color: "#edeae3", marginTop: 8 }}>
          {site.name}
        </div>
        <div style={{ fontSize: 33, lineHeight: 1.3, color: "#edeae3", maxWidth: 540, marginTop: 20 }}>
          {site.tagline}
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Instrument Serif", data: serif, style: "normal", weight: 400 }] },
  );
}
