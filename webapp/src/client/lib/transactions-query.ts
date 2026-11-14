import type {
  DisplayTransaction,
  DisplayTransactionType,
} from "@/server/contexts/public-finance/domain/models/display-transaction";

/**
 * 全件ページの絞り込み・並べ替え・ページ送りをブラウザ側で行う（DSクラフト: 静的サイト用）
 *
 * 本家はサーバーが URL のクエリ（page / sort / order / filterType / categories）を読んで DB に問い合わせる。
 * 静的サイトではその年の全件をページに埋め込み、同じクエリをここで解釈して同じ結果を作る。
 */

export const TRANSACTIONS_PER_PAGE = 50;

interface TransactionsQuery {
  page: number;
  transactionType?: DisplayTransactionType;
  sortBy: "date" | "amount";
  order: "asc" | "desc";
  categories?: string[];
}

export function parseTransactionsQuery(params: URLSearchParams): TransactionsQuery {
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const filterType = params.get("filterType");
  const sort = params.get("sort");
  const order = params.get("order");
  const categories = (params.get("categories") ?? "").split(",").filter(Boolean);

  return {
    page: Number.isFinite(page) ? Math.max(page, 1) : 1,
    transactionType: filterType === "income" || filterType === "expense" ? filterType : undefined,
    sortBy: sort === "amount" ? "amount" : "date",
    order: order === "asc" ? "asc" : "desc",
    categories: categories.length > 0 ? categories : undefined,
  };
}

/**
 * all は DB から「日付の新しい順・取引No の大きい順」で取った 1 年分。
 * 本家のサーバーの並べ替え（日付 or 金額、同じなら取引No）に合わせる。
 */
export function queryTransactions(
  all: DisplayTransaction[],
  query: TransactionsQuery,
  perPage: number = TRANSACTIONS_PER_PAGE,
) {
  const categories = query.categories ? new Set(query.categories) : null;
  const filtered = all.filter(
    (tx) =>
      (!query.transactionType || tx.transactionType === query.transactionType) &&
      (!categories || categories.has(tx.categoryKey)),
  );

  // 昇順は元の並びを逆にする（同じ日付・金額の中も取引No の小さい順になる）
  const base = query.order === "asc" ? [...filtered].reverse() : filtered;
  const sorted =
    query.sortBy === "amount"
      ? [...base].sort((a, b) =>
          query.order === "asc" ? a.absAmount - b.absAmount : b.absAmount - a.absAmount,
        )
      : base;

  const total = sorted.length;
  const start = (query.page - 1) * perPage;
  return {
    transactions: sorted.slice(start, start + perPage),
    total,
    page: query.page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
