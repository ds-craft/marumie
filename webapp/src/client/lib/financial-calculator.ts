export interface FormattedAmount {
  main: string;
  secondary: string;
  tertiary: string;
  unit: string;
}

/**
 * 金額を円単位（3桁区切り）でフォーマットする関数。
 * DSクラフトの金額は数百円〜数万円なので、本家のように万円に丸めると「0万円」「4万円」となって意味をなさない。
 * secondary / tertiary は億・万の表記の名残で、いまは常に空文字。
 */
export function formatAmount(amount: number): FormattedAmount {
  const sign = amount < 0 ? "-" : "";
  return {
    main: `${sign}${Math.round(Math.abs(amount)).toLocaleString("ja-JP")}`,
    secondary: "",
    tertiary: "",
    unit: "円",
  };
}
