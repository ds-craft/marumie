/**
 * DSクラフトの設定（区分・機能の切り替え・公開年）のテスト。
 * admin / webapp の jest は本家の設定に差し替えて動くため、DSクラフトの実際の設定はここで検証する。
 *   pnpm test:ds
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { BS_CATEGORIES, LOAN_ACCOUNT, PL_CATEGORIES } from "./accounting/account-category";
import { ADMIN_DISABLED_PATH_PREFIXES, FEATURES, WEBAPP_DISABLED_PATH_PREFIXES, isDisabledPath } from "./features";
import { DEFAULT_PUBLIC_YEAR, FIRST_PUBLIC_YEAR, PUBLIC_YEARS } from "./public-years";

test("区分: key が重複せず、BS 科目と名前がぶつからない", () => {
  const keys = Object.values(PL_CATEGORIES).map((m) => m.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const name of Object.keys(PL_CATEGORIES)) assert.ok(!(name in BS_CATEGORIES), name);
});

test("区分: 拠出の科目は収入、貸借対照表の処理が前提にする借入金（loans）が残っている", () => {
  assert.equal(PL_CATEGORIES.運営者拠出?.type, "income");
  assert.equal(PL_CATEGORIES.家族負担?.type, "income");
  assert.equal(PL_CATEGORIES[LOAN_ACCOUNT]?.key, "loans");
});

test("区分: 政治資金の科目は含まない", () => {
  for (const name of ["個人からの寄附", "政治資金パーティーの対価に係る収入", "人件費", "選挙関係費"]) {
    assert.ok(!(name in PL_CATEGORIES), name);
  }
});

test("機能: 議員・調研費・報告書・貸借対照表は外してある", () => {
  assert.deepEqual(FEATURES, {
    politicians: false,
    researchFund: false,
    politicalReport: false,
    balanceSheet: false,
  });
});

test("機能: webapp は議員ページだけ 404、政治団体ページは出る", () => {
  const off = (p: string) => isDisabledPath(p, WEBAPP_DISABLED_PATH_PREFIXES);
  assert.ok(off("/p/sample-taro/2026"));
  assert.ok(!off("/o/ds-craft/2023"));
  assert.ok(!off("/o/ds-craft/2023/transactions"));
  assert.ok(!off("/about"));
});

test("機能: admin は議員・調研費・報告書の画面を 404、取り込みまわりは使える", () => {
  const off = (p: string) => isDisabledPath(p, ADMIN_DISABLED_PATH_PREFIXES);
  for (const p of ["/politicians", "/politicians/1/books", "/export-report", "/assign/donors", "/donors", "/counterparts/3", "/api/research-fund/books/1"]) {
    assert.ok(off(p), p);
  }
  for (const p of ["/", "/political-organizations", "/political-organizations/new", "/transactions", "/upload-csv", "/balance-snapshots", "/users", "/login"]) {
    assert.ok(!off(p), p);
  }
});

test("機能: true にすれば元に戻る", () => {
  const all = { politicians: true, researchFund: true, politicalReport: true, balanceSheet: true };
  assert.ok(!isDisabledPath("/p/sample-taro/2026", WEBAPP_DISABLED_PATH_PREFIXES, all));
  assert.ok(!isDisabledPath("/export-report", ADMIN_DISABLED_PATH_PREFIXES, all));
});

test("公開年: 2022 年から当年まで、既定は当年", () => {
  assert.equal(FIRST_PUBLIC_YEAR, 2022);
  assert.equal(PUBLIC_YEARS[0], 2022);
  assert.equal(PUBLIC_YEARS[PUBLIC_YEARS.length - 1], new Date().getFullYear());
  assert.equal(DEFAULT_PUBLIC_YEAR, new Date().getFullYear());
});
