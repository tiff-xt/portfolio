import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : site.url;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `${site.name}, ${site.role.toLowerCase()}`,
  description: site.tagline,
  openGraph: { title: `${site.name}, ${site.role.toLowerCase()}`, description: site.tagline, type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
};

// Applies a saved theme before first paint so there's no flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        {children}
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
