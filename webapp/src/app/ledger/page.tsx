import "server-only";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteBottomBlock from "@/client/components/common/SiteBottomBlock";
import Breadcrumbs from "@/client/components/layout/Breadcrumbs";
import MainColumn from "@/client/components/layout/MainColumn";
import { loadPublicLedger } from "@/server/contexts/public-finance/presentation/loaders/load-public-ledger";
import {
  EVIDENCE_BASE_PATH,
  EVIDENCE_LEVEL_LABELS,
  PUBLIC_LEDGER_FILE,
  type PublicLedgerEntry,
} from "@/shared/public-ledger";
import { pageTitle } from "@/shared/site-config";

const TITLE = "公開台帳と証憑";

export const metadata: Metadata = {
  title: pageTitle(TITLE),
  description:
    "収支の元になった台帳の各行と、黒塗りした証憑（領収書・請求書）のファイル、そのハッシュ値です。",
};

const LINK_CLASS = "font-bold text-[#238778] underline hover:no-underline";
const LEDGER_CSV_HREF = `${EVIDENCE_BASE_PATH}/${PUBLIC_LEDGER_FILE}`;

const yen = (n: number) => new Intl.NumberFormat("ja-JP").format(n);
const dateLabel = (iso: string) => iso.replaceAll("-", ".");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="m-0 text-lg font-extrabold text-[#1F2937]">{title}</h2>
      {children}
    </div>
  );
}

function Hash({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-[#4B5563]">{label}</dt>
      <dd className="m-0 font-mono text-xs leading-5 text-[#1F2937] [overflow-wrap:anywhere]">
        {value || "—"}
      </dd>
    </div>
  );
}

function LedgerEntry({ entry }: { entry: PublicLedgerEntry }) {
  const isIncome = entry.type === "income";
  return (
    <li
      id={entry.id}
      className="flex scroll-mt-24 flex-col gap-3 rounded-2xl border border-[#D5DBE1] p-4 target:border-[#238778] target:ring-2 target:ring-[#238778]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-xs text-[#4B5563]">
          {entry.id}・{dateLabel(entry.date)}
        </span>
        <span className={`text-base font-bold ${isIncome ? "text-[#238778]" : "text-[#DC2626]"}`}>
          {isIncome ? "+" : "-"}
          {yen(entry.amountJpy)}
          <span className="text-[10px] font-normal text-gray-600"> 円</span>
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-800">
          {entry.item}（{entry.payee}）
        </span>
        <span className="text-xs text-[#4B5563]">
          {entry.subcategory}
          {entry.fundedBy && `・${entry.fundedBy}`}
        </span>
        {entry.publicNote && <span className="text-xs text-[#4B5563]">{entry.publicNote}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 text-xs">
        <span className="text-[#4B5563]">{EVIDENCE_LEVEL_LABELS[entry.evidenceLevel]}</span>
        {entry.evidenceFile ? (
          <a
            href={`${EVIDENCE_BASE_PATH}/${entry.evidenceFile}`}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            {entry.evidenceFile}
          </a>
        ) : (
          <span className="text-[#4B5563]">公開している証憑はありません</span>
        )}
      </div>
      {entry.evidenceId && (
        <dl className="m-0 flex flex-col gap-2">
          {entry.evidenceFile && (
            <Hash label="公開している証憑の SHA-256" value={entry.evidenceRedactedSha256} />
          )}
          <Hash label="原本の SHA-256" value={entry.evidenceSha256} />
        </dl>
      )}
    </li>
  );
}

/** DSクラフト: 公開台帳の全行・証憑・ハッシュ値と、その照合のしかた */
export default async function LedgerPage() {
  const entries = [...(await loadPublicLedger())].sort((a, b) =>
    a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date),
  );

  return (
    <MainColumn spacing="compact">
      <div className="flex flex-col gap-5">
        <Breadcrumbs current={TITLE} />
        <section
          aria-labelledby="ledger-title"
          className="flex flex-col gap-8 rounded-[32px] bg-white px-[18px] py-7 md:p-[clamp(28px,4.4vw,64px)]"
        >
          <h1
            id="ledger-title"
            className="m-0 break-keep text-[clamp(24px,2.8vw,36px)] font-black leading-[1.3] tracking-[0.01em] text-black [overflow-wrap:anywhere]"
          >
            {TITLE}
          </h1>

          <div className="flex flex-col gap-6 text-[15px] leading-[1.87] tracking-[0.01em] text-[#1F2937] [text-wrap:pretty]">
            <p className="m-0">
              このサイトの収支は、運営者が管理している台帳から作っています。台帳の各行と、その元になった領収書・請求書（証憑）を、個人情報を黒塗りしたうえで公開しています。
            </p>

            <Section title="証憑の確度">
              <ul className="m-0 flex list-disc flex-col gap-1 pl-6">
                <li>
                  <strong>証憑あり</strong>：領収書・請求書があり、その金額を計上しています。
                </li>
                <li>
                  <strong>明細から</strong>：領収書が無く、カード明細などの金額を計上しています。
                </li>
                <li>
                  <strong>概算</strong>
                  ：請求額が分からないため、計算した金額を計上しています。計算のしかたは各行の説明に書いています。
                </li>
              </ul>
            </Section>

            <Section title="黒塗りしている情報">
              <p className="m-0">
                公開している証憑では、氏名・住所・メールアドレス・アカウント
                ID・注文番号などを黒塗りしています。PDF
                はページを画像にしてから作り直しているため、黒塗りした部分の文字は残っていません。
              </p>
            </Section>

            <Section title="ハッシュ値で照合する">
              <p className="m-0">
                各証憑の
                SHA-256（ハッシュ値）を台帳に載せています。ダウンロードしたファイルのハッシュ値を計算し、「公開している証憑の
                SHA-256」と同じなら、ファイルが台帳を作ったときのものから変わっていないことを確かめられます。
              </p>
              <pre className="m-0 overflow-x-auto rounded-xl bg-[#F3F4F6] p-4 font-mono text-xs leading-6 text-[#1F2937]">
                {[
                  "# macOS / Linux",
                  "sha256sum R-2023-001.pdf",
                  "# Windows（PowerShell）",
                  "Get-FileHash R-2023-001.pdf -Algorithm SHA256",
                ].join("\n")}
              </pre>
              <p className="m-0">
                原本は個人情報を含むため公開していませんが、原本のハッシュ値も載せています。公開台帳は
                GitHub
                の公開リポジトリに置いていて変更の履歴が残るので、記録したハッシュ値をあとから書き換えていないことを確かめられます。
              </p>
            </Section>

            <Section title="ダウンロード">
              <p className="m-0">
                台帳の全行を CSV でダウンロードできます：
                <a href={LEDGER_CSV_HREF} download className={LINK_CLASS}>
                  {PUBLIC_LEDGER_FILE}
                </a>
                （UTF-8）。証憑のファイル名は「証憑ID.拡張子」で、CSV の evidence_file
                の列に書いています。
              </p>
            </Section>
          </div>

          <Section title={`台帳（${entries.length} 行・新しい順）`}>
            {entries.length > 0 ? (
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {entries.map((entry) => (
                  <LedgerEntry key={entry.id} entry={entry} />
                ))}
              </ol>
            ) : (
              <p className="m-0 text-[15px] text-[#4B5563]">公開台帳はまだありません。</p>
            )}
          </Section>
        </section>
      </div>
      <SiteBottomBlock />
    </MainColumn>
  );
}
