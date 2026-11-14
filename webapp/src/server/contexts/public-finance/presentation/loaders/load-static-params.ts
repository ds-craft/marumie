import "server-only";

import { PUBLIC_YEARS } from "@/shared/public-years";
import { loadOrganizations } from "@/server/contexts/public-finance/presentation/loaders/load-organizations";

/**
 * 静的サイトで書き出すページの一覧（DSクラフト）。generateStaticParams から使う。
 * DB にある団体 × 公開年（shared/public-years.ts）のページを作る。
 */
export async function loadOrganizationSlugParams(): Promise<{ slug: string }[]> {
  const { organizations } = await loadOrganizations();
  return organizations.map((org) => ({ slug: org.slug }));
}

export async function loadOrganizationYearParams(): Promise<{ slug: string; year: string }[]> {
  const slugs = await loadOrganizationSlugParams();
  return slugs.flatMap(({ slug }) => PUBLIC_YEARS.map((year) => ({ slug, year: String(year) })));
}
