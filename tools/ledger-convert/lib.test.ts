import assert from "node:assert/strict";
import { test } from "node:test";
import { type LedgerRow, type Masters, convertLedger, parseCsv, parseLedgerCsv, toCsv } from "./lib";

const masters: Masters = {
  paymentSources: {
    operator: { public_label: "運営者拠出", contribution_account: "運営者拠出" },
  },
  periods: [{ key: "p1", name: "第1期", start: "2022-11-11", end: null }],
  privateWords: ["サンプル町"],
};

function row(overrides: Partial<LedgerRow> = {}): LedgerRow {
  return {
    id: "2023-001",
    date: "2023-07-10",
    amount_jpy: "35000",
    amount_foreign: "",
    currency: "",
    type: "expense",
    subcategory: "PC本体",
    item: "サーバー用PC 1台目",
    payee: "サンプル通販",
    payment_source: "operator",
    period: "p1",
    evidence_level: "statement",
    evidence_id: "",
    evidence_sha256: "",
    public_note: "",
    private_note: "注文番号 123",
    ...overrides,
  };
}

const run = (rows: LedgerRow[]) => convertLedger([{ path: "ledger/2023.csv", rows }], masters);

test("支出 1 件は「現金/拠出」と「小分類/現金」の 2 行の仕訳になる", () => {
  const r = run([row()]);
  assert.deepEqual(r.errors, []);
  assert.equal(r.mfRows.length, 2);
  const [a, b] = r.mfRows;
  assert.equal(a.取引No, "2023-001-1");
  assert.equal(a.借方勘定科目, "現金");
  assert.equal(a.貸方勘定科目, "運営者拠出");
  assert.equal(a.タグ, "運営者拠出", "タグが空だと admin の取り込みで無効になる");
  assert.equal(b.取引No, "2023-001-2");
  assert.equal(b.借方勘定科目, "PC本体");
  assert.equal(b.貸方勘定科目, "現金");
  assert.equal(b.タグ, "サーバー用PC 1台目");
  assert.equal(b.取引日, "2023/07/10");
  assert.equal(b["借方金額(円)"], "35000");
});

test("収入の行は「現金/小分類」の 1 行になる", () => {
  const r = run([row({ type: "income", subcategory: "個人からの寄付", payment_source: "", item: "寄付" })]);
  assert.deepEqual(r.errors, []);
  assert.equal(r.mfRows.length, 1);
  assert.equal(r.mfRows[0].借方勘定科目, "現金");
  assert.equal(r.mfRows[0].貸方勘定科目, "個人からの寄付");
});

test("公開用の行に非公開の列（private_note）は含まれない", () => {
  const r = run([row()]);
  assert.ok(!("private_note" in r.publicRows[0]));
  assert.ok(!JSON.stringify(r.publicRows).includes("注文番号"));
  assert.equal(r.publicRows[0].funded_by, "運営者拠出");
  assert.equal(r.publicRows[0].category, "ハードウェア費");
});

test("公開される列に非公開の語があるとエラー、private_note にあるだけなら問題ない", () => {
  assert.equal(run([row({ private_note: "サンプル町" })]).errors.length, 0);
  const r = run([row({ public_note: "サンプル町に設置" })]);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /非公開の語/);
});

test("区分にない小分類・収支の向き違い・知らない支払元はエラー", () => {
  assert.match(run([row({ subcategory: "人件費" })]).errors.join(), /区分/);
  assert.match(run([row({ subcategory: "運営者拠出" })]).errors.join(), /income の区分/);
  assert.match(run([row({ payment_source: "card" })]).errors.join(), /payment_source/);
});

test("日付・id・金額の形式と、ファイルの年・対象期間を検証する", () => {
  assert.match(run([row({ date: "2023/07/10" })]).errors.join(), /YYYY-MM-DD/);
  assert.match(run([row({ date: "2024-01-01", id: "2024-001" })]).errors.join(), /2023\.csv/);
  assert.match(run([row({ amount_jpy: "1,000" })]).errors.join(), /正の整数/);
  assert.match(run([row(), row()]).errors.join(), /重複/);
  const early = convertLedger([{ path: "ledger/2022.csv", rows: [row({ id: "2022-001", date: "2022-11-10" })] }], masters);
  assert.match(early.errors.join(), /対象期間/);
});

test("証憑あり（receipt）は証憑ID が必須、ハッシュ値がなければ警告", () => {
  assert.match(run([row({ evidence_level: "receipt" })]).errors.join(), /evidence_id/);
  const r = run([row({ evidence_level: "receipt", evidence_id: "R-2023-001" })]);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join(), /sha256/);
});

test("CSV の読み書きでカンマ・引用符・改行を保つ", () => {
  const rows = [{ a: 'x,"y"', b: "1\n2" }];
  const text = toCsv(["a", "b"] as const, rows);
  assert.deepEqual(parseCsv(text), [["a", "b"], ['x,"y"', "1\n2"]]);
});

test("台帳 CSV の列の過不足を検出する", () => {
  const { errors } = parseLedgerCsv("ledger/2023.csv", "id,date,foo\n2023-001,2023-01-01,x\n");
  assert.match(errors.join(), /列がありません/);
  assert.match(errors.join(), /知らない列/);
});
