/**
 * 公開台帳（ledger-public.csv）を読む処理のテスト。
 *   pnpm test:ds
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { ledgerIdOfTransactionNo, parsePublicLedger } from "./public-ledger";

test("取引No から台帳の id を出す（支出の -1・-2 を外す。収入はそのまま）", () => {
  assert.equal(ledgerIdOfTransactionNo("2023-001-1"), "2023-001");
  assert.equal(ledgerIdOfTransactionNo("2023-001-2"), "2023-001");
  assert.equal(ledgerIdOfTransactionNo("2023-001"), "2023-001");
  assert.equal(ledgerIdOfTransactionNo("T-1"), "T-1");
});

test("ledger-public.csv を読む。evidence_file が無い古い CSV でも読める", () => {
  const csv = [
    "id,date,amount_jpy,type,item,evidence_level,evidence_id,evidence_redacted_sha256,evidence_file",
    `2023-001,2023-07-10,35000,expense,"PC, 1台目",receipt,R-2023-001,${"a".repeat(64)},R-2023-001.pdf`,
    "2023-002,2023-07-10,980,expense,ケーブル,statement,,,",
  ].join("\n");
  const [a, b] = parsePublicLedger(csv);
  assert.equal(a.amountJpy, 35000);
  assert.equal(a.item, "PC, 1台目");
  assert.equal(a.evidenceFile, "R-2023-001.pdf");
  assert.equal(b.evidenceLevel, "statement");
  assert.equal(b.evidenceFile, "");
  assert.equal(parsePublicLedger("id,evidence_level\n2023-001,receipt\n")[0].evidenceFile, "");
});

test("確度が読めない行はエラー", () => {
  assert.throws(() => parsePublicLedger("id,evidence_level\n2023-001,maybe\n"), /evidence_level/);
});
