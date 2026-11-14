/**
 * DSクラフト収支台帳（ds-craft/ledger）を検証し、公開用のファイルに変換する。
 *
 * 出力:
 * - MF仕訳帳形式の CSV（admin の CSV アップロードで取り込む）
 * - 公開用の台帳 CSV（公開してよい列だけ）
 *
 * 仕訳の作り方:
 *   marumie の取り込み処理は「現金類 ↔ 収入・支出科目」の組み合わせしか収支として扱わない。
 *   そのため、拠出元（運営者・家族）が払った支出 1 件は次の 2 行にする。
 *     {id}-1  借方 現金 / 貸方 運営者拠出（収入）
 *     {id}-2  借方 PC本体 / 貸方 現金（支出）
 *   同じ日・同じ額なので現金残高は 0 のまま。
 *   type=income の行（寄付など）は 1 行: 借方 現金 / 貸方 小分類。
 */
import { PL_CATEGORIES } from "../../shared/accounting/account-category";

const CASH_ACCOUNT = "現金";

/** 台帳の列（この順で書く） */
export const LEDGER_COLUMNS = [
  "id",
  "date",
  "amount_jpy",
  "amount_foreign",
  "currency",
  "type",
  "subcategory",
  "item",
  "payee",
  "payment_source",
  "evidence_level",
  "evidence_id",
  "evidence_sha256",
  "evidence_redacted_sha256",
  "public_note",
  "private_note",
] as const;

/** 公開用台帳に出す列。ここにない列（private_note など）は決して出力しない */
export const PUBLIC_COLUMNS = [
  "id",
  "date",
  "amount_jpy",
  "amount_foreign",
  "currency",
  "type",
  "category",
  "subcategory",
  "item",
  "payee",
  "funded_by",
  "period",
  "period_name",
  "evidence_level",
  "evidence_id",
  "evidence_sha256",
  "evidence_redacted_sha256",
  "public_note",
] as const;

export const MF_COLUMNS = [
  "取引No",
  "取引日",
  "借方勘定科目",
  "借方補助科目",
  "借方部門",
  "借方取引先",
  "借方税区分",
  "借方インボイス",
  "借方金額(円)",
  "貸方勘定科目",
  "貸方補助科目",
  "貸方部門",
  "貸方取引先",
  "貸方税区分",
  "貸方インボイス",
  "貸方金額(円)",
  "摘要",
  "タグ",
  "メモ",
] as const;

const EVIDENCE_LEVELS = ["receipt", "statement", "estimate"] as const;

export type LedgerRow = Record<(typeof LEDGER_COLUMNS)[number], string>;
type PublicRow = Record<(typeof PUBLIC_COLUMNS)[number], string>;
type MfRow = Record<(typeof MF_COLUMNS)[number], string>;

export interface PaymentSource {
  public_label: string;
  /** 拠出として計上する収入科目（運営者拠出・家族負担など） */
  contribution_account: string;
}

/**
 * サーバー構成の時期。終わりは持たず、次の時期の start の前日までとする。
 * 台帳の各行の時期は支払日から自動で決める（start が支払日以前で最も新しい時期）
 */
export interface Period {
  key: string;
  name: string;
  start: string | null;
}

export interface Masters {
  paymentSources: Record<string, PaymentSource>;
  periods: Period[];
  /** 公開される列に含まれてはいけない語（地名・家族の名前など） */
  privateWords: string[];
}

interface LedgerFile {
  /** 例: ledger/2024.csv */
  path: string;
  rows: LedgerRow[];
}

interface ConvertResult {
  errors: string[];
  warnings: string[];
  mfRows: MfRow[];
  publicRows: PublicRow[];
}

// ---------------------------------------------------------------------------
// CSV

/** RFC 4180 形式の CSV を読む（ダブルクォート・改行入りの値に対応） */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

export function toCsv<T extends string>(columns: readonly T[], rows: Record<T, string>[]): string {
  const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c] ?? "")).join(","))];
  return `${lines.join("\n")}\n`;
}

export function parseLedgerCsv(path: string, text: string): { file: LedgerFile; errors: string[] } {
  const errors: string[] = [];
  const [header, ...body] = parseCsv(text);
  if (!header) return { file: { path, rows: [] }, errors: [`${path}: 空のファイルです`] };
  const cols = header.map((h) => h.trim());
  const missing = LEDGER_COLUMNS.filter((c) => !cols.includes(c));
  const unknown = cols.filter((c) => !(LEDGER_COLUMNS as readonly string[]).includes(c));
  if (missing.length) errors.push(`${path}: 列がありません: ${missing.join(", ")}`);
  if (unknown.includes("period")) errors.push(`${path}: period 列は不要です（時期は支払日から自動で決まる）。列を消してください`);
  const others = unknown.filter((c) => c !== "period");
  if (others.length) errors.push(`${path}: 知らない列があります: ${others.join(", ")}`);
  const rows = body.map((values) => {
    const row = {} as LedgerRow;
    for (const c of LEDGER_COLUMNS) {
      const idx = cols.indexOf(c);
      row[c] = idx >= 0 ? (values[idx] ?? "").trim() : "";
    }
    return row;
  });
  return { file: { path, rows }, errors };
}

// ---------------------------------------------------------------------------
// 変換

const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const toMfDate = (s: string) => s.replaceAll("-", "/");

function emptyMfRow(): MfRow {
  return Object.fromEntries(MF_COLUMNS.map((c) => [c, ""])) as MfRow;
}

function journalLine(
  no: string,
  date: string,
  debit: string,
  credit: string,
  amount: string,
  description: string,
  tag: string,
  memo: string,
): MfRow {
  return {
    ...emptyMfRow(),
    取引No: no,
    取引日: toMfDate(date),
    借方勘定科目: debit,
    借方税区分: "対象外",
    "借方金額(円)": amount,
    貸方勘定科目: credit,
    貸方税区分: "対象外",
    "貸方金額(円)": amount,
    摘要: description,
    タグ: tag,
    メモ: memo,
  };
}

export function convertLedger(files: LedgerFile[], masters: Masters): ConvertResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mfRows: MfRow[] = [];
  const publicRows: PublicRow[] = [];
  const seenIds = new Map<string, string>();
  const periods = [...masters.periods].sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""));
  for (const [i, p] of periods.entries()) {
    if (!p.start || !isIsoDate(p.start)) errors.push(`periods.yaml: ${p.key} の start は YYYY-MM-DD の形にしてください: "${p.start ?? ""}"`);
    else if (i > 0 && periods[i - 1].start === p.start) errors.push(`periods.yaml: ${periods[i - 1].key} と ${p.key} の start が同じです`);
  }
  const earliest = periods[0]?.start ?? undefined;
  /** 支払日の時期: start が支払日以前で最も新しいもの */
  const periodOf = (date: string) => periods.findLast((p) => !!p.start && p.start <= date);

  for (const [key, src] of Object.entries(masters.paymentSources)) {
    const m = PL_CATEGORIES[src.contribution_account];
    if (!m || m.type !== "income") {
      errors.push(
        `payment_sources.yaml: ${key} の contribution_account「${src.contribution_account}」が収入の区分にありません`,
      );
    }
  }

  for (const file of files) {
    const fileYear = file.path.match(/(\d{4})\.csv$/)?.[1];
    file.rows.forEach((r, i) => {
      const where = `${file.path}:${i + 2}${r.id ? ` (${r.id})` : ""}`;
      const rowErrors: string[] = [];
      const err = (msg: string) => rowErrors.push(`${where}: ${msg}`);

      // id
      if (!/^\d{4}-\d{3,}$/.test(r.id)) err(`id は YYYY-NNN の形にしてください: "${r.id}"`);
      else if (seenIds.has(r.id)) err(`id が重複しています（${seenIds.get(r.id)} と同じ）`);
      else seenIds.set(r.id, where);

      // 日付
      if (!isIsoDate(r.date)) err(`date は YYYY-MM-DD の形にしてください: "${r.date}"`);
      else {
        if (fileYear && !r.date.startsWith(fileYear)) err(`${fileYear}.csv に ${r.date} の行があります（支払日の年のファイルに入れる）`);
        if (r.id && !r.id.startsWith(r.date.slice(0, 4))) err(`id の年と date の年が違います`);
        if (earliest && r.date < earliest) err(`対象期間（${earliest}〜）より前の日付です`);
      }

      // 金額
      if (!/^\d+$/.test(r.amount_jpy) || Number(r.amount_jpy) <= 0) err(`amount_jpy は正の整数（円）にしてください: "${r.amount_jpy}"`);
      if ((r.amount_foreign === "") !== (r.currency === "")) err(`amount_foreign と currency は両方書くか両方空にしてください`);
      if (r.amount_foreign && !/^\d+(\.\d+)?$/.test(r.amount_foreign)) err(`amount_foreign が数値ではありません: "${r.amount_foreign}"`);
      if (r.currency && !/^[A-Z]{3}$/.test(r.currency)) err(`currency は USD のような 3 文字にしてください: "${r.currency}"`);

      // 区分
      const mapping = PL_CATEGORIES[r.subcategory];
      if (r.type !== "expense" && r.type !== "income") err(`type は expense か income にしてください: "${r.type}"`);
      if (!mapping) err(`subcategory「${r.subcategory}」は区分（shared/accounting/account-category.ts）にありません`);
      else if (r.type && mapping.type !== r.type) err(`subcategory「${r.subcategory}」は ${mapping.type} の区分です（type=${r.type}）`);

      if (!r.item) err(`item（品目）が空です`);
      if (!r.payee) err(`payee（取引先）が空です`);

      // 支払元
      const src = masters.paymentSources[r.payment_source];
      if (r.type === "expense" && !src) err(`payment_source「${r.payment_source}」は payment_sources.yaml にありません`);
      if (r.type === "income" && r.payment_source && !src) err(`payment_source「${r.payment_source}」は payment_sources.yaml にありません`);

      // 時期（支払日から決める。対象期間より前の日付は上でエラーにしている）
      const period = isIsoDate(r.date) ? periodOf(r.date) : undefined;

      // 証憑
      if (!(EVIDENCE_LEVELS as readonly string[]).includes(r.evidence_level)) err(`evidence_level は ${EVIDENCE_LEVELS.join(" / ")} のどれかにしてください: "${r.evidence_level}"`);
      if (r.evidence_id && !/^R-\d{4}-\d{3,}$/.test(r.evidence_id)) err(`evidence_id は R-YYYY-NNN の形にしてください: "${r.evidence_id}"`);
      if (r.evidence_sha256 && !/^[0-9a-f]{64}$/.test(r.evidence_sha256)) err(`evidence_sha256 は 64 桁の 16 進数（小文字）にしてください`);
      if (r.evidence_redacted_sha256 && !/^[0-9a-f]{64}$/.test(r.evidence_redacted_sha256)) err(`evidence_redacted_sha256 は 64 桁の 16 進数（小文字）にしてください`);
      if (r.evidence_redacted_sha256 && !r.evidence_id) err(`evidence_redacted_sha256 があるのに evidence_id が空です`);
      if (r.evidence_level === "receipt" && !r.evidence_id) err(`evidence_level=receipt なのに evidence_id が空です`);
      if (r.evidence_level === "receipt" && r.evidence_id && !r.evidence_sha256) warnings.push(`${where}: evidence_sha256 が空です`);

      if (rowErrors.length || !mapping || (r.type === "expense" && !src)) {
        errors.push(...rowErrors);
        return;
      }

      const category = mapping.category;
      const fundedBy = src?.public_label ?? "";
      const publicRow: PublicRow = {
        id: r.id,
        date: r.date,
        amount_jpy: r.amount_jpy,
        amount_foreign: r.amount_foreign,
        currency: r.currency,
        type: r.type,
        category,
        subcategory: r.subcategory,
        item: r.item,
        payee: r.payee,
        funded_by: fundedBy,
        period: period?.key ?? "",
        period_name: period?.name ?? "",
        evidence_level: r.evidence_level,
        evidence_id: r.evidence_id,
        evidence_sha256: r.evidence_sha256,
        evidence_redacted_sha256: r.evidence_redacted_sha256,
        public_note: r.public_note,
      };

      // 公開される値に非公開の語が混ざっていないか
      for (const word of masters.privateWords) {
        for (const [col, value] of Object.entries(publicRow)) {
          if (value.includes(word)) errors.push(`${where}: 公開される列 ${col} に非公開の語「${word}」が含まれています`);
        }
      }

      publicRows.push(publicRow);

      const description = `${r.item}（${r.payee}）`;
      if (r.type === "expense" && src) {
        // admin の取り込みはタグ（friendly_category）が空の行を無効にするため、拠出側にも公開名を入れる
        mfRows.push(journalLine(`${r.id}-1`, r.date, CASH_ACCOUNT, src.contribution_account, r.amount_jpy, description, src.public_label, r.public_note));
        mfRows.push(journalLine(`${r.id}-2`, r.date, r.subcategory, CASH_ACCOUNT, r.amount_jpy, description, r.item, r.public_note));
      } else {
        mfRows.push(journalLine(r.id, r.date, CASH_ACCOUNT, r.subcategory, r.amount_jpy, description, r.item, r.public_note));
      }
    });
  }

  for (const p of masters.periods) {
    for (const word of masters.privateWords) {
      if (p.name.includes(word)) errors.push(`periods.yaml: ${p.key} の name に非公開の語「${word}」が含まれています`);
    }
  }

  const byDate = (a: { date: string; id: string }, b: { date: string; id: string }) =>
    a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date);
  publicRows.sort(byDate);
  mfRows.sort((a, b) =>
    a.取引日 === b.取引日 ? a.取引No.localeCompare(b.取引No) : a.取引日.localeCompare(b.取引日),
  );

  return { errors, warnings, mfRows, publicRows };
}
