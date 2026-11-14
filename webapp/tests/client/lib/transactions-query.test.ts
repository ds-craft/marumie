import { parseTransactionsQuery, queryTransactions } from "@/client/lib/transactions-query";
import type { DisplayTransaction } from "@/server/contexts/public-finance/domain/models/display-transaction";

function tx(id: string, amount: number, categoryKey = "vps"): DisplayTransaction {
  const type = amount >= 0 ? "income" : "expense";
  return {
    id,
    date: new Date("2023-01-01"),
    yearmonth: "2023.01",
    transactionType: type,
    category: "c",
    account: "a",
    categoryKey,
    label: id,
    shortLabel: id,
    friendly_category: id,
    absAmount: Math.abs(amount),
    amount,
  };
}

// DB から取った並び（日付の新しい順）を想定
const all = [tx("d", -500), tx("c", 500, "contribution"), tx("b", -3000, "power"), tx("a", 3000, "contribution")];
const ids = (list: DisplayTransaction[]) => list.map((t) => t.id);

describe("parseTransactionsQuery", () => {
  it("何もなければ日付の新しい順の 1 ページ目", () => {
    expect(parseTransactionsQuery(new URLSearchParams())).toEqual({
      page: 1,
      transactionType: undefined,
      sortBy: "date",
      order: "desc",
      categories: undefined,
    });
  });

  it("クエリを読み、知らない値は既定に戻す", () => {
    expect(
      parseTransactionsQuery(
        new URLSearchParams("page=3&filterType=expense&sort=amount&order=asc&categories=a,b,"),
      ),
    ).toEqual({ page: 3, transactionType: "expense", sortBy: "amount", order: "asc", categories: ["a", "b"] });
    expect(parseTransactionsQuery(new URLSearchParams("page=x&filterType=y&sort=z&order=w"))).toMatchObject({
      page: 1,
      transactionType: undefined,
      sortBy: "date",
      order: "desc",
    });
    expect(parseTransactionsQuery(new URLSearchParams("page=-2")).page).toBe(1);
  });
});

describe("queryTransactions", () => {
  const q = (s: string) => parseTransactionsQuery(new URLSearchParams(s));

  it("既定は元の並びのまま", () => {
    expect(ids(queryTransactions(all, q("")).transactions)).toEqual(["d", "c", "b", "a"]);
  });

  it("日付の古い順は逆にする", () => {
    expect(ids(queryTransactions(all, q("order=asc")).transactions)).toEqual(["a", "b", "c", "d"]);
  });

  it("金額で並べ、同じ金額は日付の並びを保つ", () => {
    expect(ids(queryTransactions(all, q("sort=amount")).transactions)).toEqual(["b", "a", "d", "c"]);
    expect(ids(queryTransactions(all, q("sort=amount&order=asc")).transactions)).toEqual([
      "c",
      "d",
      "a",
      "b",
    ]);
  });

  it("収支とカテゴリーで絞り込む", () => {
    expect(ids(queryTransactions(all, q("filterType=expense")).transactions)).toEqual(["d", "b"]);
    expect(ids(queryTransactions(all, q("categories=power,vps")).transactions)).toEqual(["d", "b"]);
  });

  it("ページに分ける", () => {
    const result = queryTransactions(all, q("page=2"), 3);
    expect(ids(result.transactions)).toEqual(["a"]);
    expect(result).toMatchObject({ total: 4, page: 2, perPage: 3, totalPages: 2 });
  });
});
