import "server-only";
import type { Metadata } from "next";
import Breadcrumbs from "@/client/components/layout/Breadcrumbs";
import MainColumn from "@/client/components/layout/MainColumn";
import { pageTitle } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("利用規約"),
};

/** DSクラフト: 本家（チームみらい）の利用規約は使えないため、内容が決まるまで準備中とする */
export default function TermsPage() {
  return (
    <MainColumn spacing="compact">
      <div className="flex flex-col gap-5">
        <Breadcrumbs current="利用規約" />
        <section
          aria-labelledby="page-title"
          className="flex flex-col gap-6 rounded-[32px] bg-white px-[18px] py-7 md:p-[clamp(28px,4.4vw,64px)]"
        >
          <span
            role="note"
            className="inline-flex h-7 items-center self-start whitespace-nowrap rounded-full border border-[#E5C34A] bg-[#FFF7D6] px-3 text-[12px] font-bold text-[#5C4A00]"
          >
            このページは準備中です
          </span>
          <h1
            id="page-title"
            className="m-0 text-[clamp(24px,2.8vw,36px)] font-black leading-[1.3] text-black"
          >
            利用規約
          </h1>
          <p className="m-0 text-[16px] leading-[1.9] text-[#374151]">内容を準備しています。</p>
        </section>
      </div>
    </MainColumn>
  );
}
