import type { MetadataRoute } from "next";
import { DESTINOS } from "@/lib/destinos";

const base = () =>
  process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  const site = base();
  return [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    ...DESTINOS.map((d) => ({
      url: `${site}/intercambio/${d.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${site}/busca`, changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/cotacao`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/guia`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site}/kit`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
