/**
 * 公開サイトで選べる年（DSクラフト用）
 *
 * 鯖缶を始めた 2022 年から当年まで。本家は [2025, 2026] を各ファイルに直書きしていたため、ここに集約した。
 */
export const FIRST_PUBLIC_YEAR = 2022;

export const PUBLIC_YEARS: readonly number[] = Array.from(
  { length: new Date().getFullYear() - FIRST_PUBLIC_YEAR + 1 },
  (_, i) => FIRST_PUBLIC_YEAR + i,
);

/** 年の指定がないときに表示する年（当年） */
export const DEFAULT_PUBLIC_YEAR = PUBLIC_YEARS[PUBLIC_YEARS.length - 1];
