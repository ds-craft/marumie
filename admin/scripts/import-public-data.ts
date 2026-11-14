/**
 * 公開用データ（data/public）を DB に入れる（DSクラフト）
 *
 * 静的サイトのビルドでは admin を公開しないので、admin の「CSVアップロード」の代わりにこれで取り込む。
 * - organization.json の団体を slug で作成・更新する
 * - その団体の取引を mf-journal.csv の内容で入れ替える（台帳が正本なので、台帳から消した行は DB からも消える）
 * - 1 行でも取り込めない行があれば、何も書き込まずに終了コード 1 で止める
 *
 *   pnpm public:import                 # data/public を読む
 *   pnpm public:import --dir <dir>     # 別のディレクトリを読む
 *
 * 接続先は DATABASE_URL（ローカルでは .env の値）。
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PreviewTransaction } from "@/server/contexts/data-import/domain/models/preview-transaction";
import { bufferToString } from "@/server/contexts/data-import/domain/services/encoding-converter";
import {
  findImportProblems,
  parseOrganizationConfig,
} from "@/server/contexts/data-import/domain/services/public-data-import";
import { TransactionValidator } from "@/server/contexts/data-import/domain/services/transaction-validator";
import { MfCsvLoader } from "@/server/contexts/data-import/infrastructure/mf/mf-csv-loader";
import { MfRecordConverter } from "@/server/contexts/data-import/infrastructure/mf/mf-record-converter";
import { PrismaTransactionRepository } from "@/server/contexts/shared/infrastructure/repositories/prisma-transaction.repository";

// CSV の日付（2022/11/11）は実行環境のタイムゾーンの 0 時として読まれ、DB の date 型には UTC の日付で入る。
// 日本時間で動かすと前の日になってしまうので、どこで動かしても同じになるよう UTC に固定する（admin を動かす Vercel も UTC）
process.env.TZ = "UTC";

function parseArgs(argv: string[]): { dir: string } {
  const i = argv.indexOf("--dir");
  const dir = i >= 0 ? argv[i + 1] : undefined;
  if (i >= 0 && !dir) throw new Error("--dir のあとにディレクトリを指定してください");
  // pnpm --filter admin exec で動くので、既定はリポジトリ直下の data/public
  return { dir: path.resolve(dir ?? path.join(__dirname, "..", "..", "data", "public")) };
}

async function main() {
  const { dir } = parseArgs(process.argv.slice(2));
  console.log(`📂 ${dir}`);

  const organization = parseOrganizationConfig(
    JSON.parse(await readFile(path.join(dir, "organization.json"), "utf8")),
  );
  const csvContent = bufferToString(await readFile(path.join(dir, "mf-journal.csv")));

  // admin の CSV アップロードと同じ読み込み・変換・検証を通す。DB は入れ替えるので既存の取引とは比べない
  const records = await new MfCsvLoader().load(csvContent);
  const converter = new MfRecordConverter();
  const previews = new TransactionValidator().validatePreviewTransactions(
    records.map((record) => converter.convertRow(record, "0")),
  );

  const problems = findImportProblems(previews);
  if (problems.length > 0) {
    console.error(`❌ 取り込めない行が ${problems.length} 件あります（何も書き込んでいません）`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const { slug, ...fields } = organization;
    const org = await prisma.politicalOrganization.upsert({
      where: { slug },
      create: { slug, ...fields },
      update: fields,
    });
    const orgId = org.id.toString();

    const inputs = previews.map((tx) => PreviewTransaction.toCreateInput(tx, orgId));
    const deleted = await prisma.$transaction(async (tx) => {
      const { count } = await tx.transaction.deleteMany({ where: { politicalOrganizationId: org.id } });
      // 列の対応づけは admin の保存処理と同じものを使う（リポジトリは PrismaClient を受けるが、使うのは transaction だけ）
      await new PrismaTransactionRepository(tx as unknown as PrismaClient).createMany(inputs);
      return count;
    });

    console.log(`✅ 団体 ${slug}（id ${orgId}）: 取引 ${deleted} 件を消して ${inputs.length} 件を入れました`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
