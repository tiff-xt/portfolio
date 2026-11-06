import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/caseStudies";
import { site } from "@/lib/site";

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : site.url;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((c) => ({ url: `${base}/work/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
