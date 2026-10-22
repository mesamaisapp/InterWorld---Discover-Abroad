import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site =
    process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return {
    // Painel, links secretos de alunos e agências e rotas de API ficam fora do Google
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/responder/", "/cotacao/", "/api/"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
