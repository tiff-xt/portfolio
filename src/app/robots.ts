import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : site.url;

export default function robots(): MetadataRoute.Robots {
  // The chat API is for people, not crawlers.
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }], sitemap: `${base}/sitemap.xml` };
}
