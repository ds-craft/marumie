/**
 * テスト専用: 本家と同じ公開年（2025・2026）。
 * admin / webapp の jest は @/shared/public-years をこのファイルに差し替える（jest.config.js）。
 */
export const FIRST_PUBLIC_YEAR = 2025;
export const PUBLIC_YEARS: readonly number[] = [2025, 2026];
export const DEFAULT_PUBLIC_YEAR = 2026;
