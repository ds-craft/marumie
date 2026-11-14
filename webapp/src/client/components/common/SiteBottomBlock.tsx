import "server-only";
import DataNotesSection, { type DataNote } from "@/client/components/common/DataNotesSection";
import GradientMessageCard from "@/client/components/common/GradientMessageCard";
import SiteLinkCards from "@/client/components/common/SiteLinkCards";

/**
 * 全ページの本文の末尾に置く共通の下部ブロック。
 * メッセージの帯 → カード3枚 → データについて の順に並べる。
 * データについての項目は、差し替えるページだけ渡す。
 */
export default function SiteBottomBlock({ dataNotes }: { dataNotes?: DataNote[] }) {
  return (
    <>
      {/* DSクラフト: 文言は仮 */}
      <GradientMessageCard title="まだ始めたばかりです。少しずつ整えていきます🛠️">
        過去の支出の掘り起こしや電気代の計測など、公開できる範囲を少しずつ広げていきます。
      </GradientMessageCard>
      <SiteLinkCards />
      <DataNotesSection notes={dataNotes} />
    </>
  );
}
