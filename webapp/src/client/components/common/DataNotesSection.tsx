import "server-only";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE } from "@/shared/site-config";

export const DATA_NOTE_LINK_CLASS = "font-bold text-[#238778] underline hover:no-underline";

export interface DataNote {
  title: string;
  body: ReactNode;
}

// DSクラフト: 文言は仮。運営方針が固まったら見直す
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
    body: "本サイトの収支データは、運営者が管理している台帳から作成しています。対象は、鯖缶を始めた2022年11月11日以降に、DSクラフトのために新たに購入・契約したもの（サーバー機材、VPS、ドメインなど）です。運営者が負担した費用は、返済を受けない持ち出しとして「運営者拠出」の収入にも計上しています。",
  },
  {
    title: "公開台帳と証憑",
    body: (
      <>
        収支の元になった台帳の各行と、個人情報を黒塗りした証憑（領収書・請求書）、そのハッシュ値を
        <Link href="/ledger/" className={DATA_NOTE_LINK_CLASS}>
          公開台帳と証憑
        </Link>
        のページで公開しています。取引の一覧の各行からも、その行の証憑を開けます。
      </>
    ),
  },
  {
    title: "計上していないもの",
    body: "サーバー設置先の通信費は、ほかの用途と分けられないため計上していません。運営者が元々持っていた私物を流用したものも計上していません。電気代は、計測できるようになってから「家族負担」として計上します。機材は購入した日に全額を費用としており、減価償却はしていません。",
  },
  {
    title: "免責事項",
    body: "本サイトで公開するデータは、可能な限り正確に反映するよう努めていますが、その正確性・完全性・即時性を保証するものではありません。古い支出の一部は、領収書が残っておらず、カード明細や概算から入力しています。",
  },
];

interface DataNotesSectionProps {
  /** 項目を差し替えるページだけ渡す。既定はこのサイト・データの出典と範囲・計上していないもの・免責事項 */
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
