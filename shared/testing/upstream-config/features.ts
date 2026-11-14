/**
 * テスト専用: 本家と同じく全機能を有効にした設定。
 * admin / webapp の jest は @/shared/features をこのファイルに差し替える（jest.config.js）。
 * 機能を外したときの動作は shared/ds-config.test.ts と各テストで features を明示して検証する。
 */
import {
  type FeatureName,
  isDisabledPath as isDisabledPathWith,
} from "../../features";

export { ADMIN_DISABLED_PATH_PREFIXES, WEBAPP_DISABLED_PATH_PREFIXES } from "../../features";
export type { FeatureName } from "../../features";

export const FEATURES: Record<FeatureName, boolean> = {
  politicians: true,
  researchFund: true,
  politicalReport: true,
  balanceSheet: true,
};

export function isDisabledPath(
  pathname: string,
  table: Record<FeatureName, readonly string[]>,
  features: Record<FeatureName, boolean> = FEATURES,
): boolean {
  return isDisabledPathWith(pathname, table, features);
}
