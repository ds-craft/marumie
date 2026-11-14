import MainColumn from "@/client/components/layout/MainColumn";
import MainColumnCard from "@/client/components/layout/MainColumnCard";
import { SITE } from "@/shared/site-config";

const TEXT_CLASS =
  "text-[11px] sm:text-[15px] leading-[1.82] sm:leading-[1.87] tracking-[0.01em] text-gray-500 sm:text-gray-800 font-medium sm:font-normal font-japanese";

interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 font-japanese">{children}</h2>
  );
}

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export function Paragraph({ children, className = "" }: ParagraphProps) {
  return <p className={`${TEXT_CLASS} ${className}`}>{children}</p>;
}

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

/** 規約・ポリシーの 1 つの条（見出しと本文） */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 font-japanese">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface ListProps {
  items: React.ReactNode[];
}

export function List({ items }: ListProps) {
  return (
    <ul className={`list-disc pl-5 space-y-1 ${TEXT_CLASS}`}>
      {items.map((item, i) => (
        // 固定の文言を並べるだけで、並べ替えや追加・削除はないので添字をキーにする
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

interface TextLinkProps {
  href: string;
  children: React.ReactNode;
}

/** 本文中のリンク。外部のページは新しいタブで開く */
export function TextLink({ href, children }: TextLinkProps) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="font-bold text-[#238778] underline hover:no-underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** 問い合わせ先（利用規約・プライバシーポリシーで共通）。Discord サーバーは招待制なので、リンクは載せない */
export function ContactList() {
  return (
    <List
      items={[
        `${SITE.communityShortName}のメンバーの方: Discord サーバーのチケット`,
        <>
          メール: <TextLink href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</TextLink>
        </>,
      ]}
    />
  );
}

interface LegalPageLayoutProps {
  title: string;
  /** 制定・改定日（例: 「2026年11月15日 制定」） */
  revision: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, revision, children }: LegalPageLayoutProps) {
  return (
    <MainColumn>
      <MainColumnCard>
        <div className="space-y-9">
          <div>
            <SectionTitle>{title}</SectionTitle>
            <div className="space-y-6">{children}</div>
            <Paragraph className="mt-9 text-right">{revision}</Paragraph>
          </div>
        </div>
      </MainColumnCard>
    </MainColumn>
  );
}
