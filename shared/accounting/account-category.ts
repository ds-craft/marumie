export interface CategoryMapping {
  key: string;
  category: string;
  subcategory?: string;
  color: string;
  shortLabel: string;
  type: "income" | "expense";
}

/**
 * 勘定科目名から表示用カテゴリへのマッピング辞書（DSクラフト用）
 *
 * - キー（勘定科目名）＝小分類。台帳（ds-craft/ledger）の subcategory 列にこの名前を書く
 * - category ＝大分類
 * - 品目（例: サーバー用PC 1台目）は仕訳CSVのタグ列（friendly_category）に入れる
 *
 * 台帳の変換スクリプト（tools/ledger-convert）はこの辞書で小分類名を検証する。
 */
export const PL_CATEGORIES: Record<string, CategoryMapping> = {
  // 収入項目
  "運営者拠出": {
    key: "operator-contribution",
    category: "運営者拠出",
    subcategory: "運営者拠出",
    color: "#BFDBFE",
    shortLabel: "運営者拠出",
    type: "income"
  },
  "家族負担": {
    key: "family-contribution",
    category: "家族負担（現物）",
    subcategory: "家族負担",
    color: "#FED7AA",
    shortLabel: "家族負担",
    type: "income"
  },
  "個人からの寄付": {
    key: "donations-individual",
    category: "寄付",
    subcategory: "個人からの寄付",
    color: "#BBF7D0",
    shortLabel: "個人寄付",
    type: "income"
  },
  "その他の収入": {
    key: "income-other",
    category: "その他の収入",
    subcategory: "その他の収入",
    color: "#E2E8F0",
    shortLabel: "その他収入",
    type: "income"
  },
  // 借入金: 現在は使わないが、webapp の貸借対照表の処理が key "loans" の存在を前提にしているため残す
  "借入金": {
    key: "loans",
    category: "借入金",
    color: "#FECDD3",
    shortLabel: "借入金",
    type: "income"
  },

  // 支出項目
  "PC本体": {
    key: "hw-pc",
    category: "ハードウェア費",
    subcategory: "PC本体",
    color: "#0369A1",
    shortLabel: "PC本体",
    type: "expense"
  },
  "パーツ・周辺機器": {
    key: "hw-parts",
    category: "ハードウェア費",
    subcategory: "パーツ・周辺機器",
    color: "#0E7490",
    shortLabel: "パーツ・周辺機器",
    type: "expense"
  },
  "ケーブル・小物": {
    key: "hw-cables",
    category: "ハードウェア費",
    subcategory: "ケーブル・小物",
    color: "#155E75",
    shortLabel: "ケーブル・小物",
    type: "expense"
  },
  "VPS（本体）": {
    key: "cloud-vps-main",
    category: "クラウド・ドメイン費",
    subcategory: "VPS（本体）",
    color: "#4D7C0F",
    shortLabel: "VPS本体",
    type: "expense"
  },
  "VPS（中継）": {
    key: "cloud-vps-relay",
    category: "クラウド・ドメイン費",
    subcategory: "VPS（中継）",
    color: "#047857",
    shortLabel: "VPS中継",
    type: "expense"
  },
  "臨時サーバー（メンテ用）": {
    key: "cloud-vps-temp",
    category: "クラウド・ドメイン費",
    subcategory: "臨時サーバー（メンテ用）",
    color: "#15803D",
    shortLabel: "臨時サーバー",
    type: "expense"
  },
  "ドメイン": {
    key: "cloud-domain",
    category: "クラウド・ドメイン費",
    subcategory: "ドメイン",
    color: "#65A30D",
    shortLabel: "ドメイン",
    type: "expense"
  },
  "ソフトウェア・サービス": {
    key: "software-services",
    category: "ソフトウェア・サービス費",
    subcategory: "ソフトウェア・サービス",
    color: "#6D28D9",
    shortLabel: "ソフト・サービス",
    type: "expense"
  },
  "電気代": {
    key: "utility-electricity",
    category: "光熱費（設置先）",
    subcategory: "電気代",
    color: "#C2410C",
    shortLabel: "電気代",
    type: "expense"
  },
  "決済手数料": {
    key: "misc-fees",
    category: "手数料・その他",
    subcategory: "決済手数料",
    color: "#475569",
    shortLabel: "決済手数料",
    type: "expense"
  },
  "その他の支出": {
    key: "misc-other",
    category: "手数料・その他",
    subcategory: "その他の支出",
    color: "#334155",
    shortLabel: "その他支出",
    type: "expense"
  },
};

/**
 * 貸借対照表科目のカテゴリ分類
 */
export const BS_CATEGORIES: Record<string, { type: "asset" | "liability" | "net_asset" }> = {
  "現金": {
    type: "asset"
  },
  "普通預金": {
    type: "asset"
  },
  "仮払金": {
    type: "asset"
  },
  "立替金": {
    type: "asset"
  },
  "未収入金": {
    type: "asset"
  },
  "未払金": {
    type: "liability"
  },
  "未払費用": {
    type: "liability"
  },
  "仮受金": {
    type: "liability"
  },
};

/**
 * 現金類の科目
 */
export const CASH_ACCOUNTS = new Set(["現金", "普通預金"]);

/**
 * 債権科目（未収入金など）
 *
 * 現金類でない資産科目のうち、貸借対照表の流動資産に取引の残高（借方 − 貸方）で計上するもの。
 * 現金類は残高スナップショットで計上する。仮払金・立替金は現金の一時的な振替として扱い、残高は計上しない。
 */
export const RECEIVABLE_ACCOUNTS = new Set(["未収入金"]);

/**
 * 収入科目（PL科目のうち type が income のもの）
 */
export const INCOME_ACCOUNTS: string[] = Object.entries(PL_CATEGORIES)
  .filter(([, mapping]) => mapping.type === "income")
  .map(([account]) => account);

/**
 * 借入金の科目名
 *
 * 政治資金収支報告書では借入れを収入に、返済を支出（借入金返済）に計上する。
 * 借方に来た借入金は収入の返金ではなく返済なので、収入から差し引かず支出として扱う。
 */
export const LOAN_ACCOUNT = "借入金";

/**
 * 借方に来たときに収入の返金として収入から差し引く科目（借入金を除く収入科目）
 */
export const REFUNDABLE_INCOME_ACCOUNTS: string[] = INCOME_ACCOUNTS.filter(
  (account) => account !== LOAN_ACCOUNT,
);

/**
 * 支出科目（PL科目のうち type が expense のもの）
 */
export const EXPENSE_ACCOUNTS: string[] = Object.entries(PL_CATEGORIES)
  .filter(([, mapping]) => mapping.type === "expense")
  .map(([account]) => account);
