/**
 * 小さな CSV の読み書き（DSクラフト）。
 * 台帳の変換（tools/ledger-convert）と、webapp が公開台帳を読むところで使う。
 */

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

/** 1 行目を見出しとして、行ごとに { 見出し: 値 } にする */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];
  const cols = header.map((h) => h.trim());
  return body.map((values) => Object.fromEntries(cols.map((c, i) => [c, (values[i] ?? "").trim()])));
}

export function toCsv<T extends string>(columns: readonly T[], rows: Record<T, string>[]): string {
  const esc = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => esc(r[c] ?? "")).join(","))];
  return `${lines.join("\n")}\n`;
}
