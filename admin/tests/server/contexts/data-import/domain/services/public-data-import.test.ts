import type { PreviewTransaction } from "@/server/contexts/data-import/domain/models/preview-transaction";
import {
  findImportProblems,
  parseOrganizationConfig,
} from "@/server/contexts/data-import/domain/services/public-data-import";

describe("parseOrganizationConfig", () => {
  it("必須の項目だけなら、ほかは空にして返す", () => {
    expect(parseOrganizationConfig({ slug: "ds-craft", displayName: "DSクラフト" })).toEqual({
      slug: "ds-craft",
      displayName: "DSクラフト",
      orgName: null,
      description: null,
      websiteUrl: null,
      snsUrls: [],
    });
  });

  it("任意の項目も取り出す（空文字は null にする）", () => {
    expect(
      parseOrganizationConfig({
        slug: "ds-craft",
        displayName: "DSクラフト",
        orgName: "3DS半分こするくらい仲良しクラフト",
        description: "",
        websiteUrl: "https://www.ds2.uk/",
        snsUrls: ["https://example.com/a"],
      }),
    ).toMatchObject({
      orgName: "3DS半分こするくらい仲良しクラフト",
      description: null,
      websiteUrl: "https://www.ds2.uk/",
      snsUrls: ["https://example.com/a"],
    });
  });

  it("誤りをまとめて伝える", () => {
    expect(() =>
      parseOrganizationConfig({ slug: "DS Craft", displayName: "", snsUrls: "x", extra: 1 }),
    ).toThrow(/知らない項目があります: extra[\s\S]*slug[\s\S]*displayName[\s\S]*snsUrls/);
  });

  it("オブジェクトでなければ止める", () => {
    expect(() => parseOrganizationConfig([])).toThrow("オブジェクトにしてください");
  });
});

function preview(overrides: Partial<PreviewTransaction>): PreviewTransaction {
  return {
    political_organization_id: "0",
    transaction_no: "2022-001-1",
    transaction_date: new Date("2022-11-11"),
    transaction_type: "income",
    debit_account: "現金",
    debit_sub_account: undefined,
    debit_amount: 1200,
    credit_account: "寄附",
    credit_sub_account: undefined,
    credit_amount: 1200,
    description: undefined,
    label: "タグ",
    friendly_category: "タグ",
    category_key: "donations",
    hash: "",
    status: "insert",
    errors: [],
    ...overrides,
  };
}

describe("findImportProblems", () => {
  it("すべて取り込めるなら空", () => {
    expect(findImportProblems([preview({}), preview({ transaction_no: "2022-001-2" })])).toEqual([]);
  });

  it("無効な行と、収支に当たらない行を挙げる", () => {
    expect(
      findImportProblems([
        preview({ status: "invalid", errors: ["無効な借方科目: \"x\""] }),
        preview({ transaction_no: "2022-002-1", transaction_type: null }),
      ]),
    ).toEqual([
      '2022-001-1: 無効な借方科目: "x"',
      "2022-002-1: 収入・支出のどちらにも当たらない仕訳です（現金 / 寄附）",
    ]);
  });

  it("同じ年度の取引No の重複を挙げ、年度が違えば重複にしない", () => {
    expect(
      findImportProblems([
        preview({}),
        preview({}),
        preview({ transaction_date: new Date("2023-01-05") }),
      ]),
    ).toEqual(["2022-001-1: 同じ年に同じ取引Noがあります"]);
  });
});
