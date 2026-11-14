import { getHeaderNavigation } from "@/client/lib/header-navigation";

describe("getHeaderNavigation", () => {
  it("政治団体ページでは /o/[slug]/[year] のセクションを指す", () => {
    const { homeHref, items } = getHeaderNavigation("organization", "team-mirai", 2025);

    expect(homeHref).toBe("/o/team-mirai/2025/");
    expect(items.map((item) => item.href)).toEqual([
      "/o/team-mirai/2025/#cash-flow",
      "/o/team-mirai/2025/#monthly-trends",
      "/o/team-mirai/2025/#balance-sheet",
      "/o/team-mirai/2025/#transactions",
      "/o/team-mirai/2025/#research-fund",
      "/o/team-mirai/2025/#explanation",
      "https://www.ds2.uk/",
    ]);
  });

  it("調研費の導線を隠す設定なら、政治団体ページのナビに調査研究費を出さない", () => {
    const { items } = getHeaderNavigation("organization", "team-mirai", 2025, {
      showResearchFund: false,
    });

    expect(items.map((item) => item.label)).toEqual([
      "収支の流れ",
      "1年間の推移",
      "貸借対照表",
      "すべての出入金",
      "データについて",
      "DSクラフト公式サイト",
    ]);
  });

  it("調研費ページでは同じページ内のセクションを指す", () => {
    const { homeHref, items } = getHeaderNavigation("politician", "sample-taro", 2026);

    expect(homeHref).toBe("/p/sample-taro/2026/");
    expect(items).toEqual([
      { href: "/p/sample-taro/2026/#cash-flow", label: "収支の流れ" },
      { href: "/p/sample-taro/2026/#monthly-trends", label: "1年間の推移" },
      { href: "/p/sample-taro/2026/#transactions", label: "すべての出入金" },
      { href: "/p/sample-taro/2026/#explanation", label: "データについて" },
      {
        href: "https://www.ds2.uk/",
        label: "DSクラフト公式サイト",
      },
    ]);
  });

  it("議員ページのナビは政治団体ページ（/o/）へ飛ばない", () => {
    const { items } = getHeaderNavigation("politician", "sample-taro", 2026);

    expect(items.filter((item) => item.href.startsWith("/o/"))).toEqual([]);
  });

  it("プレビュー URL では、プレビュー用の文字列を保ったまま同じページのセクションを指す", () => {
    const { homeHref, items } = getHeaderNavigation("politician", "sample-taro~0123456789abcdef0123456789abcdef", 2026);

    expect(homeHref).toBe("/p/sample-taro~0123456789abcdef0123456789abcdef/2026/");
    expect(items[0].href).toBe("/p/sample-taro~0123456789abcdef0123456789abcdef/2026/#cash-flow");
  });

  it("slug は URL エンコードする", () => {
    expect(getHeaderNavigation("politician", "a/b", 2026).homeHref).toBe("/p/a%2Fb/2026/");
  });
});

describe("getHeaderNavigation（DSクラフト: 貸借対照表を外したとき）", () => {
  it("showBalanceSheet: false なら政治団体ページのナビに貸借対照表を出さない", () => {
    const { items } = getHeaderNavigation("organization", "ds-craft", 2023, {
      showResearchFund: false,
      showBalanceSheet: false,
    });
    const labels = items.map((item) => item.label);

    expect(labels).not.toContain("貸借対照表");
    expect(labels).not.toContain("調査研究費");
    expect(labels).toContain("収支の流れ");
    expect(labels).toContain("すべての出入金");
  });
});
