import type { MetadataRoute } from "next";

// DSクラフト: 静的サイトとして robots.txt を書き出す
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.WEBAPP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
