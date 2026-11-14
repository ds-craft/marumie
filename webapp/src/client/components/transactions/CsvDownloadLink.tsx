interface CsvDownloadLinkProps {
  slug: string;
  year: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * 出入金履歴の CSV のダウンロードリンク。
 * DSクラフト: 静的サイトではビルド時に書き出した /o/[slug]/[year]/transactions.csv を直接ダウンロードさせる
 * （本家は Server Action で CSV を作ってからダウンロードさせる）。
 */
export default function CsvDownloadLink({
  slug,
  year,
  className = "",
  children = "出入金履歴をCSVでダウンロード",
}: CsvDownloadLinkProps) {
  return (
    <a
      href={`/o/${encodeURIComponent(slug)}/${year}/transactions.csv`}
      download={`transactions_${slug}_${year}.csv`}
      className={className}
      style={{ fontFamily: "Noto Sans JP" }}
    >
      {children}
    </a>
  );
}
