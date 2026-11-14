"use client";
import "client-only";

import Link from "next/link";
import { EVIDENCE_BASE_PATH, EVIDENCE_LEVEL_LABELS } from "@/shared/public-ledger";
import type { TransactionEvidence } from "@/server/contexts/public-finance/domain/models/display-transaction";

const LINK_CLASS = "font-bold text-[#238778] underline hover:no-underline";

/** ファイル名から表示用の形式（PDF・JPG など） */
function fileKind(file: string): string {
  return file.slice(file.lastIndexOf(".") + 1).toUpperCase();
}

/**
 * DSクラフト: 取引の行に出す、証憑の確度・証憑ファイル・公開台帳の行へのリンク。
 * 公開台帳が無いとき（evidence が無いとき）は何も出さない
 */
export default function TransactionEvidenceLine({ evidence }: { evidence?: TransactionEvidence }) {
  if (!evidence) return null;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-5 text-[#4B5563]">
      <span>{EVIDENCE_LEVEL_LABELS[evidence.level]}</span>
      {evidence.file && (
        <a
          href={`${EVIDENCE_BASE_PATH}/${evidence.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASS}
        >
          証憑（{fileKind(evidence.file)}）
        </a>
      )}
      <Link href={`/ledger/#${evidence.ledgerId}`} className={LINK_CLASS}>
        台帳 {evidence.ledgerId}
      </Link>
    </span>
  );
}
