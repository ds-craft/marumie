/**
 * 使い方:
 *   pnpm ledger:convert -- --ledger ../ledger --out data/public
 *
 * --ledger       台帳リポジトリ（ds-craft/ledger）のパス
 * --out          出力先ディレクトリ（mf-journal.csv と ledger-public.csv を書く）
 * --check        検証だけ行い、ファイルは書かない
 * --private-dir  private_words.txt のあるフォルダ（既定: 環境変数 LEDGER_PRIVATE_DIR）
 *
 * private_words.txt（公開してはいけない語）は語そのものが個人情報なので、台帳リポジトリの外に置く。
 * 探す順: --private-dir → LEDGER_PRIVATE_DIR → {ledger}/masters/private_words.txt（サンプル台帳用）。
 * 見つからないとき、出力するならエラーで止める（検査なしで公開データを作らない）。--check なら警告だけ。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  MF_COLUMNS,
  type Masters,
  PUBLIC_COLUMNS,
  type PaymentSource,
  type Period,
  convertLedger,
  parseLedgerCsv,
  toCsv,
} from "./lib";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const ledgerDir = arg("ledger") ?? "../ledger";
const outDir = arg("out") ?? "data/public";
const checkOnly = process.argv.includes("--check");
const privateDir = arg("private-dir") ?? process.env.LEDGER_PRIVATE_DIR;

/** YAML の日付・null・TODO を文字列か null にそろえる */
function normDate(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** private_words.txt のパス。指定された場所に無いのは設定の誤りなのでエラーにする */
function findPrivateWords(dir: string): { path?: string; error?: string } {
  if (privateDir) {
    const p = join(privateDir, "private_words.txt");
    return existsSync(p) ? { path: p } : { error: `${p} がありません（--private-dir / LEDGER_PRIVATE_DIR を確認してください）` };
  }
  const fallback = join(dir, "masters/private_words.txt");
  if (existsSync(fallback)) return { path: fallback };
  return { error: "private_words.txt が見つかりません。--private-dir か環境変数 LEDGER_PRIVATE_DIR で場所を指定してください" };
}

function loadMasters(dir: string, wordsPath: string | undefined): Masters {
  const ps = parseYaml(readFileSync(join(dir, "masters/payment_sources.yaml"), "utf8")) as Record<string, PaymentSource>;
  const periodsRaw = parseYaml(readFileSync(join(dir, "masters/periods.yaml"), "utf8")) as Array<Record<string, unknown>>;
  const periods: Period[] = periodsRaw.map((p) => ({
    key: String(p.key),
    name: String(p.name),
    start: normDate(p.start),
  }));
  const privateWords = wordsPath
    ? readFileSync(wordsPath, "utf8")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
    : [];
  return { paymentSources: ps ?? {}, periods, privateWords };
}

function main() {
  const words = findPrivateWords(ledgerDir);
  if (words.error && !checkOnly) {
    console.error(`エラー: ${words.error}`);
    console.error("非公開の語の検査ができないため出力しません");
    process.exit(1);
  }
  if (words.error) console.warn(`警告: ${words.error}（非公開の語の検査を飛ばします）`);
  const masters = loadMasters(ledgerDir, words.path);
  const ledgerPath = join(ledgerDir, "ledger");
  const csvFiles = readdirSync(ledgerPath)
    .filter((f) => /^\d{4}\.csv$/.test(f))
    .sort();

  const parseErrors: string[] = [];
  const files = csvFiles.map((f) => {
    const { file, errors } = parseLedgerCsv(`ledger/${f}`, readFileSync(join(ledgerPath, f), "utf8"));
    parseErrors.push(...errors);
    return file;
  });

  const result = convertLedger(files, masters);
  const errors = [...parseErrors, ...result.errors];

  for (const w of result.warnings) console.warn(`警告: ${w}`);
  for (const e of errors) console.error(`エラー: ${e}`);

  const total = result.publicRows.reduce((s, r) => s + Number(r.amount_jpy), 0);
  console.log(`台帳 ${files.length} ファイル / ${result.publicRows.length} 行 / 合計 ¥${total.toLocaleString("ja-JP")}`);

  if (errors.length) {
    console.error(`エラーが ${errors.length} 件あるため出力しません`);
    process.exit(1);
  }
  if (checkOnly) return;

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "mf-journal.csv"), toCsv(MF_COLUMNS, result.mfRows));
  writeFileSync(join(outDir, "ledger-public.csv"), toCsv(PUBLIC_COLUMNS, result.publicRows));
  console.log(`出力: ${join(outDir, "mf-journal.csv")}（仕訳 ${result.mfRows.length} 行）`);
  console.log(`出力: ${join(outDir, "ledger-public.csv")}`);
}

main();
