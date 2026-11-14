import "server-only";
import type { Metadata } from "next";
import LegalPageLayout, {
  ContactList,
  LegalSection,
  List,
  Paragraph,
  TextLink,
} from "@/client/components/layout/LegalPageLayout";
import { pageTitle, SITE } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("利用規約"),
};

/**
 * DSクラフト: 本家（チームみらい）の利用規約は政治団体向けなので、DSクラフト用に書き直した。
 * 公開データ（収支・公開台帳・証憑）の再利用は認めない方針（2026-11-15 に運営者が決定）。
 */
export default function TermsPage() {
  return (
    <LegalPageLayout title="利用規約" revision="2026年11月15日 制定">
      <Paragraph>
        「{SITE.name}」（以下「本サイト」）は、{SITE.operatorName}
        （以下「運営者」）が運営しています。本サイトを利用した方は、この規約に同意したものとみなします。
      </Paragraph>

      <LegalSection title="第1条（本サイトの目的）">
        <Paragraph>
          本サイトは、Minecraft マルチプレイコミュニティ「{SITE.communityName}」（
          {SITE.communityShortName}
          ）の運営にかかった費用と、その負担のしかたを、コミュニティの内外に分かりやすく示すために公開しています。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第2条（公開データの利用）">
        <Paragraph>
          本サイトに掲載している収支のデータ、公開台帳、証憑の画像・ファイル（以下「公開データ」）は、閲覧すること、および内容を確かめるために手元に保存すること（ハッシュ値の照合など）に限って利用できます。
        </Paragraph>
        <Paragraph>
          公開データの転載、再配布、改変、ほかのサービスやデータセットへの取り込みなど、それ以外の利用はお断りします。ただし、著作権法で認められる引用の範囲での利用は除きます。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第3条（ソースコード）">
        <Paragraph>
          本サイトのソースコードは、
          <TextLink href={SITE.upstreamUrl}>{SITE.upstreamName}</TextLink>
          を改変したもので、GNU Affero General Public License v3.0（AGPL-3.0）のもとで
          <TextLink href={SITE.sourceUrl}>GitHub</TextLink>
          に公開しています。ソースコードは AGPL-3.0
          に従って利用できます。前条は公開データに適用し、ソースコードには適用しません。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第4条（禁止事項）">
        <Paragraph>本サイトの利用にあたって、次のことをしてはいけません。</Paragraph>
        <List
          items={[
            "法令または公序良俗に反すること",
            "大量のアクセスなど、本サイトの運営を妨げること",
            "公開データを改ざん・加工し、誤解を招く形で示すこと",
            "運営者または第三者の権利や利益を侵害すること",
          ]}
        />
      </LegalSection>

      <LegalSection title="第5条（免責）">
        <Paragraph>
          運営者は、公開データをできるだけ正確に掲載するよう努めますが、その正確さ・完全さ・新しさを保証しません。誤りに気づいた場合は訂正します。
        </Paragraph>
        <Paragraph>
          運営者は、本サイトの利用によって生じた損害について、運営者の故意または重大な過失による場合を除き、責任を負いません。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第6条（本サイトの変更・停止）">
        <Paragraph>
          運営者は、事前に知らせることなく、本サイトの内容を変更し、または公開を停止することがあります。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第7条（規約の変更）">
        <Paragraph>
          運営者は、必要に応じてこの規約を変更することがあります。変更後の規約は、このページに掲載した時点から適用します。
        </Paragraph>
      </LegalSection>

      <LegalSection title="第8条（準拠法）">
        <Paragraph>この規約は、日本法に準拠します。</Paragraph>
      </LegalSection>

      <LegalSection title="第9条（お問い合わせ）">
        <Paragraph>本サイトに関するお問い合わせは、次のいずれかで受け付けています。</Paragraph>
        <ContactList />
      </LegalSection>
    </LegalPageLayout>
  );
}
