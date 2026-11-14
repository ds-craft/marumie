"use client";
import "client-only";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FooterTextLink, getFooterTextLinks } from "@/client/lib/footer-navigation";
import { SITE, copyrightText } from "@/shared/site-config";

// リンク集（DSクラフト: 公式サイトとソースコード）
const socialLinks = [
  {
    name: "DSクラフト公式サイト",
    href: SITE.homeUrl,
    icon: "icon-web.svg",
  },
  {
    name: "GitHub",
    href: SITE.sourceUrl,
    icon: "icon-github.svg",
  },
];

function FooterLogo({ className }: { className: string }) {
  return (
    <div className={`${className} w-[120px] h-[120px] relative`}>
      <Image src={SITE.logo.src} alt={SITE.logo.alt} fill className="object-contain" />
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();

  const textLinks = getFooterTextLinks(pathname);

  const renderTextLink = (link: FooterTextLink) => {
    const isExternal = link.href.startsWith("http");
    return (
      <Link
        key={link.href}
        href={link.href}
        className="text-gray-800 text-sm font-bold leading-[1.36em] hover:opacity-80 transition-opacity"
        {...(isExternal && { target: "_blank", rel: "noopener" })}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="w-full bg-gradient-to-tl from-[#BCECD3] to-[#64D8C6] px-8 lg:px-[117px] py-12 lg:pt-12 lg:pb-9">
      <div className="max-w-[1278px] mx-auto flex flex-col items-center gap-9 lg:gap-10">
        {/* Logo - PC版のみ表示 */}
        <FooterLogo className="hidden lg:block" />

        {/* Text Links */}
        {/* SP: 2カラム縦並び / PC: 2行横並び */}
        <div className="flex flex-col gap-4 items-center">
          {/* SP: 2カラム / PC: 1行目（最初の7つ）*/}
          <div className="flex gap-[48px] lg:gap-8">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-8">
              {textLinks.slice(0, 7).map(renderTextLink)}
            </div>
            <div className="flex flex-col gap-3 lg:hidden">
              {textLinks.slice(7).map(renderTextLink)}
            </div>
          </div>

          {/* PC: 2行目（残り）*/}
          <div className="hidden lg:flex gap-8">{textLinks.slice(7).map(renderTextLink)}</div>
        </div>

        {/* SNS Icons */}
        <div className="w-[299px] lg:w-auto">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener"
                className="flex lg:flex-row items-center gap-1 lg:gap-1 hover:opacity-80 transition-opacity"
                aria-label={social.name}
              >
                <div className="w-12 h-12 lg:w-7 lg:h-7 rounded-full flex items-center justify-center relative bg-white">
                  <Image
                    src={`/images/social-icons/${social.icon}`}
                    alt={social.name}
                    width={48}
                    height={48}
                    className="lg:w-7 lg:h-7"
                  />
                </div>
                {/* PC版のみラベル表示 */}
                <span className="hidden lg:block text-base font-bold text-black">
                  {social.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Logo - SP版のみ表示 */}
        <FooterLogo className="block lg:hidden" />

        {/* Copyright・ライセンス表示 */}
        <div className="w-full text-center flex flex-col gap-2">
          <p className="text-gray-600 text-sm leading-[1.25em]">{copyrightText()}</p>
          <p className="text-gray-600 text-xs leading-[1.5em]">
            本サイトは{" "}
            <a href={SITE.upstreamUrl} target="_blank" rel="noopener" className="underline">
              {SITE.upstreamName}
            </a>{" "}
            を改変したものです（AGPL-3.0）。
            <a href={SITE.sourceUrl} target="_blank" rel="noopener" className="underline">
              ソースコード
            </a>
          </p>
          <p className="text-gray-600 text-xs leading-[1.5em]">{SITE.minecraftNotice}</p>
        </div>
      </div>
    </footer>
  );
}
