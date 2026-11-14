"use client";
import "client-only";

import { useSearchParams } from "next/navigation";
import InteractiveTransactionTable from "@/client/components/top-page/features/transactions-table/InteractiveTransactionTable";
import TransactionTable from "@/client/components/top-page/features/transactions-table/TransactionTable";
import {
  parseTransactionsQuery,
  queryTransactions,
  TRANSACTIONS_PER_PAGE,
} from "@/client/lib/transactions-query";
import type { DisplayTransaction } from "@/server/contexts/public-finance/domain/models/display-transaction";

interface StaticTransactionTableProps {
  slug: string;
  year: number;
  /** その年の全件（日付の新しい順） */
  transactions: DisplayTransaction[];
}

/** 全件ページの表。URL のクエリをブラウザで読み、埋め込んだ全件から表示する分を作る（DSクラフト: 静的サイト用） */
export default function StaticTransactionTable({
  slug,
  year,
  transactions,
}: StaticTransactionTableProps) {
  const searchParams = useSearchParams();
  const query = parseTransactionsQuery(new URLSearchParams(searchParams.toString()));
  const view = queryTransactions(transactions, query);

  return (
    <InteractiveTransactionTable
      slug={slug}
      year={year}
      transactions={view.transactions}
      total={view.total}
      page={view.page}
      perPage={view.perPage}
      totalPages={view.totalPages}
      selectedCategories={query.categories}
    />
  );
}

/**
 * URL のクエリはブラウザでしか読めないので、書き出す HTML には既定の並び（新しい順の 1 ページ目）を入れておく。
 * StaticTransactionTable を囲む Suspense の fallback に使う。
 */
export function StaticTransactionTableFallback({
  transactions,
}: Pick<StaticTransactionTableProps, "transactions">) {
  return <TransactionTable transactions={transactions.slice(0, TRANSACTIONS_PER_PAGE)} />;
}
