import { FEATURES } from "@/shared/features";
import { SITE } from "@/shared/site-config";

const DEFAULT_ORGANIZATION_SLUG = "ds-craft";
const DEFAULT_YEAR = 2026;

export interface FooterTextLink {
  label: string;
  href: string;
}

/** ページ内アンカー以外の、どのページでも共通のリンク。 */
const COMMON_LINKS: FooterTextLink[] = [
  // DSクラフト: 本家の寄附・党員・FAQ のリンクを外し、公式サイトとソースコードにする。
  // 利用規約・プライバシーポリシーは内容が決まるまで載せない（ページは準備中の表示）
  { label: "DSクラフト公式サイト", href: SITE.homeUrl },
  { label: "ソースコード", href: SITE.sourceUrl },
];

function getOrganizationLinks(slug: string): FooterTextLink[] {
  const base = `/o/${slug}/`;
  return [
    { label: "TOP", href: `${base}#top` },
    { label: "収支の流れ", href: `${base}#cash-flow` },
    { label: "月ごとの収支推移", href: `${base}#monthly-trends` },
    // DSクラフト: 貸借対照表を外しているときは出さない（shared/features.ts）
    ...(FEATURES.balanceSheet ? [{ label: "貸借対照表", href: `${base}#balance-sheet` }] : []),
    { label: "すべての出入金", href: `${base}#transactions` },
    { label: "データについて", href: `${base}#explanation` },
    { label: "このサイトについて", href: "/about" },
  ];
}

/**
 * 調研費ページ（/p/[slug]/[year]。全件ページを含む）のアンカー。
 * 調研費ページに無い貸借対照表だけは、並びを変えずに既定の政治団体ページを指す。
 */
function getPoliticianLinks(slug: string, year: number): FooterTextLink[] {
  const base = `/p/${encodeURIComponent(slug)}/${year}/`;
  return [
    { label: "TOP", href: `${base}#top` },
    { label: "収支の流れ", href: `${base}#cash-flow` },
    { label: "月ごとの収支推移", href: `${base}#monthly-trends` },
    { label: "貸借対照表", href: `/o/${DEFAULT_ORGANIZATION_SLUG}/#balance-sheet` },
    { label: "すべての出入金", href: `${base}#transactions` },
    { label: "データについて", href: `${base}#explanation` },
    { label: "このサイトについて", href: "/about" },
  ];
}

/**
 * フッターのテキストリンクを、今いるページに合わせて組み立てる。
 * 調研費ページではアンカーがそのページ内のセクションを指し、政治団体ページへ飛ばない。
 */
export function getFooterTextLinks(pathname: string): FooterTextLink[] {
  const [, rootSegment, slug, yearSegment] = pathname.split("/");

  if (rootSegment === "p" && slug) {
    const year = yearSegment && /^\d{4}$/.test(yearSegment) ? Number(yearSegment) : DEFAULT_YEAR;
    return [...getPoliticianLinks(decodeURIComponent(slug), year), ...COMMON_LINKS];
  }

  const organizationSlug = rootSegment === "o" && slug ? slug : DEFAULT_ORGANIZATION_SLUG;
  return [...getOrganizationLinks(organizationSlug), ...COMMON_LINKS];
}
