import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/client/components/layout/footer/Footer";
import Header from "@/client/components/layout/header/Header";
import { SITE } from "@/shared/site-config";

// Noto Sans JP for Japanese text with proper weights
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  style: ["normal"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  // OG 画像などの URL を公開先の URL で書き出す（DSクラフト: 静的サイトでは WEBAPP_URL がビルド時に決まる）
  metadataBase: new URL(process.env.WEBAPP_URL || "http://localhost:3000"),
  title: `${SITE.name} - ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} - ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: "/social/og_image.png",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} - ${SITE.tagline}`,
    description: SITE.description,
    images: ["/social/og_image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head />
      <body
        className={`${notoSans.variable} ${notoSansJP.variable} antialiased pt-24 flex flex-col min-h-screen`}
      >
        <Header />
        <div className="flex-grow">{children}</div>
        <div className="mt-0 sm:mt-16">
          <Footer />
        </div>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TRACKING_ID || ""} />
      </body>
    </html>
  );
}
