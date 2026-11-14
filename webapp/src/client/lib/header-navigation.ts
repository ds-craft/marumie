import { SITE } from "@/shared/site-config";

interface HeaderNavigationItem {
  href: string;
  label: string;
}

/**
 * ヘッダーが表示している対象のページ。
 * 調研費の議員ページ（/p/[slug]/[year]）は政治団体ページ（/o/[slug]/[year]）とセクション構成が違うので、
 * アンカーの行き先を分ける。
 */
type HeaderPageKind = "organization" | "politician";

interface HeaderNavigation {
  /** ロゴとトップリンクの行き先（今いるページ自身） */
  homeHref: string;
  items: HeaderNavigationItem[];
}

import { FEATURES } from "@/shared/features";

const RESEARCH_FUND_SECTION_HREF = "#research-fund";
const BALANCE_SHEET_SECTION_HREF = "#balance-sheet";

/** 政治団体ページのセクション（/o/[slug]/[year]）。 */
const ORGANIZATION_SECTIONS: HeaderNavigationItem[] = [
  { href: "#cash-flow", label: "収支の流れ" },
  { href: "#monthly-trends", label: "1年間の推移" },
  { href: BALANCE_SHEET_SECTION_HREF, label: "貸借対照表" },
  { href: "#transactions", label: "すべての出入金" },
  { href: RESEARCH_FUND_SECTION_HREF, label: "調査研究費" },
  { href: "#explanation", label: "データについて" },
];

/** 調研費ページのセクション（最終デザインの「ヘッダー」節）。 */
const POLITICIAN_SECTIONS: HeaderNavigationItem[] = [
  { href: "#cash-flow", label: "収支の流れ" },
  { href: "#monthly-trends", label: "1年間の推移" },
  { href: "#transactions", label: "すべての出入金" },
  { href: "#explanation", label: "データについて" },
];

interface HeaderNavigationOptions {
  /** 政治団体ページのナビに「調査研究費」を出すか（調研費を「公開する」議員がいなければ false） */
  showResearchFund?: boolean;
  /** 政治団体ページのナビに「貸借対照表」を出すか（既定は shared/features.ts の設定） */
  showBalanceSheet?: boolean;
}

/**
 * ヘッダーのナビの行き先を組み立てる。
 * アンカーは今いるページ自身を基準にするので、議員ページで押しても政治団体ページに飛ばない。
 */
export function getHeaderNavigation(
  kind: HeaderPageKind,
  slug: string,
  year: number,
  {
    showResearchFund = true,
    showBalanceSheet = FEATURES.balanceSheet,
  }: HeaderNavigationOptions = {},
): HeaderNavigation {
  const homeHref =
    kind === "politician"
      ? `/p/${encodeURIComponent(slug)}/${year}/`
      : `/o/${encodeURIComponent(slug)}/${year}/`;
  const sections =
    kind === "politician"
      ? POLITICIAN_SECTIONS
      : ORGANIZATION_SECTIONS.filter(
          (section) =>
            (showResearchFund || section.href !== RESEARCH_FUND_SECTION_HREF) &&
            (showBalanceSheet || section.href !== BALANCE_SHEET_SECTION_HREF),
        );

  return {
    homeHref,
    items: [
      ...sections.map((section) => ({ ...section, href: `${homeHref}${section.href}` })),
      // DSクラフト: 本家の「よくあるご質問」の代わりに公式サイトへのリンクを置く
      { href: SITE.homeUrl, label: "DSクラフト公式サイト" },
    ],
  };
}
