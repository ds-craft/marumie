import { DEFAULT_PUBLIC_YEAR, PUBLIC_YEARS } from "@/shared/public-years";
import "server-only";
import { pageTitle } from "@/shared/site-config";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import SiteBottomBlock from "@/client/components/common/SiteBottomBlock";
import Breadcrumbs from "@/client/components/layout/Breadcrumbs";
import MainColumn from "@/client/components/layout/MainColumn";
import SectionCard from "@/client/components/layout/SectionCard";
import StaticTransactionTable, {
  StaticTransactionTableFallback,
} from "@/client/components/transactions/StaticTransactionTable";
import { loadTransactionsPageData } from "@/server/contexts/public-finance/presentation/loaders/load-transactions-page-data";
import { loadOrganizations } from "@/server/contexts/public-finance/presentation/loaders/load-organizations";
import { loadOrganizationYearParams } from "@/server/contexts/public-finance/presentation/loaders/load-static-params";
import { formatUpdatedAt } from "@/client/lib/format-date";

const VALID_YEARS = PUBLIC_YEARS;
const DEFAULT_YEAR = DEFAULT_PUBLIC_YEAR;

// DSクラフト: 静的サイトとして、団体 × 公開年のページだけを書き出す
export const dynamicParams = false;
export const generateStaticParams = loadOrganizationYearParams;

interface TransactionsPageProps {
  params: Promise<{
    slug: string;
    year: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; year: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { default: defaultSlug, organizations } = await loadOrganizations();
  const validSlug = organizations.some((org) => org.slug === slug) ? slug : defaultSlug;

  const organization = organizations.find((org) => org.slug === validSlug);

  return {
    title: pageTitle(`${organization?.displayName || "Unknown"}:全ての出入金`),
    description: `${organization?.displayName || "Unknown"}の運営資金の出入金の一覧です。`,
  };
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { slug, year: yearParam } = await params;

  // 年度の妥当性をチェック
  const yearNumber = parseInt(yearParam, 10);
  const financialYear = VALID_YEARS.includes(yearNumber) ? yearNumber : DEFAULT_YEAR;

  // 年度が不正な場合はデフォルト年度にリダイレクト
  if (financialYear !== yearNumber) {
    redirect(`/o/${slug}/${DEFAULT_YEAR}/transactions`);
  }

  // slugの妥当性をチェックし、必要に応じてリダイレクト
  const { default: defaultSlug, organizations } = await loadOrganizations();
  if (!organizations.some((org) => org.slug === slug)) {
    redirect(`/o/${defaultSlug}/${financialYear}/transactions`);
  }

  try {
    // DSクラフト: 本家はサーバーが URL のクエリでページ送り・絞り込みをするが、
    // 静的サイトでは 1 年分を全件埋め込み、表示する分はブラウザで作る（StaticTransactionTable）
    const data = await loadTransactionsPageData({
      slugs: [slug],
      financialYear,
      all: true,
    });

    const organization = data.politicalOrganizations.find((org) => org.slug === slug);
    const organizationName = organization?.displayName || "未登録の団体";
    const updatedAt = formatUpdatedAt(data.lastUpdatedAt ?? null);

    return (
      <MainColumn spacing="compact">
        <div className="flex flex-col gap-5">
          <Breadcrumbs
            parent={{ label: `${organizationName}の収支`, href: `/o/${slug}/${financialYear}` }}
            current="すべての出入金"
          />
          <SectionCard
            id="transactions"
            iconSrc="/icons/icon-cashback.svg"
            iconLabel="Cash move icon"
            eyebrow={`${organizationName}・${financialYear}年`}
            title="すべての出入金"
            updatedAt={updatedAt}
            headingLevel="h1"
          >
            <Suspense
              fallback={<StaticTransactionTableFallback transactions={data.transactions} />}
            >
              <StaticTransactionTable
                slug={slug}
                year={financialYear}
                transactions={data.transactions}
              />
            </Suspense>
          </SectionCard>
        </div>
        <SiteBottomBlock />
      </MainColumn>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      notFound();
    }

    throw error;
  }
}
