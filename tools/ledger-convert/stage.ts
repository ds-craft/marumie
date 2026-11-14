/**
 * 公開台帳と証憑を webapp に置く（静的サイトのビルドの前に実行する。pnpm build:site からも呼ぶ）
 *
 *   pnpm public:stage                       # data/public を読む
 *   PUBLIC_DATA_DIR=<dir> pnpm public:stage # 別のディレクトリを読む
 *
 * {dir}/ledger-public.csv と {dir}/evidence/ を webapp/public/evidence/ にコピーする。
 * サイトでは /evidence/ledger-public.csv・/evidence/R-YYYY-NNN.pdf として配られ、
 * webapp はビルドのときに ledger-public.csv を読んで、取引一覧の各行に証憑のリンクを付ける。
 *
 * - webapp/public/evidence/ は毎回作り直す（Git には入れない）
 * - 公開台帳に書かれた証憑ファイルが無い・ハッシュ値が違うときは、エラーで止める
 * - ledger-public.csv が無ければ（まだ公開データが無いとき）何も置かずに終わる
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { PUBLIC_LEDGER_FILE, parsePublicLedger } from "../../shared/public-ledger";

const dataDir = resolve(process.env.PUBLIC_DATA_DIR ?? "data/public");
const webappDir = resolve("webapp");
const target = join(webappDir, "public", "evidence");

const sha256 = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

function main() {
  if (!existsSync(join(webappDir, "package.json"))) {
    console.error(`エラー: ${webappDir} がありません（リポジトリの直下で実行してください）`);
    process.exit(1);
  }
  rmSync(target, { recursive: true, force: true });

  const ledgerPath = join(dataDir, PUBLIC_LEDGER_FILE);
  if (!existsSync(ledgerPath)) {
    console.warn(`警告: ${ledgerPath} がないので、公開台帳と証憑は置きません`);
    return;
  }

  const entries = parsePublicLedger(readFileSync(ledgerPath, "utf8"));
  const evidenceDir = join(dataDir, "evidence");
  const files = new Map<string, string>();
  const errors: string[] = [];
  for (const e of entries) {
    if (!e.evidenceRedactedSha256) continue;
    if (!e.evidenceFile) {
      errors.push(`${e.id}: 黒塗り版のハッシュ値があるのに evidence_file が空です（--evidence を付けて変換し直してください）`);
      continue;
    }
    if (files.has(e.evidenceFile)) continue;
    const path = join(evidenceDir, e.evidenceFile);
    if (!existsSync(path)) {
      errors.push(`${e.id}: ${path} がありません`);
      continue;
    }
    if (sha256(path) !== e.evidenceRedactedSha256) {
      errors.push(`${e.id}: ${e.evidenceFile} のハッシュ値が公開台帳と違います`);
      continue;
    }
    files.set(e.evidenceFile, path);
  }
  if (errors.length) {
    for (const e of errors) console.error(`エラー: ${e}`);
    process.exit(1);
  }

  const unused = existsSync(evidenceDir) ? readdirSync(evidenceDir).filter((f) => !files.has(f)) : [];
  for (const f of unused) console.warn(`警告: ${f} は公開台帳から参照されていないので置きません`);

  mkdirSync(target, { recursive: true });
  copyFileSync(ledgerPath, join(target, PUBLIC_LEDGER_FILE));
  for (const [name, path] of files) copyFileSync(path, join(target, name));
  console.log(`📎 ${target} に公開台帳（${entries.length} 行）と証憑 ${files.size} ファイルを置きました`);
}

main();
