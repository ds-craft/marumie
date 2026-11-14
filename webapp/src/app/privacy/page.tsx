import "server-only";
import type { Metadata } from "next";
import LegalPageLayout, {
  ContactList,
  LegalSection,
  Paragraph,
  TextLink,
} from "@/client/components/layout/LegalPageLayout";
import { pageTitle, SITE } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("プライバシーポリシー"),
};

const GITHUB_PRIVACY_URL =
  "https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement";

/**
 * DSクラフト: 本家（チームみらい）のプライバシーポリシーは寄付の受付などを前提にしているので、DSクラフト用に書き直した。
 * 本サイトは GitHub Pages の静的サイトで、フォーム・Cookie・アクセス解析はない。これを変えたら、このページも直す。
 */
export default function PrivacyPage() {
  return (
    <LegalPageLayout title="プライバシーポリシー" revision="2026年11月15日 制定">
      <Paragraph>
        {SITE.operatorName}（以下「運営者」）は、「{SITE.name}
        」（以下「本サイト」）での個人情報の扱いを、次のとおり定めます。
      </Paragraph>

      <LegalSection title="1. 本サイトで集める情報">
        <Paragraph>
          本サイトには、入力フォームやログインの機能はありません。Cookie
          やアクセス解析ツールも使っていません。運営者が、本サイトを通じて閲覧者の個人情報を集めることはありません。
        </Paragraph>
      </LegalSection>

      <LegalSection title="2. 配信事業者が記録する情報">
        <Paragraph>
          本サイトは、GitHub, Inc. の GitHub Pages で配信しています。本サイトを閲覧すると、IP
          アドレスやブラウザーの種類などの情報が GitHub に記録されることがあります。これらの情報は
          GitHub の<TextLink href={GITHUB_PRIVACY_URL}>プライバシーに関する声明</TextLink>
          に従って扱われ、運営者が見ることはできません。
        </Paragraph>
      </LegalSection>

      <LegalSection title="3. 公開データに含まれる情報">
        <Paragraph>
          本サイトでは、{SITE.communityShortName}
          の運営にかかった費用について、日付・金額・取引先の名称・内容と、支払いの証憑を公開しています。
        </Paragraph>
        <Paragraph>
          個人の氏名・住所・電話番号・メールアドレス、各種サービスのアカウント
          ID、注文番号など、個人を特定できる情報は公開しません。証憑は、これらの情報を黒塗りしてから公開しています。
        </Paragraph>
      </LegalSection>

      <LegalSection title="4. お問い合わせで受け取る情報">
        <Paragraph>
          お問い合わせの際に受け取ったお名前・連絡先・内容は、返信と対応のためだけに使います。法令に基づく場合を除き、本人の同意なく第三者に提供することはありません。
        </Paragraph>
      </LegalSection>

      <LegalSection title="5. 掲載している情報の訂正・削除">
        <Paragraph>
          公開データにご自身の情報が含まれている、または黒塗りが不十分だと思われる場合は、お問い合わせ先までご連絡ください。確認のうえ、速やかに訂正・削除します。
        </Paragraph>
      </LegalSection>

      <LegalSection title="6. このポリシーの変更">
        <Paragraph>
          運営者は、必要に応じてこのポリシーを変更することがあります。変更後のポリシーは、このページに掲載した時点から適用します。
        </Paragraph>
      </LegalSection>

      <LegalSection title="7. お問い合わせ">
        <Paragraph>
          個人情報の扱いに関するお問い合わせは、次のいずれかで受け付けています。
        </Paragraph>
        <ContactList />
      </LegalSection>
    </LegalPageLayout>
  );
}
