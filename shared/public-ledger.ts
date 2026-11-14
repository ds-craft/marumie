/**
 * 公開台帳（ledger-public.csv）と証憑（DSクラフト）。
 *
 * - 台帳の変換（pnpm ledger:convert）が data/public/ledger-public.csv と data/public/evidence/ を書き出す
 * - 静的サイトのビルドの前に（pnpm public:stage）、それを webapp/public/evidence/ に置く
 * - サイトでは /evidence/ledger-public.csv と /evidence/R-YYYY-NNN.pdf として配る
 */
import { parseCsvRecords } from "./csv";

/** サイトで公開台帳と証憑を配るパス */
export const EVIDENCE_BASE_PATH = "/evidence";
export const PUBLIC_LEDGER_FILE = "ledger-public.csv";

export const EVIDENCE_LEVELS = ["receipt", "statement", "estimate"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** 証憑の確度の表示名 */
export const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
  receipt: "証憑あり",
  statement: "明細から",
  estimate: "概算",
};

/** 公開してよい証憑の拡張子（公開するときのファイル名は「証憑ID + 拡張子」） */
export const EVIDENCE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"] as const;

export interface PublicLedgerEntry {
  id: string;
  date: string;
  amountJpy: number;
  type: "income" | "expense";
  subcategory: string;
  item: string;
  payee: string;
  fundedBy: string;
  evidenceLevel: EvidenceLevel;
  evidenceId: string;
  /** 公開している証憑のファイル名（例: R-2023-001.pdf）。公開していなければ空 */
  evidenceFile: string;
  /** 原本の SHA-256 */
  evidenceSha256: string;
  /** 公開している（黒塗りした）証憑の SHA-256 */
  evidenceRedactedSha256: string;
  publicNote: string;
}

const isEvidenceLevel = (v: string): v is EvidenceLevel =>
  (EVIDENCE_LEVELS as readonly string[]).includes(v);

/** ledger-public.csv を読む。確度が読めない行はエラーにする（変換で検証済みのはず） */
export function parsePublicLedger(text: string): PublicLedgerEntry[] {
  return parseCsvRecords(text).map((r, i) => {
    const level = r.evidence_level ?? "";
    if (!isEvidenceLevel(level)) {
      throw new Error(`${PUBLIC_LEDGER_FILE}:${i + 2}: evidence_level が読めません: "${level}"`);
    }
    return {
      id: r.id ?? "",
      date: r.date ?? "",
      amountJpy: Number(r.amount_jpy ?? 0),
      type: r.type === "income" ? "income" : "expense",
      subcategory: r.subcategory ?? "",
      item: r.item ?? "",
      payee: r.payee ?? "",
      fundedBy: r.funded_by ?? "",
      evidenceLevel: level,
      evidenceId: r.evidence_id ?? "",
      evidenceFile: r.evidence_file ?? "",
      evidenceSha256: r.evidence_sha256 ?? "",
      evidenceRedactedSha256: r.evidence_redacted_sha256 ?? "",
      publicNote: r.public_note ?? "",
    };
  });
}

/**
 * 仕訳の取引No から台帳の id を出す。
 * 支出 1 件は `{id}-1`（拠出）と `{id}-2`（支出）の 2 行になり、収入は `{id}` の 1 行になる
 */
export function ledgerIdOfTransactionNo(transactionNo: string): string {
  const m = transactionNo.match(/^(\d{4}-\d{3,})(-\d+)?$/);
  return m ? m[1] : transactionNo;
}
