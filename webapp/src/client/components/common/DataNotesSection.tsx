import "server-only";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/shared/site-config";

export const DATA_NOTE_LINK_CLASS = "font-bold text-[#238778] underline hover:no-underline";

export interface DataNote {
  title: string;
  body: ReactNode;
}

// DSクラフト: 本家の政治資金向けの注記を、DSクラフトの台帳の決まりに合わせて書き直した（2026-11-15 確定）
const NOTES: DataNote[] = [
  {
    title: "まる見え運営資金について",
    body: (
      <>
        本サイトは、チームみらいが開発・公開しているオープンソースソフトウェア
        <a
          href={SITE.upstreamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={DATA_NOTE_LINK_CLASS}
        >
          「みらいまる見え政治資金」
        </a>
        （AGPL-3.0）を、{SITE.communityShortName}
        向けに改変して運用しています。チームみらいとは関係のない、{SITE.communityShortName}
        独自の公開です。改変後のソースコードは
        <a
          href={SITE.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={DATA_NOTE_LINK_CLASS}
        >
          GitHub
        </a>
        で公開しています。
      </>
    ),
  },
  {
    title: "データの出典と範囲",
    body: "本サイトの収支データは、運営者が管理している台帳から作成しています。対象は、サーバーの準備を始めた2022年11月7日以降に、DSクラフトのために新たに購入・契約したもの（サーバー機材、VPS、ドメインなど）です。運営者が負担した費用は、返済を受けない持ち出しとして「運営者拠出」の収入にも計上しています。台帳は、請求が届くたびに追記して更新します。",
  },
  {
    title: "公開台帳と証憑",
    body: (
      <>
        収支の元になった台帳の各行と、証憑（領収書・請求書）、そのハッシュ値を
        <Link href="/ledger/" className={DATA_NOTE_LINK_CLASS}>
          公開台帳と証憑
        </Link>
        のページで公開しています。取引の一覧の各行からも、その行の証憑を開けます。証憑の氏名・住所・メールアドレス・アカウント
        ID・注文番号などは黒塗りしています。
      </>
    ),
  },
  {
    title: "証憑の確度",
    body: "各行には、金額の根拠を「証憑あり」（領収書・請求書の金額）、「明細から」（領収書が無く、カード明細などの金額）、「概算」（請求額が分からず、計算した金額）の3つで示しています。概算の行は、計算のしかたを公開台帳の説明に書いています。",
  },
  {
    title: "電気代",
    body: "サーバー機器の電気代は、いまは計上していません。設置先にスマートプラグを取り付けて消費電力量を測れるようになったら、その月から「家族負担」として毎月計上する予定です（開始時期は未定）。金額は、その月の消費電力量（kWh）に目安単価31円/kWh（全国家庭電気製品公正取引協議会の電力料金目安単価）を掛けたものにします。測り始める前の電気代は計上しません。",
  },
  {
    title: "計上していないもの",
    body: "サーバー設置先の通信費は、ほかの用途と分けられないため計上していません。運営者が元々持っていた私物を流用したものも計上していません。機材は購入した日に全額を費用としており、減価償却はしていません。",
  },
  {
    title: "免責事項",
    body: "本サイトで公開するデータは、できるだけ正確に反映するよう努めていますが、その正確さ・完全さ・新しさを保証するものではありません。誤りに気づいた場合は訂正します。",
  },
];

interface DataNotesSectionProps {
  /** 項目を差し替えるページだけ渡す。既定は NOTES（このサイト・出典と範囲・公開台帳と証憑・確度・電気代・計上していないもの・免責事項） */
  notes?: DataNote[];
}

/** 下部の共通ブロックの「データについて」。 */
export default function DataNotesSection({ notes = NOTES }: DataNotesSectionProps) {
  return (
    <section
      id="explanation"
      aria-label="データについて"
      className="flex scroll-mt-24 flex-col gap-9 rounded-[32px] bg-white px-[18px] py-7 md:p-[clamp(28px,4.4vw,64px)]"
    >
      {notes.map((note) => (
        <div key={note.title}>
          <h3 className="mb-3 text-lg font-extrabold text-[#1F2937]">{note.title}</h3>
          <p className="text-[15px] leading-[1.87] tracking-[0.01em] text-[#1F2937] [text-wrap:pretty]">
            {note.body}
          </p>
        </div>
      ))}
    </section>
  );
}
