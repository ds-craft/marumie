/**
 * DSクラフトで使う機能の切り替え
 *
 * 本家（team-mirai/marumie）の政治資金向けの機能のうち、DSクラフトで使わないものを画面と URL から外す。
 * コードは消さずに残しているので、true にすれば元に戻る。
 */
export const FEATURES = {
  /** 議員（webapp の /p/*、ヘッダーの議員一覧、admin の「議員」） */
  politicians: false,
  /** 議員の調査研究費（webapp の調研費の節、admin の調研費の画面と API） */
  researchFund: false,
  /** 政治資金収支報告書の作成（admin の取引先・寄付者・報告書エクスポート） */
  politicalReport: false,
  /** 貸借対照表（webapp の節とナビ）。専用口座を持つまでは現金残高が常に 0 なので出さない */
  balanceSheet: false,
} as const;

export type FeatureName = keyof typeof FEATURES;

/** 機能を外したときに 404 にする admin のパス（前方一致） */
export const ADMIN_DISABLED_PATH_PREFIXES: Record<FeatureName, readonly string[]> = {
  politicians: ["/politicians"],
  researchFund: ["/politicians", "/api/research-fund", "/api/queues/document-masking", "/api/cron/document-masking"],
  politicalReport: [
    "/counterparts",
    "/assign",
    "/donors",
    "/import-donors",
    "/export-report",
    "/api/export-report",
  ],
  balanceSheet: [],
};

/** 機能を外したときに 404 にする webapp のパス（前方一致） */
export const WEBAPP_DISABLED_PATH_PREFIXES: Record<FeatureName, readonly string[]> = {
  politicians: ["/p/"],
  researchFund: ["/p/"],
  politicalReport: [],
  balanceSheet: [],
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix.endsWith("/")) return pathname.startsWith(prefix);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** 外した機能のパスなら true */
export function isDisabledPath(
  pathname: string,
  table: Record<FeatureName, readonly string[]>,
  features: Record<FeatureName, boolean> = FEATURES,
): boolean {
  return (Object.keys(table) as FeatureName[]).some(
    (name) => !features[name] && table[name].some((prefix) => matchesPrefix(pathname, prefix)),
  );
}
