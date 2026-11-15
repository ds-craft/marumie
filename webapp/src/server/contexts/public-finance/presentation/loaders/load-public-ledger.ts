import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PUBLIC_LEDGER_FILE,
  type PublicLedgerEntry,
  ledgerIdOfTransactionNo,
  parsePublicLedger,
} from "@/shared/public-ledger";
import type { DisplayTransaction } from "@/server/contexts/public-finance/domain/models/display-transaction";

/**
 * DSクラフト: 公開台帳（public/evidence/ledger-public.csv）を読む。
 * ビルドの前に pnpm public:stage が data/public から置く。置かれていなければ空（証憑のリンクを出さない）
 */
export async function loadPublicLedger(): Promise<PublicLedgerEntry[]> {
  // next build / next dev は webapp ディレクトリで動く
  const file = path.join(process.cwd(), "public", "evidence", PUBLIC_LEDGER_FILE);
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  return parsePublicLedger(text);
}

/** 取引の各行に、元になった台帳の行の証憑を付ける */
export async function attachEvidence(
  transactions: DisplayTransaction[],
): Promise<DisplayTransaction[]> {
  const ledger = await loadPublicLedger();
  if (ledger.length === 0) return transactions;
  const byId = new Map(ledger.map((entry) => [entry.id, entry]));
  return transactions.map((tx) => {
    const entry = tx.transactionNo
      ? byId.get(ledgerIdOfTransactionNo(tx.transactionNo))
      : undefined;
    if (!entry) return tx;
    return {
      ...tx,
      evidence: {
        ledgerId: entry.id,
        level: entry.evidenceLevel,
        ...(entry.evidenceFile ? { file: entry.evidenceFile } : {}),
      },
    };
  });
}
