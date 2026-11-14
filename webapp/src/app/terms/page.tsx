import "server-only";
import type { Metadata } from "next";
import LegalPageLayout, { Paragraph } from "@/client/components/layout/LegalPageLayout";
import { pageTitle } from "@/shared/site-config";

export const metadata: Metadata = {
  title: pageTitle("利用規約"),
};

/** DSクラフト: 本家（チームみらい）の利用規約は使えないため、内容が決まるまで準備中とする */
export default function TermsPage() {
  return (
    <LegalPageLayout title="利用規約">
      <Paragraph>このページは準備中です。内容を準備しています。</Paragraph>
    </LegalPageLayout>
  );
}
