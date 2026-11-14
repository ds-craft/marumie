import "server-only";
import type { Metadata } from "next";
import LegalPageLayout, { Paragraph } from "@/client/components/layout/LegalPageLayout";
import { pageTitle } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("プライバシーポリシー"),
};

/** DSクラフト: 本家（チームみらい）のプライバシーポリシーは使えないため、内容が決まるまで準備中とする */
export default function PrivacyPage() {
  return (
    <LegalPageLayout title="プライバシーポリシー">
      <Paragraph>このページは準備中です。内容を準備しています。</Paragraph>
    </LegalPageLayout>
  );
}
