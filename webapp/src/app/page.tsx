import "server-only";
import { redirect } from "next/navigation";
import { DEFAULT_PUBLIC_YEAR } from "@/shared/public-years";
import { loadOrganizations } from "@/server/contexts/public-finance/presentation/loaders/load-organizations";

/**
 * トップ（/）は既定の団体・年のページへ飛ばす（DSクラフト）。
 * 本家はページがなく、not-found からリダイレクトしている。静的サイトでは / が 404 にならないようにページを置く。
 */
export default async function RootPage() {
  const { default: defaultSlug } = await loadOrganizations();
  redirect(defaultSlug ? `/o/${defaultSlug}/${DEFAULT_PUBLIC_YEAR}` : "/about");
}
