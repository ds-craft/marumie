import "server-only";

import { buildTransactionsCsv } from "@/server/contexts/public-finance/presentation/loaders/load-transactions-for-csv";
import { loadOrganizationYearParams } from "@/server/contexts/public-finance/presentation/loaders/load-static-params";

// DSクラフト: 静的サイトのビルド時に、団体 × 公開年ごとの CSV ファイルとして書き出す
export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = loadOrganizationYearParams;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; year: string }> },
) {
  const { slug, year } = await params;
  const csv = await buildTransactionsCsv(slug, Number.parseInt(year, 10));

  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
