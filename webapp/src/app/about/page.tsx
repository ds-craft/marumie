import "server-only";
import type { Metadata } from "next";
import SiteBottomBlock from "@/client/components/common/SiteBottomBlock";
import Breadcrumbs from "@/client/components/layout/Breadcrumbs";
import MainColumn from "@/client/components/layout/MainColumn";
import { SITE, pageTitle } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("まる見え運営資金とは"),
};

const LINK_CLASS = "font-bold text-[#238778] underline hover:no-underline";

/** 「まる見え運営資金とは」ページ。DSクラフト: 文言は仮 */
export default function AboutPage() {
  return (
    <MainColumn spacing="compact">
      <div className="flex flex-col gap-5">
        <Breadcrumbs current="まる見え運営資金とは" />
        <section
          aria-labelledby="about-title"
          className="flex flex-col gap-6 rounded-[32px] bg-white px-[18px] py-7 md:p-[clamp(28px,4.4vw,64px)]"
        >
          <h1
            id="about-title"
            className="m-0 break-keep text-[clamp(24px,2.8vw,36px)] font-black leading-[1.3] tracking-[0.01em] text-black [overflow-wrap:anywhere]"
          >
            まる見え運営資金とは
          </h1>
          <div className="flex flex-col gap-4 text-[16px] leading-[1.9] tracking-[0.02em] text-[#374151] [text-wrap:pretty]">
            <p className="m-0">
              Minecraft マルチプレイコミュニティ「{SITE.communityName}」（{SITE.communityShortName}
              ）の運営にかかったお金を公開するサイトです。サーバー機材、VPS（クラウドサーバー）、ドメインなど、何にいくら使ったかを品目ごとに見られます。
            </p>
            <p className="m-0">
              いまは運営者が費用を負担しています。運営者が払った分は、返済を受けない持ち出しとして「運営者拠出」の収入にも計上しているため、収入と支出は同じ額になります。
            </p>
            <p className="m-0">
              数え方の詳しい決まりは、このページの下の「データについて」をご覧ください。
              {SITE.communityShortName}そのものについては
              <a
                href={SITE.homeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                公式サイト
              </a>
              をご覧ください。
            </p>
          </div>
        </section>
      </div>
      <SiteBottomBlock />
    </MainColumn>
  );
}
