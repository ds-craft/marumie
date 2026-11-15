import type { Transaction } from "@/shared/models/transaction";
import { PL_CATEGORIES, type CategoryMapping } from "@/shared/accounting/account-category";
import type { EvidenceLevel } from "@/shared/public-ledger";

/**
 * DisplayTransaction ドメインモデル
 *
 * 表示用取引データを表現する。
 * Transaction から DisplayTransaction への変換ロジックを純粋関数として提供する。
 */

/**
 * 表示用取引タイプ（offset系は除外）
 */
export type DisplayTransactionType = "income" | "expense";

/**
 * DSクラフト: 取引の元になった台帳の行の、証憑の確度と公開している証憑
 */
export interface TransactionEvidence {
  /** 台帳の id（例: 2023-001） */
  ledgerId: string;
  level: EvidenceLevel;
  /** 公開している証憑のファイル名（例: R-2023-001.pdf）。公開していなければ無い */
  file?: string;
}

/**
 * 表示用取引データ
 */
export interface DisplayTransaction {
  id: string;
  date: Date;
  yearmonth: string;
  transactionType: DisplayTransactionType;
  category: string;
  subcategory?: string;
  account: string;
  /** 保存済みの category_key。カテゴリーの絞り込みはサーバーがこの値で照合する */
  categoryKey: string;
  label: string;
  shortLabel: string;
  friendly_category: string;
  absAmount: number;
  amount: number;
  /** DSクラフト: 仕訳の取引No（台帳の行と結び付けるのに使う） */
  transactionNo?: string;
  /** DSクラフト: 台帳の証憑（公開台帳があるときだけ付く） */
  evidence?: TransactionEvidence;
}

/**
 * 年月フォーマット文字列を生成する
 * @param date 日付
 * @returns "YYYY.MM" 形式の文字列
 */
export function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

/**
 * アカウント名からカテゴリマッピングを取得する
 * 存在しない場合はデフォルト値を返す
 * @param account アカウント名
 * @returns カテゴリマッピング
 */
export function getCategoryMapping(account: string): CategoryMapping {
  return (
    PL_CATEGORIES[account] || {
      category: "unknown",
      subcategory: "unknown",
      color: "#99F6E4",
      shortLabel: "不明",
    }
  );
}

/**
 * トランザクションタイプに基づいてアカウント名を取得する
 * @param transaction トランザクション
 * @returns アカウント名（支出の場合は借方勘定、収入の場合は貸方勘定）
 */
export function getAccountFromTransaction(transaction: Transaction): string {
  return transaction.transaction_type === "expense"
    ? transaction.debit_account
    : transaction.credit_account;
}

/**
 * 表示用金額を計算する
 * @param transaction トランザクション
 * @returns absAmount（絶対値）と amount（支出時はマイナス）
 */
export function calculateDisplayAmount(transaction: Transaction): {
  absAmount: number;
  amount: number;
} {
  const baseAmount =
    transaction.transaction_type === "expense"
      ? transaction.debit_amount
      : transaction.credit_amount;

  const absAmount = Math.abs(baseAmount);
  const amount = transaction.transaction_type === "expense" ? -absAmount : absAmount;

  return { absAmount, amount };
}

/**
 * Transaction を DisplayTransaction に変換する
 * @param transaction 元のTransactionオブジェクト
 * @returns 表示用に変換されたDisplayTransactionオブジェクト
 */
export function convertToDisplayTransaction(transaction: Transaction): DisplayTransaction {
  // offset系のトランザクションタイプが渡された場合は警告を出力
  if (
    transaction.transaction_type === "offset_income" ||
    transaction.transaction_type === "offset_expense"
  ) {
    console.warn(
      `offset（相殺取引）を直接表示することは想定されていません。データ取得方法が間違っていないか確認しましょう。transaction_type: ${transaction.transaction_type}, transaction ID: ${transaction.id}`,
    );
  }

  const yearmonth = formatYearMonth(new Date(transaction.transaction_date));
  const account = getAccountFromTransaction(transaction);
  const categoryMapping = getCategoryMapping(account);
  const { absAmount, amount } = calculateDisplayAmount(transaction);

  return {
    id: transaction.id,
    date: transaction.transaction_date,
    yearmonth,
    transactionType: transaction.transaction_type as DisplayTransactionType,
    category: categoryMapping.category,
    subcategory: categoryMapping.subcategory,
    account,
    categoryKey: transaction.category_key,
    label: transaction.label || "",
    shortLabel: categoryMapping.shortLabel,
    friendly_category: transaction.friendly_category,
    absAmount,
    amount,
    transactionNo: transaction.transaction_no,
  };
}

/**
 * Transaction配列をDisplayTransaction配列に変換する
 * @param transactions トランザクション配列
 * @returns 表示用に変換されたDisplayTransaction配列
 */
export function convertToDisplayTransactions(transactions: Transaction[]): DisplayTransaction[] {
  return transactions.map(convertToDisplayTransaction);
}
