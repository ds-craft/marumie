import { PreviewTransaction } from "@/server/contexts/data-import/domain/models/preview-transaction";

/**
 * 公開用データ（data/public）の取り込みで使う純粋な処理（DSクラフト）
 *
 * 静的サイトのビルドでは admin を公開せず、data/public の団体の設定と仕訳 CSV をコマンドで DB に入れる
 * （admin/scripts/import-public-data.ts）。
 */

/** data/public/organization.json の中身（political_organizations の 1 行） */
interface OrganizationConfig {
  slug: string;
  displayName: string;
  orgName: string | null;
  description: string | null;
  websiteUrl: string | null;
  snsUrls: string[];
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KNOWN_KEYS = new Set([
  "slug",
  "displayName",
  "orgName",
  "description",
  "websiteUrl",
  "snsUrls",
]);

function optionalString(value: unknown, key: string, errors: string[]): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    errors.push(`${key} は文字列にしてください`);
    return null;
  }
  return value;
}

/** organization.json を検証して取り出す。誤りがあればまとめて例外にする */
export function parseOrganizationConfig(raw: unknown): OrganizationConfig {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("organization.json はオブジェクトにしてください");
  }
  const obj = raw as Record<string, unknown>;
  const errors: string[] = [];

  for (const key of Object.keys(obj)) {
    if (!KNOWN_KEYS.has(key)) errors.push(`知らない項目があります: ${key}`);
  }

  const slug = obj.slug;
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    errors.push("slug は英小文字・数字・ハイフンの文字列にしてください（例: ds-craft）");
  }
  const displayName = obj.displayName;
  if (typeof displayName !== "string" || displayName.trim() === "") {
    errors.push("displayName を入れてください");
  }

  const orgName = optionalString(obj.orgName, "orgName", errors);
  const description = optionalString(obj.description, "description", errors);
  const websiteUrl = optionalString(obj.websiteUrl, "websiteUrl", errors);

  let snsUrls: string[] = [];
  if (obj.snsUrls !== undefined) {
    if (Array.isArray(obj.snsUrls) && obj.snsUrls.every((u) => typeof u === "string")) {
      snsUrls = obj.snsUrls;
    } else {
      errors.push("snsUrls は文字列の配列にしてください");
    }
  }

  if (errors.length > 0) {
    throw new Error(`organization.json に誤りがあります:\n- ${errors.join("\n- ")}`);
  }

  return {
    slug: slug as string,
    displayName: displayName as string,
    orgName,
    description,
    websiteUrl,
    snsUrls,
  };
}

/**
 * 取り込めない行を「取引No: 理由」の形で返す。空なら全行を取り込める。
 * admin の画面では無効な行を飛ばして保存できるが、公開用のビルドでは 1 行でも無効なら止める。
 */
export function findImportProblems(previews: PreviewTransaction[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const tx of previews) {
    const no = tx.transaction_no || "(取引Noなし)";
    if (tx.status === "invalid") {
      problems.push(`${no}: ${tx.errors.join(" / ")}`);
    } else if (tx.transaction_type === null) {
      problems.push(
        `${no}: 収入・支出のどちらにも当たらない仕訳です（${tx.debit_account} / ${tx.credit_account}）`,
      );
    }

    // MF の取引No は年度ごとに振り直されるので、重複は同じ年度の中で見る（DB の一意制約と同じ）
    const key = `${PreviewTransaction.extractFinancialYear(tx.transaction_date)}:${tx.transaction_no}`;
    if (seen.has(key)) problems.push(`${no}: 同じ年に同じ取引Noがあります`);
    seen.add(key);
  }

  return problems;
}
