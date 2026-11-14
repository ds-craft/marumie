/**
 * サイトの名前・リンクなど（DSクラフト用）
 *
 * 本家（team-mirai/marumie）のチームみらい向けの表記を置き換えるため、画面に出す名前や URL はここから参照する。
 */
export const SITE = {
  /** サイト名 */
  name: "DSクラフト まる見え運営資金",
  /** <title> などで名前の後ろに付ける一言 */
  tagline: "DSクラフトの運営資金をオープンに",
  description:
    "Minecraft マルチプレイコミュニティ「3DS半分こするくらい仲良しクラフト」（DSクラフト）の運営資金の流れを公開しています。",

  /** コミュニティの正式名称・略称 */
  communityName: "3DS半分こするくらい仲良しクラフト",
  communityShortName: "DSクラフト",
  /** 運営主体（ポータルの著作権表示と揃える） */
  operatorName: "3DS半分こするくらい仲良しクラフト中央委員会",

  /** DSクラフトの公式サイト */
  homeUrl: "https://www.ds2.uk/",
  /** このサイトのソースコード（AGPL-3.0 によりソースを入手できるようにする） */
  sourceUrl: "https://github.com/ds-craft/marumie",
  /** 元にしたソフトウェア */
  upstreamName: "みらいまる見え政治資金（チームみらい）",
  upstreamUrl: "https://github.com/team-mirai/marumie",

  logo: { src: "/logos/ds-craft-logo.png", alt: "DSクラフトのロゴ" },

  minecraftNotice:
    "Minecraft の公式のサービスではありません。Mojang または Microsoft から承認を受けておらず、それとの関連性もありません。",
} as const;

/** 著作権表示（ポータルと同じ形） */
export function copyrightText(year: number = new Date().getFullYear()): string {
  return `© ${year} ${SITE.operatorName}`;
}

/** ページの <title>（例: 「DSクラフト - DSクラフト まる見え運営資金」） */
export function pageTitle(prefix?: string): string {
  return prefix ? `${prefix} - ${SITE.name}` : SITE.name;
}
