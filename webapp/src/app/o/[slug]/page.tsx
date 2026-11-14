import { DEFAULT_PUBLIC_YEAR } from "@/shared/public-years";
import "server-only";
import { redirect } from "next/navigation";
import { loadOrganizations } from "@/server/contexts/public-finance/presentation/loaders/load-organizations";
import { loadOrganizationSlugParams } from "@/server/contexts/public-finance/presentation/loaders/load-static-params";

const DEFAULT_YEAR = DEFAULT_PUBLIC_YEAR;

// DSクラフト: 静的サイトとして、DB にある団体のページだけを書き出す（中身は既定の年へのリダイレクト）
export const dynamicParams = false;
export const generateStaticParams = loadOrganizationSlugParams;

interface OrgPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { slug } = await params;

  // slugの妥当性をチェックし、必要に応じてデフォルトslugを使用
  const { default: defaultSlug, organizations } = await loadOrganizations();
  const validSlug = organizations.some((org) => org.slug === slug) ? slug : defaultSlug;

  // デフォルト年度にリダイレクト
  redirect(`/o/${validSlug}/${DEFAULT_YEAR}`);
}
